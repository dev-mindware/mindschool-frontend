import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios, { AxiosError } from "axios";
import { createSession, verifyRole } from "@/lib/session";
import { clearLocalSession } from "@/actions/auth";
import { REFRESH_TOKEN_KEY, ROLE_KEY } from "@/constants/routes";
import { isValidRole } from "@/utils/role-redirects";

// ============================================================================
// CONFIG
// ============================================================================

const REFRESH_TIMEOUT_MS = 10_000;

// ============================================================================
// CORS / ORIGIN VALIDATION
// ============================================================================

/**
 * Valida que o request vem da nossa própria app (proteção CSRF extra).
 * ✅ FIX: fail closed — se não conseguir validar, recusa.
 */
function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");

  // Sem origem (server-side, curl) — recusa
  if (!origin) return false;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // ✅ FIX: fail closed — sem config = recusa (não permite tudo)
  if (!appUrl) {
    console.error(
      "🚨 [Refresh] NEXT_PUBLIC_APP_URL não configurada — refresh bloqueado por segurança."
    );
    return false;
  }

  try {
    const allowed = new URL(appUrl);
    const current = new URL(origin);

    // ✅ FIX: normaliza portos default (80/443) vs string vazia
    const normalizePort = (proto: string, port: string): string => {
      if (port) return port;
      if (proto === "https:") return "443";
      if (proto === "http:") return "80";
      return "";
    };

    return (
      allowed.protocol === current.protocol &&
      allowed.hostname === current.hostname &&
      normalizePort(allowed.protocol, allowed.port) ===
        normalizePort(current.protocol, current.port)
    );
  } catch {
    return false;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

interface ErrorResponse {
  message: string;
  details?: string;
  code?: string;
}

function jsonError(
  message: string,
  status: number,
  extra?: Partial<ErrorResponse>
): NextResponse {
  return NextResponse.json<ErrorResponse>(
    { message, ...extra },
    { status }
  );
}

/**
 * Determina se um erro deve invalidar a sessão.
 * Só desloga em 401/403 — erros transitórios (500, 503, network) NÃO deslogam.
 */
function shouldInvalidateSession(error: AxiosError): boolean {
  const status = error.response?.status;
  return status === 401 || status === 403;
}

// ============================================================================
// POST /api/auth/refresh
// ============================================================================

export async function POST(req: NextRequest) {
  // --------------------------------------------------------------------------
  // 1. Valida origem (proteção CSRF)
  // --------------------------------------------------------------------------
  if (!isAllowedOrigin(req)) {
    return jsonError("Origem não autorizada", 403, {
      code: "INVALID_ORIGIN",
    });
  }

  // --------------------------------------------------------------------------
  // 2. Lê refresh token do cookie httpOnly
  // --------------------------------------------------------------------------
  const authCookies = await cookies();
  const refreshToken = authCookies.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) {
    // ✅ 401 — frontend trata como sessão morta
    return jsonError("Sessão expirada", 401, {
      code: "NO_REFRESH_TOKEN",
    });
  }

  // --------------------------------------------------------------------------
  // 3. Chama o backend para renovar
  // --------------------------------------------------------------------------
  let backendResponse;

  try {
    backendResponse = await axios.post<{ access_token: string; refresh_token: string }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        timeout: REFRESH_TIMEOUT_MS,
        headers: { "Content-Type": "application/json", "x-auth-mode": "bearer" },
      }
    );
  } catch (error) {
    const axiosError = error as AxiosError;

    console.error("🚨 [Refresh] Erro ao chamar backend:", {
      status: axiosError.response?.status,
      message: axiosError.message,
      code: axiosError.code,
    });

    // ✅ FIX: só limpa sessão se for erro de autenticação (401/403)
    if (shouldInvalidateSession(axiosError)) {
      await clearLocalSession();
      return jsonError("Refresh token inválido ou expirado", 401, {
        code: "REFRESH_TOKEN_INVALID",
      });
    }

    // ✅ Timeout — não desloga, deixa o utilizador tentar de novo
    if (axiosError.code === "ECONNABORTED") {
      return jsonError("Timeout ao renovar sessão", 504, {
        code: "REFRESH_TIMEOUT",
      });
    }

    // ✅ Erros de rede ou 5xx — não desloga (transitório)
    return jsonError("Erro ao comunicar com o servidor de autenticação", 502, {
      code: "BACKEND_UNAVAILABLE",
      details: axiosError.message,
    });
  }

  // --------------------------------------------------------------------------
  // 4. Valida resposta do backend
  // --------------------------------------------------------------------------
  const data = backendResponse.data;

  if (!data?.access_token || !data?.refresh_token) {
    console.error("🚨 [Refresh] Resposta do backend com estrutura inválida");
    await clearLocalSession();
    return jsonError("Resposta de autenticação inválida", 500, { code: "INVALID_BACKEND_RESPONSE" });
  }

  // A API nao devolve o papel no refresh: mantem-se o do cookie assinado (so o servidor o escreve).
  const roleCookie = authCookies.get(ROLE_KEY)?.value;
  const role = roleCookie ? await verifyRole(roleCookie) : null;
  if (!isValidRole(role)) {
    await clearLocalSession();
    return jsonError("Role inválido", 401, { code: "INVALID_ROLE" });
  }

  // --------------------------------------------------------------------------
  // 5. Cria nova sessão (atualiza todos os cookies)
  // --------------------------------------------------------------------------
  try {
    await createSession({ accessToken: data.access_token, refreshToken: data.refresh_token, role });
  } catch (sessionError) {
    console.error("🚨 [Refresh] Erro ao criar sessão:", sessionError);
    return jsonError("Erro ao persistir sessão", 500, {
      code: "SESSION_CREATE_FAILED",
    });
  }

  // --------------------------------------------------------------------------
  // 6. Retorna o novo access token para o cliente
  // --------------------------------------------------------------------------
  return NextResponse.json(
    {
      success: true,
      accessToken: data.access_token,
    },
    {
      status: 200,
      headers: {
        // ✅ Garante que esta resposta nunca seja cacheada
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}

// ============================================================================
// MÉTODOS NÃO PERMITIDOS
// ============================================================================

// ✅ FIX: bloqueia explicitamente GET/PUT/DELETE etc.
export async function GET() {
  return jsonError("Método não permitido", 405);
}