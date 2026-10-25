import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken } from "@/actions/token";
import { clearLocalSession } from "@/actions/auth";
import { redirectToLogin } from "@/lib/browser-redirect";
import { isMfaEnrollmentRequired, notifyMfaEnrollmentRequired } from "@/lib/mfa-enrollment";
import { getStepUpToken, isStepUpRequired, requestStepUp } from "@/lib/step-up";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

// ============================================================================
// CACHE & STATE
// ============================================================================

let accessTokenCache: string | null = null;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

export const resetAccessTokenCache = () => {
  accessTokenCache = null;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

// Rotas de auth pública — não enviam Authorization
const PUBLIC_AUTH_ROUTES = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

// Rotas que NUNCA devem disparar refresh (evita loops)
const NO_REFRESH_ROUTES = [
  "/auth/login",
  "/auth/logout",
  "/api/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

// Rotas críticas de auth — 404 aqui = sessão morta
const AUTH_CRITICAL_ROUTES = [
  "/auth/profile",
  "/api/auth/refresh",
] as const;

// ============================================================================
// HELPERS
// ============================================================================

function matchRoute(url: string, route: string): boolean {
  const cleanUrl = url.split("?")[0];
  const cleanUrlWithoutLeading = cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl;
  const routeWithoutLeading = route.startsWith("/") ? route.slice(1) : route;
  return (
    cleanUrlWithoutLeading === routeWithoutLeading ||
    cleanUrlWithoutLeading.endsWith("/" + routeWithoutLeading)
  );
}

function isPublicAuthRoute(url: string): boolean {
  return PUBLIC_AUTH_ROUTES.some((r) => matchRoute(url, r));
}

function shouldSkipRefresh(url: string): boolean {
  return NO_REFRESH_ROUTES.some((r) => matchRoute(url, r));
}

function isAuthCriticalRoute(url: string): boolean {
  return AUTH_CRITICAL_ROUTES.some((r) => matchRoute(url, r));
}

/**
 * Dispara evento global para sincronizar componentes (ex: useAuthStore)
 */
function dispatchSessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("session:expired"));
  }
}

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3011/api/v1",
  headers: {
    "Content-Type": "application/json",
    // A API MindEscola devolve os tokens no corpo (modo bearer): a sessao fica nos cookies httpOnly do Next.
    "x-auth-mode": "bearer",
  },
  timeout: 30000,
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const url = config.url || "";

  // Ajusta baseURL no browser se acedido a partir de outro dispositivo (ex.: telemóvel na mesma rede)
  if (typeof window !== "undefined" && config.baseURL) {
    try {
      const parsed = new URL(config.baseURL);
      if (
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
        window.location.hostname &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        parsed.hostname = window.location.hostname;
        config.baseURL = parsed.toString().replace(/\/$/, "");
      }
    } catch {
      // Ignora erro de parsing e mantém baseURL original
    }
  }

  // --------------------------------------------------------------------------
  // 1. ANEXA TOKEN (exceto em rotas públicas de auth ou se o pedido já tem Authorization explícito)
  // --------------------------------------------------------------------------
  if (!isPublicAuthRoute(url) && !config.headers.Authorization) {
    let token: string | null = null;

    if (typeof window !== "undefined") {
      // No browser: usa cache de memória para evitar round-trips de Server Action em cada pedido
      if (!accessTokenCache) {
        accessTokenCache = await getAccessToken();
      }
      token = accessTokenCache;
    } else {
      // No servidor (Server Actions / SSR): NUNCA partilha cache em memória entre sessões/dispositivos
      token = await getAccessToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Token de reautenticação (step-up) ainda válido: segue em todos os pedidos autenticados.
  const stepUp = getStepUpToken();
  if (stepUp && !isPublicAuthRoute(url)) config.headers["X-Step-Up-Token"] = stepUp;

  // --------------------------------------------------------------------------
  // 2. ROTAS DA ESCOLA: "/s/students" -> "/schools/{schoolId}/students"
  // --------------------------------------------------------------------------
  if (url.startsWith("/s/") || url === "/s") {
    const schoolId = useActiveSchoolStore.getState().schoolId;
    if (!schoolId) {
      return Promise.reject(new Error("Nenhuma escola seleccionada."));
    }
    config.url = `/schools/${schoolId}${url.slice(2)}`;
  }

  return config;
});

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Guarda contra config undefined (acontece em network errors)
    if (!original || !original.url) {
      return Promise.reject(err);
    }

    const status = err.response?.status;

    // ------------------------------------------------------------------------
    // CASO 1: Rotas que não devem tentar refresh (evita loops)
    // ------------------------------------------------------------------------
    if (shouldSkipRefresh(original.url) || original._retry) {
      return Promise.reject(err);
    }

    // ------------------------------------------------------------------------
    // CASO 2: 404 em rota crítica de auth = sessão morta
    // ------------------------------------------------------------------------
    if (status === 404 && isAuthCriticalRoute(original.url)) {
      if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
        return Promise.reject(err);
      }
      console.warn("🚨 [API] 404 em rota crítica de auth. Forçando logout.");
      resetAccessTokenCache();
      try {
        await clearLocalSession();
      } catch (clearErr) {
        console.error("Erro ao limpar sessão local no interceptor (404):", clearErr);
      }
      dispatchSessionExpired();
      redirectToLogin(); // ✅ Usa o helper testável
      return Promise.reject(err);
    }

    // ------------------------------------------------------------------------
    // CASO 2b: operação crítica pede reautenticação (step-up): confirma a identidade e repete o pedido
    // ------------------------------------------------------------------------
    if (status === 401 && isStepUpRequired(err.response?.data)) {
      const token = await requestStepUp();
      original._retry = true;
      original.headers = { ...(original.headers ?? {}), "X-Step-Up-Token": token } as typeof original.headers;
      return api(original);
    }

    // ------------------------------------------------------------------------
    // CASO 3: 401 → tenta refresh transparente
    // ------------------------------------------------------------------------
    if (status === 401) {
      if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
        return Promise.reject(err);
      }
      // Já tem refresh em andamento → entra na fila
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (original.headers) {
              (original.headers as any).Authorization = `Bearer ${token}`;
            }
            return api(original);
          })
          .catch((queueErr) => Promise.reject(queueErr));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Usa axios direto (sem interceptor) para evitar recursão
        // withCredentials para enviar cookies httpOnly
        const response = await axios.post(
          "/api/auth/refresh",
          {},
          {
            timeout: 10000,
            withCredentials: true,
          }
        );

        const newToken = response.data?.accessToken;

        if (!newToken) {
          throw new Error("Novo access token não recebido após reautenticação");
        }

        accessTokenCache = newToken;
        processQueue(null, newToken);

        if (original.headers) {
          (original.headers as any).Authorization = `Bearer ${newToken}`;
        }

        return api(original);
      } catch (refreshError) {
        // Refresh falhou → sessão definitivamente morta
        console.error("🚨 [API] Erro ao renovar token:", refreshError);
        resetAccessTokenCache();
        processQueue(refreshError, null);
        try {
          await clearLocalSession();
        } catch (clearErr) {
          console.error("Erro ao limpar sessão local no interceptor (refresh):", clearErr);
        }
        dispatchSessionExpired();
        redirectToLogin(); // ✅ Usa o helper testável
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ------------------------------------------------------------------------
    // CASO 4: 403 → autenticado mas sem permissão (não desloga)
    // ------------------------------------------------------------------------
    if (status === 403) {
      console.warn("⛔ [API] 403 Forbidden:", original.url);
      if (isMfaEnrollmentRequired(err.response?.data)) notifyMfaEnrollmentRequired(); // a janela leva o utilizador a ativar o 2.º factor
      // Deixa o RouteProtector / UI tratar
    }

    // ------------------------------------------------------------------------
    // CASO 5: 5xx → erro de servidor (não desloga)
    // ------------------------------------------------------------------------
    if (status && status >= 500) {
      console.error("🔥 [API] Erro de servidor:", status, original.url);
    }

    return Promise.reject(err);
  }
);

// Mensagem legivel nos erros (RFC 9457 da API: detail / errors[0].message), para quem usa so error.message.
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ detail?: string; errors?: Array<{ message?: string }> }>) => {
    const data = err.response?.data;
    const msg = data?.errors?.[0]?.message || data?.detail;
    if (typeof msg === "string" && msg) err.message = msg;
    return Promise.reject(err);
  },
);

export default api;
