/* import { Role } from "@/types";

export const DEFAULT_LOGIN_REDIRECT = "/auth/login";

export const roleRedirects: Record<Role, string> = {
  "ADMIN": "/admin/dashboard",
  "OWNER": "/dashboard",
  "MANAGER": "/dashboard",
  "CASHIER": "/pos/counter",
};

export const getRouteByRole = (role: Role): string => {
  if (!role) return DEFAULT_LOGIN_REDIRECT;
  return roleRedirects[role] || DEFAULT_LOGIN_REDIRECT;
};
 */


import { Role } from "@/types";
import {
  DEFAULT_LOGIN_REDIRECT,
  ROLE_REDIRECTS,
  VALID_ROLES,
} from "@/constants/routes";
import { ROLE_HIERARCHY } from "@/constants/roles";

/**
 * Valida se um valor é uma Role válida.
 * Protege contra cookies manipulados.
 */
export function isValidRole(value: unknown): value is Role {
  return typeof value === "string" && VALID_ROLES.includes(value as Role);
}

/**
 * Retorna a rota baseada no role, com fallback seguro.
 * Se role for inválido, retorna login.
 */
export function getRouteByRole(role: unknown): string {
  if (!isValidRole(role)) return DEFAULT_LOGIN_REDIRECT;
  return ROLE_REDIRECTS[role] || DEFAULT_LOGIN_REDIRECT;
}

/**
 * Checks if a user's role is included in the allowed roles list.
 */
export function hasRole(userRole: unknown, allowedRoles: readonly Role[]): boolean {
  if (!isValidRole(userRole)) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Checks if a user's role has equal or higher authority level than a target role.
 */
export function isRoleHigherOrEqual(userRole: unknown, targetRole: Role): boolean {
  if (!isValidRole(userRole)) return false;
  const userRank = ROLE_HIERARCHY[userRole] ?? 0;
  const targetRank = ROLE_HIERARCHY[targetRole] ?? 0;
  return userRank >= targetRank;
}