"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, IMPERSONATION_BACKUP_KEY, IMPERSONATION_RETURN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY } from "@/constants/routes";
import { destroySession, signRole } from "@/lib/session";
import { resetAccessTokenCache } from "@/services/api";
import { type ApiMe, primaryRoleOf } from "@/utils/map-api-user";
import { getRouteByRole } from "@/utils/role-redirects";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3011/api/v1";
const COOKIE = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
const HOUR = 3_600_000;

interface Backup { a: string; r: string; role: string }
export interface ImpersonationActionResult { ok: boolean; redirectPath?: string; message?: string }

/** Chamadas à API com um token explícito (o cliente `api` anexaria o token do administrador e sobrepor-se-ia ao indicado). */
async function call<T>(path: string, token: string, method: "GET" | "POST" = "GET"): Promise<{ ok: boolean; data?: T }> {
  try {
    const res = await fetch(`${API}${path}`, { method, headers: { authorization: `Bearer ${token}`, "x-auth-mode": "bearer", "content-type": "application/json" }, ...(method === "POST" ? { body: "{}" } : {}), cache: "no-store" });
    return res.ok ? { ok: true, data: (await res.json()) as T } : { ok: false };
  } catch {
    return { ok: false };
  }
}

/**
 * Entra numa personificação: guarda a sessão do administrador (cookie httpOnly) e passa a usar o token da sessão assumida,
 * que não tem refresh e expira com a personificação. O navegador assume então o papel do utilizador-alvo.
 */
export async function enterImpersonationAction(v: { accessToken: string; expiresAt: string; schoolId: string }): Promise<ImpersonationActionResult> {
  const jar = await cookies();
  if (jar.get(IMPERSONATION_BACKUP_KEY)) return { ok: false, message: "Já existe uma personificação ativa: termine-a primeiro." };
  const backup: Backup = { a: jar.get(ACCESS_TOKEN_KEY)?.value ?? "", r: jar.get(REFRESH_TOKEN_KEY)?.value ?? "", role: jar.get(ROLE_KEY)?.value ?? "" };
  if (!backup.a || !backup.r) return { ok: false, message: "A sessão do administrador não foi encontrada. Inicie sessão de novo." };

  const me = await call<ApiMe>("/auth/me", v.accessToken);
  const role = me.data ? primaryRoleOf(me.data, v.schoolId) : null;
  if (!role) return { ok: false, message: "Não foi possível determinar o papel do utilizador nesta escola." };

  const expires = new Date(v.expiresAt);
  jar.set(IMPERSONATION_BACKUP_KEY, JSON.stringify(backup), { ...COOKIE, expires: new Date(expires.getTime() + HOUR) });
  jar.set(ACCESS_TOKEN_KEY, v.accessToken, { ...COOKIE, expires });
  jar.delete(REFRESH_TOKEN_KEY);
  jar.set(ROLE_KEY, await signRole(role), { ...COOKIE, expires });
  resetAccessTokenCache();
  return { ok: true, redirectPath: getRouteByRole(role) };
}

/** Termina a personificação (revoga-a na API) e repõe a sessão do administrador. Se já não houver cópia, volta ao início de sessão. */
export async function leaveImpersonationAction(): Promise<ImpersonationActionResult> {
  const jar = await cookies();
  const current = jar.get(ACCESS_TOKEN_KEY)?.value;
  const raw = jar.get(IMPERSONATION_BACKUP_KEY)?.value;
  if (current) await call("/auth/impersonation/stop", current, "POST"); // se já expirou, não há nada a revogar

  let backup: Backup | null = null;
  try { backup = raw ? (JSON.parse(raw) as Backup) : null; } catch { backup = null; }
  resetAccessTokenCache();
  // personificação iniciada no painel (outro domínio): termina-se a sessão assumida e volta-se ao painel
  const panel = jar.get(IMPERSONATION_RETURN_KEY)?.value;
  if (panel) {
    jar.delete(IMPERSONATION_RETURN_KEY);
    if (backup?.a && backup.r && backup.role) {
      jar.set(ACCESS_TOKEN_KEY, backup.a, { ...COOKIE, expires: new Date(Date.now() + 24 * HOUR) });
      jar.set(REFRESH_TOKEN_KEY, backup.r, { ...COOKIE, expires: new Date(Date.now() + 7 * 24 * HOUR) });
      jar.set(ROLE_KEY, backup.role, { ...COOKIE, expires: new Date(Date.now() + 7 * 24 * HOUR) });
      jar.delete(IMPERSONATION_BACKUP_KEY);
    } else {
      await destroySession();
    }
    return { ok: true, redirectPath: panel };
  }
  if (!backup?.a || !backup.r || !backup.role) {
    await destroySession();
    return { ok: false, redirectPath: "/auth/login", message: "A sessão do administrador expirou. Inicie sessão de novo." };
  }
  jar.set(ACCESS_TOKEN_KEY, backup.a, { ...COOKIE, expires: new Date(Date.now() + 24 * HOUR) });
  jar.set(REFRESH_TOKEN_KEY, backup.r, { ...COOKIE, expires: new Date(Date.now() + 7 * 24 * HOUR) });
  jar.set(ROLE_KEY, backup.role, { ...COOKIE, expires: new Date(Date.now() + 7 * 24 * HOUR) });
  jar.delete(IMPERSONATION_BACKUP_KEY);
  return { ok: true, redirectPath: "/admin/users" };
}
