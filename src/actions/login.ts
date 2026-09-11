"use server";

import { z } from "zod";
import { LoginResponse, Role, User } from "@/types";
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
}

export async function loginAction({
  email,
  password,
}: z.infer<typeof loginSchema>): Promise<LoginActionResult> {
  try {
    const res = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    const { user, tokens, message } = res.data;

    if (!user || !tokens?.accessToken || !tokens?.refreshToken) {
      throw new Error("Resposta de autenticação inválida");
    }

    await createSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: user.role,
    });

    return {
      user,
      message,
      redirectPath: getRouteByRole(user.role),
      token: tokens.accessToken,
    };
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
