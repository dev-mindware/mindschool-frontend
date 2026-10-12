import { NextRequest, NextResponse } from "next/server";
import {
  API_AUTH_PREFIX,
  DEFAULT_LOGIN_REDIRECT,
  PRIVATE_ROUTE_PREFIXES,
  PUBLIC_ROUTES,
  AUTH_PAGES,
  REFRESH_TOKEN_KEY,
  ROLE_KEY,
  ACCESS_TOKEN_KEY,
  IMPERSONATION_BACKUP_KEY,
  IMPERSONATION_RETURN_KEY,
} from "@/constants/routes";
import { getRouteByRole, isValidRole } from "@/utils/role-redirects";
import { verifyRole } from "@/lib/session";

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname as any)) return true;

  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return false;
    if (!pathname.startsWith(route)) return false;
    const nextChar = pathname[route.length];
    return !nextChar || nextChar === "/" || nextChar === "?";
  });
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.includes(pathname as any);
}

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignora rotas de auth da API
  if (pathname.startsWith(API_AUTH_PREFIX)) {
    return NextResponse.next();
  }

  // Bypass de autenticação para testes/desenvolvimento local
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

  // Durante uma personificação a sessão assumida não tem refresh: vale o token de acesso, enquanto existir a cópia da sessão do admin.
  const inImpersonation = (req.cookies.has(IMPERSONATION_BACKUP_KEY) || req.cookies.has(IMPERSONATION_RETURN_KEY)) &&req.cookies.has(ACCESS_TOKEN_KEY);
  const hasRefreshToken = req.cookies.has(REFRESH_TOKEN_KEY) || inImpersonation;
  const roleCookie = req.cookies.get(ROLE_KEY)?.value;

  // ✅ FIX: valida a assinatura do role do cookie localmente (sem chamada de API)
  const verifiedRole = roleCookie ? await verifyRole(roleCookie) : null;
  const role = isValidRole(verifiedRole) ? verifiedRole : undefined;

  // ✅ FIX: se tem refresh token mas role é inválido,
  // limpa cookies e força re-login (cookie foi manipulado)
  if (hasRefreshToken && !role) {
    const response = NextResponse.redirect(
      new URL(DEFAULT_LOGIN_REDIRECT, req.url)
    );
    response.cookies.delete(REFRESH_TOKEN_KEY);
    response.cookies.delete(ROLE_KEY);
    response.cookies.delete(ACCESS_TOKEN_KEY);
    return response;
  }

  const isAuthenticated = Boolean(hasRefreshToken && role);
  const publicRoute = isPublicRoute(pathname);
  const authPage = isAuthPage(pathname);
  const privateRoute = isPrivateRoute(pathname);

  // Caso 1: rota pública
  if (publicRoute) {
    // Se autenticado em página de auth (login), redireciona
    if (isAuthenticated && authPage) {
      const redirectTo = getRouteByRole(role);
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.next();
  }

  // Caso 2: rota privada sem autenticação
  if (privateRoute && !isAuthenticated) {
    const loginUrl = new URL(DEFAULT_LOGIN_REDIRECT, req.url);
    // Opcional: guardar para onde queria ir
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|json)|\\.well-known).*)",
  ],
};