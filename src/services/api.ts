import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken } from "@/actions/token";
import { clearLocalSession } from "@/actions/auth";
import { currentStoreStore } from "@/stores";
import { redirectToLogin } from "@/lib/browser-redirect"; // ✅ NOVO

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
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

// Rotas que NUNCA devem disparar refresh (evita loops)
const NO_REFRESH_ROUTES = [
  "/auth/login",
  "/auth/logout",
  "/api/auth/refresh",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

// Rotas críticas de auth — 404 aqui = sessão morta
const AUTH_CRITICAL_ROUTES = [
  "/auth/profile",
  "/api/auth/refresh",
] as const;

// Rotas que requerem injeção de storeId
const STORE_DEPENDENT_ROUTES: (
  | string
  | { path: string; methods: string[] }
)[] = [
    { path: "invoice", methods: ["get", "post"] },
    "items",
    { path: "stocks", methods: ["get"] },
    { path: "cash-sessions", methods: ["get", "post"] },
    "reports/dashboard",
    { path: "reports/export", methods: ["get"] },
    "receipt",
    "documents",
    "dashboard",
    "stock-reservations",
    { path: "credit-note", methods: ["get"] },
    { path: "categories", methods: ["get", "post"] },
  ];

// Rotas excluídas da injeção de storeId
const EXCLUDED_STORE_ROUTES = [
  "/expenses",
  "receipt",
  "/close",
  "global",
  "public",
  "/suppliers",
  "overview",
  "reports/dashboard/overview",
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
    process.env.NEXT_PUBLIC_API_URL || "https://mindgest.mindware-vps.cloud/api",
  headers: {
    "Content-Type": "application/json",
    ...(process.env.NEXT_PUBLIC_API_KEY ? { "x-api-key": process.env.NEXT_PUBLIC_API_KEY } : {}),
  },
  timeout: 30000,
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const url = config.url || "";

  // --------------------------------------------------------------------------
  // 1. ANEXA TOKEN (exceto em rotas públicas de auth)
  // --------------------------------------------------------------------------
  if (!isPublicAuthRoute(url)) {
    if (!accessTokenCache) {
      accessTokenCache = await getAccessToken();
    }

    if (accessTokenCache) {
      config.headers.Authorization = `Bearer ${accessTokenCache}`;
    }
  }

  // --------------------------------------------------------------------------
  // 2. INJETA storeId NAS ROTAS QUE DEPENDEM DELE
  // --------------------------------------------------------------------------
  const currentMethod = config.method?.toLowerCase() || "";

  const matchingRoute = STORE_DEPENDENT_ROUTES.find((route) => {
    const routePath = typeof route === "string" ? route : route.path;
    return url.includes(routePath);
  });

  const isExcluded = EXCLUDED_STORE_ROUTES.some((route) => url.includes(route));

  const shouldInject =
    url &&
    matchingRoute &&
    !isExcluded &&
    (typeof matchingRoute === "string" ||
      matchingRoute.methods.includes(currentMethod));

  if (shouldInject) {
    const currentStore = currentStoreStore.getState().currentStore;

    if (currentStore?.id) {
      // GET → injeta em params
      if (currentMethod === "get") {
        config.params = {
          ...config.params,
          storeId: config.params?.storeId || currentStore.id,
        };
      }
      // POST/PUT/PATCH com data objeto → injeta em data
      else if (
        config.data &&
        typeof config.data === "object" &&
        !config.data.storeId
      ) {
        config.data = {
          ...config.data,
          storeId: currentStore.id,
        };
      }
      // POST/PUT/PATCH sem data → cria com storeId
      else if (
        !config.data &&
        ["post", "put", "patch"].includes(currentMethod)
      ) {
        config.data = { storeId: currentStore.id };
      }
    }
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
    // CASO 3: 401 → tenta refresh transparente
    // ------------------------------------------------------------------------
    if (status === 401) {
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

export default api;
