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
  "/admissions",
  "/students",
  "/enrollments",
  "/guardians",
  "/academic",
  "/grades",
  "/dropout-risk",
  "/online-exams",
  "/tuition",
  "/teachers-attendance",
  "/certificates",
  "/secretary",
  "/communication",
  "/reports",
  "/plans",
  "/settings",
  "/admin",
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

// Mapa de redirect padrão por role (Landing routes)
export const ROLE_REDIRECTS: Record<Role, string> = {
  DIRECTOR_GENERAL: "/dashboard",
  PEDAGOGIC_DIRECTOR: "/dashboard",
  SECRETARY: "/students/list",
  TEACHER: "/grades/entry",
  FINANCIAL: "/tuition/payments",
  GUARDIAN: "/students/list",
  STUDENT: "/grades/entry",
  SYSTEM_ADMIN: "/settings",
  MED_AUDITOR: "/reports/med",
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  ADMIN: "/settings",
  CASHIER: "/tuition/payments",
};

// Validação: roles aceitas (para validar integridade de cookies e sessões)
export const VALID_ROLES: Role[] = [
  "DIRECTOR_GENERAL",
  "PEDAGOGIC_DIRECTOR",
  "SECRETARY",
  "TEACHER",
  "FINANCIAL",
  "GUARDIAN",
  "STUDENT",
  "SYSTEM_ADMIN",
  "MED_AUDITOR",
  "ADMIN",
  "OWNER",
  "MANAGER",
  "CASHIER",
];