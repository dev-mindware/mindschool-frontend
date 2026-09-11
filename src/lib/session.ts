import { cookies } from "next/headers";
import { Role } from "@/types";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ROLE_KEY,
} from "@/constants/routes";

// Validação obrigatória em produção
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET não definido em produção. Configure a variável de ambiente."
  );
}

const fallbackSecret =
  process.env.NODE_ENV !== "production" ? "dev-session-secret-change-me" : "";

const secretKey = process.env.SESSION_SECRET || fallbackSecret;
export const encodedKey = new TextEncoder().encode(secretKey);

export async function signRole(role: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encodedKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(role)
  );
  const hashHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${role}.${hashHex}`;
}

export async function verifyRole(cookieValue: string): Promise<Role | null> {
  if (!cookieValue) return null;
  const [role, hash] = cookieValue.split(".");
  if (!role || !hash) return null;

  const expectedSigned = await signRole(role);
  const [, expectedHash] = expectedSigned.split(".");

  if (hash === expectedHash) {
    return role as Role;
  }
  return null;
}

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

// Configuração base de cookie segura
const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  // ✅ FIX: secure só em produção (localhost usa http)
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

// ✅ FIX: Access token com tempo mais razoável (24 horas)
// Se quiseres manter 4min, IMPLEMENTA refresh transparente no axios
const ACCESS_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export async function createSession(payload: SessionPayload) {
  const accessExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const authCookies = await cookies();
  const signedRole = await signRole(payload.role);

  authCookies.set(ACCESS_TOKEN_KEY, payload.accessToken, {
    ...baseCookieOptions,
    expires: accessExpiresAt,
  });

  authCookies.set(REFRESH_TOKEN_KEY, payload.refreshToken, {
    ...baseCookieOptions,
    expires: refreshExpiresAt,
  });

  authCookies.set(ROLE_KEY, signedRole, {
    ...baseCookieOptions,
    expires: refreshExpiresAt,
  });
}

export async function destroySession() {
  const authCookies = await cookies();

  authCookies.delete(ACCESS_TOKEN_KEY);
  authCookies.delete(REFRESH_TOKEN_KEY);
  authCookies.delete(ROLE_KEY);
}

/**
 * Atualiza apenas o access token (após refresh bem-sucedido).
 */
export async function refreshAccessToken(newAccessToken: string) {
  const authCookies = await cookies();
  const accessExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);

  authCookies.set(ACCESS_TOKEN_KEY, newAccessToken, {
    ...baseCookieOptions,
    expires: accessExpiresAt,
  });
}

/* import { Role } from "@/types";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY } from "@/constants";

const fallbackSecret =
  process.env.NODE_ENV !== "production"
    ? "dev-session-secret-change-me"
    : "";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET não definido em produção. Configure a variável de ambiente SESSION_SECRET.",
  );
}

const secretKey = process.env.SESSION_SECRET || fallbackSecret;

export const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export async function createSession(payload: SessionPayload) {
  const accessExpiresAt = new Date(Date.now() + 4 * 60 * 1000);
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const authCookies = await cookies();

  authCookies.set(ACCESS_TOKEN_KEY, payload.accessToken, {
    httpOnly: true,
    secure: true,
    expires: accessExpiresAt,
    sameSite: "lax",
    path: "/",
  });

  authCookies.set(REFRESH_TOKEN_KEY, payload.refreshToken, {
    httpOnly: true,
    secure: true,
    expires: refreshExpiresAt,
    sameSite: "lax",
    path: "/",
  });

   authCookies.set(ROLE_KEY, payload.role, {
    httpOnly: true,
    secure: true,
    expires: refreshExpiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function destroySession() {
  const authCookies = await cookies();

  authCookies.delete(ACCESS_TOKEN_KEY);
  authCookies.delete(REFRESH_TOKEN_KEY);
  authCookies.delete(ROLE_KEY);
}
 */