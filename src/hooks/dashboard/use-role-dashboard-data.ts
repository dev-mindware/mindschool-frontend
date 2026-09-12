"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDashboardRoleStore } from "@/stores/dashboard";
import { Role, RoleDashboardData } from "@/types";
import { generateRoleDashboardData } from "./generators";

export function useRoleDashboardData() {
  const { user } = useAuth();
  const {
    activeRoleOverride,
    selectedPeriod,
    selectedCycle,
    academicYear,
    setRoleOverride,
    setSelectedPeriod,
    setSelectedCycle,
  } = useDashboardRoleStore();

  // The effective role: manual preview override takes priority, then authenticated user, fallback to DIRECTOR_GENERAL
  const effectiveRole: Role =
    activeRoleOverride ?? (user?.role as Role) ?? "DIRECTOR_GENERAL";

  const data: RoleDashboardData = useMemo(() => {
    return generateRoleDashboardData(effectiveRole, selectedPeriod, academicYear);
  }, [effectiveRole, selectedPeriod, academicYear]);

  return {
    effectiveRole,
    activeRoleOverride,
    selectedPeriod,
    selectedCycle,
    academicYear,
    data,
    isLoading: false,
    isError: false,
    setRoleOverride,
    setSelectedPeriod,
    setSelectedCycle,
  };
}

export * from "./generators";
