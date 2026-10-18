"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Role, PlanType, AppModule, PermissionAction } from "@/types";
import { isEntitled } from "@/lib/plan-access";
import { useAuth } from "@/hooks/auth";
import { useCan } from "@/hooks/auth/use-can";
import { ROLE_MODULE_PERMISSIONS } from "@/constants/roles";
import { findMatchingMenuItem } from "@/lib/find-menu-item";
import { getRouteByRole } from "@/utils/role-redirects";

export type AccessResult =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "unauthorized" }
  | { status: "plan_insufficient"; redirectTo: string }
  | { status: "allowed" };

export function useAccessControl(allowed: Role[], checkPlan = true): AccessResult {
  const pathname = usePathname();
  const { user, isAuthenticating } = useAuth();
  const { permissions } = useCan();

  const matchingItem = useMemo(() => findMatchingMenuItem(pathname, user?.role), [pathname, user?.role]);

  const subscription = user?.company?.subscription;

  return useMemo<AccessResult>(() => {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      return { status: "allowed" };
    }

    if (isAuthenticating) return { status: "loading" };
    if (!user) return { status: "unauthenticated" };
    if (!allowed.includes(user.role)) return { status: "unauthorized" };
    // A rota tem a lista de papeis do menu: quem nao esta nela nao entra por URL (a API continua a ser a barreira final).
    if (matchingItem?.roles && !matchingItem.roles.includes(user.role)) return { status: "unauthorized" };
    // ... e a rota exige uma permissão de leitura que o papel pode não ter (ex.: professor na biblioteca).
    if (permissions && matchingItem?.permissions && !matchingItem.permissions.some((p) => permissions.includes(p))) return { status: "unauthorized" };

    const PLAN_BYPASS_ROLES: Role[] = [];
    const shouldCheckPlan = checkPlan && !PLAN_BYPASS_ROLES.includes(user.role);

    // As páginas «montra» (teaser) não redirecionam: mostram o convite ao upgrade (ver `usePlanAccess`).
    if (shouldCheckPlan && matchingItem && !matchingItem.teaser && !isEntitled(matchingItem, subscription)) {
      const fallbackRoute = getRouteByRole(user.role);
      const redirectTo = pathname !== fallbackRoute ? fallbackRoute : "/unauthorized";
      return { status: "plan_insufficient", redirectTo };
    }

    return { status: "allowed" };
  }, [
    isAuthenticating,
    user,
    allowed,
    matchingItem,
    permissions,
    subscription,
    pathname,
    checkPlan,
  ]);
}

export interface PlanAccessResult {
  hasAccess: boolean;
  requiredPlan?: PlanType;
  featureName?: string;
  isLoading: boolean;
}

export function usePlanAccess(): PlanAccessResult {
  const pathname = usePathname();
  const { user, isAuthenticating } = useAuth();
  const { permissions } = useCan();

  const matchingItem = useMemo(() => findMatchingMenuItem(pathname, user?.role), [pathname, user?.role]);

  const subscription = user?.company?.subscription;

  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return { hasAccess: true, isLoading: false };
  }

  if (isAuthenticating) {
    return { hasAccess: false, isLoading: true };
  }

  if (!user) {
    return { hasAccess: true, isLoading: false };
  }

  if (matchingItem && !isEntitled(matchingItem, subscription)) {
    return {
      hasAccess: false,
      requiredPlan: matchingItem.minPlan,
      featureName: matchingItem.name,
      isLoading: false,
    };
  }

  return { hasAccess: true, isLoading: false };
}

/**
 * Checks whether the current user has permission to perform a specific action
 * in a target MindSchool module.
 */
export function useModulePermission(
  module: AppModule,
  action: PermissionAction = "read"
): boolean {
  const { user } = useAuth();

  return useMemo(() => {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      return true;
    }
    if (!user?.role) return false;

    const modulePermissions = ROLE_MODULE_PERMISSIONS[user.role]?.[module];
    if (!modulePermissions) return false;

    return modulePermissions.includes(action);
  }, [user?.role, module, action]);
}
