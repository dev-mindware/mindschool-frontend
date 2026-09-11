"use server";
import { cookies } from "next/headers";
import { SessionPayload, verifyRole } from "./session";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY } from "@/constants";

export async function getSession(): Promise<SessionPayload | null> {
  const authCookies = await cookies();
  const accessToken = authCookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = authCookies.get(REFRESH_TOKEN_KEY)?.value;
  const roleCookie = authCookies.get(ROLE_KEY)?.value;

  const role = roleCookie ? await verifyRole(roleCookie) : null;

  // ✅ Só o refreshToken e um role válido são obrigatórios para considerar sessão válida.
  if (!refreshToken || !role) return null;

  return {
    accessToken: accessToken ?? "", // pode estar vazio/expirado — axios vai renovar
    refreshToken,
    role
  };
}