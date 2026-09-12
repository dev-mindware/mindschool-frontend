"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Role, PlanType, PLAN_HIERARCHY, AppModule, PermissionAction } from "@/types";
import { useAuth } from "@/hooks/auth";
import { menuItems, MenuItem } from "@/constants/menu-items";
import { ROLE_MODULE_PERMISSIONS } from "@/constants/roles";
import { getRouteByRole } from "@/utils/role-redirects";

const flattenMenu = (items: MenuItem[]): MenuItem[] =>
  items.reduce<MenuItem[]>((acc, item) => {
    acc.push(item);
    if (item.items) acc.push(...flattenMenu(item.items));
    return acc;
  }, []);

const allMenuItems = flattenMenu(menuItems.items);

export type AccessResult =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "unauthorized" }
  | { status: "plan_insufficient"; redirectTo: string }
  | { status: "allowed" };

export function useAccessControl(allowed: Role[], checkPlan = true): AccessResult {
  const pathname = usePathname();
  const { user, isAuthenticating } = useAuth();

  const matchingItem = useMemo(
    () =>
      allMenuItems
        .filter(
          (item) =>
            item.url !== "#" &&
            item.url !== "/" &&
            (pathname === item.url || pathname.startsWith(item.url + "/"))
        )
        .sort((a, b) => b.url.length - a.url.length)[0],
    [pathname]
  );

  const currentPlanLevel = useMemo(() => {
    const plan = (user?.company?.subscription?.plan.name as PlanType) || "Base";
    return PLAN_HIERARCHY[plan] ?? 0;
  }, [user]);

  return useMemo<AccessResult>(() => {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      return { status: "allowed" };
    }

    if (isAuthenticating) return { status: "loading" };
    if (!user) return { status: "unauthenticated" };
    if (!allowed.includes(user.role)) return { status: "unauthorized" };

    const PLAN_BYPASS_ROLES: Role[] = ["CASHIER"];
    const shouldCheckPlan = checkPlan && !PLAN_BYPASS_ROLES.includes(user.role);

    if (shouldCheckPlan && matchingItem?.minPlan) {
      const required = PLAN_HIERARCHY[matchingItem.minPlan] ?? 0;
      if (currentPlanLevel < required) {
        const fallbackRoute = getRouteByRole(user.role);
        const redirectTo =
          pathname !== fallbackRoute ? fallbackRoute : "/unauthorized";
        return { status: "plan_insufficient", redirectTo };
      }
    }

    return { status: "allowed" };
  }, [
    isAuthenticating,
    user,
    allowed,
    matchingItem,
    currentPlanLevel,
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

  const matchingItem = useMemo(
    () =>
      allMenuItems
        .filter(
          (item) =>
            item.url !== "#" &&
            item.url !== "/" &&
            (pathname === item.url || pathname.startsWith(item.url + "/"))
        )
        .sort((a, b) => b.url.length - a.url.length)[0],
    [pathname]
  );

  const currentPlanLevel = useMemo(() => {
    const plan = (user?.company?.subscription?.plan.name as PlanType) || "Base";
    return PLAN_HIERARCHY[plan] ?? 0;
  }, [user]);

  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return { hasAccess: true, isLoading: false };
  }

  if (isAuthenticating) {
    return { hasAccess: false, isLoading: true };
  }

  if (!user) {
    return { hasAccess: true, isLoading: false };
  }

  if (matchingItem?.minPlan) {
    const required = PLAN_HIERARCHY[matchingItem.minPlan] ?? 0;
    if (currentPlanLevel < required) {
      return {
        hasAccess: false,
        requiredPlan: matchingItem.minPlan,
        featureName: matchingItem.name,
        isLoading: false,
      };
    }
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
