/* export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/checkout",
  "/unauthorized",
  "/not-found",
];

export const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/documents",
  "/plans",
  "/dashboard",
  "/settings",
  "/items",
  "/management",
  "/pos-management",
  "/pos",
  "/reports",
  "/stock",
];

export const API_AUTH_PREFIX = "/api/auth";
export const DEFAULT_LOGIN_REDIRECT = "/auth/login";
export const UPGRADE_REDIRECT = "/pricing"; */


import { Role } from "@/types";

// Rotas públicas (acessíveis sem autenticação)
export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/checkout",
  "/unauthorized",
  "/not-found",
] as const;

// Páginas de autenticação — se logado, redireciona para dashboard
export const AUTH_PAGES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

// Prefixos de rotas privadas
export const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/admin",
  "/pos",
  "/pos-management",
  "/settings",
  "/management",
  "/documents",
  "/items",
  "/plans",
  "/reports",
  "/stock",
] as const;

// Rota de login padrão
export const DEFAULT_LOGIN_REDIRECT = "/auth/login";

// Rota de unauthorized
export const UNAUTHORIZED_REDIRECT = "/unauthorized";

// Prefixo de auth da API (NextAuth-like, se aplicável)
export const API_AUTH_PREFIX = "/api/auth";

// Cookies
export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const ROLE_KEY = "user_role";

// Mapa de redirect por role
export const ROLE_REDIRECTS: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  CASHIER: "/pos/counter",
};

// Validação: roles aceitas (para validar cookie manipulado)
export const VALID_ROLES: Role[] = ["ADMIN", "OWNER", "MANAGER", "CASHIER"];