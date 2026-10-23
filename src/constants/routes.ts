/* export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
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
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/impersonar",
  "/unauthorized",
  "/not-found",
  "/verificar",
] as const;

// Páginas de autenticação — se logado, redireciona para dashboard
export const AUTH_PAGES = [
  "/",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

// Prefixos de rotas privadas
export const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/teachers",
  "/portal",
  "/familia",
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
  "/integrations",
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
/** Cookie (httpOnly) com a sessão do administrador enquanto dura uma personificação: permite voltar a ela ao terminar. */
export const IMPERSONATION_BACKUP_KEY = "imp_backup";
/** Cookie (httpOnly) com o URL do painel de administração que iniciou a personificação: ao terminar, volta-se lá. */
export const IMPERSONATION_RETURN_KEY = "imp_return";

/** Painel de administração da plataforma (aplicação própria, noutro domínio): para onde vai o administrador de sistema. */
export const ADMIN_PANEL_URL = (process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || "http://localhost:3009/mindschool").replace(/\/+$/, "");

// Mapa de redirect padrão por role (Landing routes)
export const ROLE_REDIRECTS: Record<Role, string> = {
  DIRECTOR_GENERAL: "/dashboard",
  PEDAGOGIC_DIRECTOR: "/dashboard",
  // Todos os papéis entram no seu dashboard.
  SECRETARY: "/dashboard",
  TEACHER: "/dashboard",
  FINANCIAL: "/dashboard",
  GUARDIAN: "/dashboard",
  STUDENT: "/dashboard",
  SYSTEM_ADMIN: ADMIN_PANEL_URL,
  MED_AUDITOR: "/dashboard",
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  ADMIN: "/dashboard",
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
];