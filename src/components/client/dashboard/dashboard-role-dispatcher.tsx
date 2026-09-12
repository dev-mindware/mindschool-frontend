"use client";

import React from "react";
import { Role, RoleDashboardData } from "@/types";
import {
  DirectorDashboardView,
  PedagogicDashboardView,
  TeacherDashboardView,
  SecretaryDashboardView,
  FinancialDashboardView,
  MedAuditorDashboardView,
  GuardianDashboardView,
} from "./views";

interface DashboardRoleDispatcherProps {
  role: Role;
  data: RoleDashboardData;
}

/**
 * Strategy pattern mapping: maps any system role to its specialized presentation view
 */
const ROLE_VIEW_MAP: Record<
  Role,
  React.ComponentType<{ data: RoleDashboardData }>
> = {
  DIRECTOR_GENERAL: DirectorDashboardView,
  SYSTEM_ADMIN: DirectorDashboardView,
  OWNER: DirectorDashboardView,
  ADMIN: DirectorDashboardView,
  MANAGER: DirectorDashboardView,
  PEDAGOGIC_DIRECTOR: PedagogicDashboardView,
  TEACHER: TeacherDashboardView,
  SECRETARY: SecretaryDashboardView,
  FINANCIAL: FinancialDashboardView,
  CASHIER: FinancialDashboardView,
  MED_AUDITOR: MedAuditorDashboardView,
  GUARDIAN: GuardianDashboardView,
  STUDENT: GuardianDashboardView,
};

export function DashboardRoleDispatcher({
  role,
  data,
}: DashboardRoleDispatcherProps) {
  const Component = ROLE_VIEW_MAP[role] ?? DirectorDashboardView;

  return <Component data={data} />;
}
