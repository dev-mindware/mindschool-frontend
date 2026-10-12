import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY, IMPERSONATION_BACKUP_KEY, IMPERSONATION_RETURN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY } from "@/constants/routes";
import { signRole } from "@/lib/session";
import { type ApiMe, primaryRoleOf } from "@/utils/map-api-user";
import { getRouteByRole } from "@/utils/role-redirects";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3011/api/v1";
const APP = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
/** Origens do painel de administração autorizadas a receber o utilizador de volta (evita redirecionamentos abertos). */
const PANEL_ORIGINS = (process.env.ADMIN_PANEL_ORIGINS || "http://localhost:3009,http://localhost:3000").split(",").map((o) => o.trim()).filter(Boolean);
const COOKIE = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
const HOUR = 3_600_000;

interface Exchange { access_token: string; expires_at: string; school_id: string }

const safeReturn = (raw: string | null) => {
  try {
    const u = new URL(raw ?? "");
    return PANEL_ORIGINS.includes(u.origin) ? u.toString() : null;
  } catch {
    return null;
  }
};

/**
 * Entrada de uma personificação iniciada no painel de administração (domínio diferente). O painel envia um código de uso único (60 s);
 * aqui troca-se pelo token (nunca viaja no URL), guarda-se a sessão e abre-se o ambiente do utilizador com a faixa «A actuar como…».
 */
export async function GET(req: NextRequest) {
  const fail = (code: string) => NextResponse.redirect(new URL(`/auth/login?erro=${code}`, APP));
  const code = req.nextUrl.searchParams.get("code");
  const back = safeReturn(req.nextUrl.searchParams.get("return"));
  if (!code) return fail("personificacao");

  let ex: Exchange | null = null;
  try {
    const res = await fetch(`${API}/auth/impersonation/exchange`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }), cache: "no-store" });
    ex = res.ok ? ((await res.json()) as Exchange) : null;
  } catch {
    ex = null;
  }
  if (!ex) return fail("personificacao");

  const meRes = await fetch(`${API}/auth/me`, { headers: { authorization: `Bearer ${ex.access_token}`, "x-auth-mode": "bearer" }, cache: "no-store" }).catch(() => null);
  const me = meRes?.ok ? ((await meRes.json()) as ApiMe) : null;
  const role = me ? primaryRoleOf(me, ex.school_id) : null;
  if (!role) return fail("personificacao");

  const jar = await cookies();
  const expires = new Date(ex.expires_at);
  // se este navegador já tinha uma sessão, guarda-se para a repor ao terminar
  const a = jar.get(ACCESS_TOKEN_KEY)?.value ?? "";
  const r = jar.get(REFRESH_TOKEN_KEY)?.value ?? "";
  if (a && r && !jar.get(IMPERSONATION_BACKUP_KEY)) jar.set(IMPERSONATION_BACKUP_KEY, JSON.stringify({ a, r, role: jar.get(ROLE_KEY)?.value ?? "" }), { ...COOKIE, expires: new Date(expires.getTime() + HOUR) });
  if (back) jar.set(IMPERSONATION_RETURN_KEY, back, { ...COOKIE, expires: new Date(expires.getTime() + HOUR) });
  jar.set(ACCESS_TOKEN_KEY, ex.access_token, { ...COOKIE, expires });
  jar.delete(REFRESH_TOKEN_KEY);
  jar.set(ROLE_KEY, await signRole(role), { ...COOKIE, expires });
  return NextResponse.redirect(new URL(getRouteByRole(role), APP));
}
