"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { menuItems, type MenuItem } from "@/constants/menu-items";
import { activeModule, buildNavigation, type NavigationModel } from "@/constants/navigation";
import { useAuth } from "@/hooks/auth";
import { filterByPermissions, getSidebarForUser } from "@/lib/get-sidebar-for-user";
import { useCan } from "@/hooks/auth/use-can";
import type { PlanType } from "@/types";

/** Navegação do utilizador autenticado: itens filtrados por papel/plano, modelo modular, módulo activo pela URL. */
export function useNavigation(): { ready: boolean; items: MenuItem[]; model: NavigationModel; active: ReturnType<typeof activeModule>; pathname: string } {
  const { user } = useAuth();
  const pathname = usePathname();
  const subscription = user?.company?.subscription;
  const plan = subscription ? (subscription.plan?.name as PlanType) : undefined;

  const { permissions } = useCan();
  const items = useMemo(() => (user ? filterByPermissions(getSidebarForUser(menuItems.items, user.role, subscription, plan), permissions) : []), [user, subscription, plan, permissions]);
  const model = useMemo(() => buildNavigation(items), [items]);
  return { ready: Boolean(user), items, model, active: activeModule(model, pathname), pathname };
}
