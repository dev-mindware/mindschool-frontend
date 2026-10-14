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
    if (!accessToken || !refreshToken) throw new Error("Resposta de autenticação inválida");

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
      ? await api.get<ApiSubscription>(`/schools/${activeSchoolId}/subscription`, authHeader).then((r) => mapApiSubscription(r.data)).catch(() => undefined)
      : undefined;

    return {
      user: mapApiUser(me, activeSchoolId, sub),
      redirectPath: getRouteByRole(role),
      token: accessToken,
      memberships: me.memberships.map((m) => ({ schoolId: m.school_id, schoolName: m.school_name, roles: m.roles })),
    };
  } catch (error: any) {
    let messageError = "Ocorreu um erro desconhecido!";

    const problem = error?.response?.data;
    if (problem?.code === "MFA_REQUIRED") {
      return { user: null, requiresMfa: true, mfaMethods: problem.methods ?? ["totp"], message: "Introduza o código do segundo factor." };
    }
    if (problem?.detail) {
      messageError = problem.detail;
    } else if (error instanceof Error) {
      messageError = error.message;
    }

    return {
      user: null,
      redirectPath: "/auth/login",
      message: messageError,
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
      ? await api.get<ApiSubscription>(`/schools/${activeSchoolId}/subscription`, authHeader)
          .then((r) => mapApiSubscription(r.data))
          .catch(() => undefined)
      : undefined;

    return {
      user: mapApiUser(me, activeSchoolId, sub),
      redirectPath: getRouteByRole(role),
      token: accessToken,
      memberships: me.memberships.map((m) => ({ schoolId: m.school_id, schoolName: m.school_name, roles: m.roles })),
    };
  } catch (error: any) {
    let messageError = "Não foi possível definir a palavra-passe.";
    const problem = error?.response?.data;
    if (problem?.detail) {
      messageError = problem.detail;
    } else if (problem?.message) {
      messageError = problem.message;
    } else if (error instanceof Error) {
      messageError = error.message;
    }
    return {
      user: null,
      redirectPath: "/auth/login",
      message: messageError,
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

/* "use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { roleRedirects } from "@/utils";
import { LoginResponse, Role, User } from "@/types";
import { loginSchema } from "@/schemas";
import { api } from "@/services/api";
import { createSession } from "@/lib/session";
import { getSession } from "@/lib/auth";

export async function loginAction({
  email,
  password,
}: z.infer<typeof loginSchema>): Promise<{
  user: User | null;
  redirectPath?: string;
  message?: string;
}> {
  try {
    const res = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    const { user, tokens, message } = res.data;

    if (!user) {
      throw new Error("Utilizador não autorizado");
    }

    await createSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: user.role,
    });

    const redirectPath = getRedirectPath(user.role);

    return { message, user, redirectPath };
  } catch (error: any) {
    let messageError = "Ocorreu um erro desconhecido!";

    if (error?.response?.data?.message) {
      messageError = error.response.data.message;
    } else if (error instanceof Error) {
      messageError = error.message;
    }

    return {
      user: null,
      redirectPath: "/auth/login",
      message: messageError,
    };
  }
}

function getRedirectPath(role: Role): string {
  return roleRedirects[role as keyof typeof roleRedirects] || "/";
}

export async function logoutAction() {
  try {
    const session = await getSession();
    await api.post("/auth/logout", { refresh_token: session?.refreshToken });
  } catch (error) {
    console.error("🚨 Erro ao fazer logout remoto:", error);
  } finally {
    const { destroySession } = await import("@/lib/session");
    await destroySession();
    const { resetAccessTokenCache } = await import("@/services/api");
    resetAccessTokenCache();

    //redirect("/auth/login");
  }
} */
