"use client";

import { useRoleDashboardData } from "@/hooks/dashboard";
import { DashboardRoleDispatcher } from "../dashboard-role-dispatcher";

/**
 * DashboardOverview - Adaptative entry point that delegates to the role dispatcher
 */
export function DashboardOverview() {
  const { effectiveRole, data } = useRoleDashboardData();

  return <DashboardRoleDispatcher role={effectiveRole} data={data} />;
}
