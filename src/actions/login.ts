"use server";

import { z } from "zod";
import { Role, User } from "@/types";
import { ApiMe, ApiSubscription, mapApiSubscription, mapApiUser, primaryRoleOf } from "@/utils/map-api-user";
import { loginSchema } from "@/schemas";
import { api } from "@/services/api";
import { createSession, destroySession } from "@/lib/session";
import { getSession } from "@/lib/auth";
import { getRouteByRole } from "@/utils/role-redirects";
import { resetAccessTokenCache } from "@/services/api";
import { getApiErrorMessage } from "@/utils/api-error";

interface LoginActionResult {
  user: User | null;
  redirectPath?: string;
  message?: string;
  token?: string;
  /** A conta tem segundo factor: pedir o codigo (TOTP/recuperacao) e repetir o login. */
  requiresMfa?: boolean;
  mfaMethods?: string[];
  memberships?: Array<{ schoolId: string; schoolName: string; roles: string[] }>;
}

interface ApiLogin {
  access_token: string;
  refresh_token: string;
}

export async function loginAction({
  email,
  password,
  totpCode,
}: z.infer<typeof loginSchema>): Promise<LoginActionResult> {
  resetAccessTokenCache();
  try {
    const res = await api.post<ApiLogin>("/auth/login", {
      email,
      password,
      ...(totpCode ? { totp_code: totpCode } : {}),
    });
    const { access_token: accessToken, refresh_token: refreshToken } = res.data;
    if (!accessToken || !refreshToken) {
      return {
        user: null,
        redirectPath: "/auth/login",
        message: "Não foi possível validar o início de sessão. Tente novamente dentro de instantes.",
      };
    }

    const meRes = await api.get<ApiMe>("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } });
    const me = meRes.data;
    const role = primaryRoleOf(me);
    if (!role) {
      return { user: null, redirectPath: "/auth/login", message: "A sua conta ainda não está associada a nenhuma escola." };
    }

    await createSession({ accessToken, refreshToken, role });

    const authHeader = { headers: { Authorization: `Bearer ${accessToken}` } };
    const activeSchoolId = me.memberships[0]?.school_id;
    const sub = activeSchoolId
      ? await api.get<ApiSubscription>(`/schools/${activeSchoolId}/subscription/entitlements`, authHeader).then((r) => mapApiSubscription(r.data)).catch(() => undefined)
      : undefined;

    return {
      user: mapApiUser(me, activeSchoolId, sub),
      redirectPath: getRouteByRole(role),
      token: accessToken,
      memberships: me.memberships.map((m) => ({ schoolId: m.school_id, schoolName: m.school_name, roles: m.roles, viaGroup: m.via_group === true })),
    };
  } catch (error: unknown) {
    const errObj = error as { response?: { data?: { code?: string; methods?: string[] } } };
    const problem = errObj?.response?.data;
    if (problem?.code === "MFA_REQUIRED") {
      return {
        user: null,
        requiresMfa: true,
        mfaMethods: problem.methods ?? ["totp"],
        message: "Introduza o código de verificação em dois factores para concluir o acesso.",
      };
    }

    return {
      user: null,
      redirectPath: "/auth/login",
      message: getApiErrorMessage(
        error,
        "Não foi possível iniciar sessão. Verifique o seu e-mail e palavra-passe e tente novamente.",
      ),
    };
  }
}

export async function resetPasswordAndLoginAction({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}): Promise<LoginActionResult> {
  try {
    const res = await api.post<ApiLogin>(
      "/auth/reset-password?login=true",
      { token, password: newPassword },
      { headers: { "X-Auth-Mode": "bearer" } },
    );
    const { access_token: accessToken, refresh_token: refreshToken } = res.data;
    if (!accessToken || !refreshToken) {
      return { user: null, redirectPath: "/auth/login", message: "Palavra-passe alterada com sucesso." };
    }

    const meRes = await api.get<ApiMe>("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } });
    const me = meRes.data;
    const role = primaryRoleOf(me) || ("titular" as Role);

    await createSession({ accessToken, refreshToken, role });

    const authHeader = { headers: { Authorization: `Bearer ${accessToken}` } };
    const activeSchoolId = me.memberships[0]?.school_id;
    const sub = activeSchoolId
      ? await api.get<ApiSubscription>(`/schools/${activeSchoolId}/subscription/entitlements`, authHeader)
          .then((r) => mapApiSubscription(r.data))
          .catch(() => undefined)
      : undefined;

    return {
      user: mapApiUser(me, activeSchoolId, sub),
      redirectPath: getRouteByRole(role),
      token: accessToken,
      memberships: me.memberships.map((m) => ({ schoolId: m.school_id, schoolName: m.school_name, roles: m.roles, viaGroup: m.via_group === true })),
    };
  } catch (error: unknown) {
    return {
      user: null,
      redirectPath: "/auth/login",
      message: getApiErrorMessage(
        error,
        "Não foi possível definir a nova palavra-passe. Peça uma nova ligação de recuperação e tente novamente.",
      ),
    };
  }
}

export async function logoutAction() {
  try {
    const session = await getSession();
    if (session?.refreshToken) {
      await api.post("/auth/logout", { refresh_token: session.refreshToken });
    }
  } catch (error) {
    console.error("🚨 Erro ao fazer logout remoto:", error);
  } finally {
    await destroySession();
    resetAccessTokenCache();
  }
}
