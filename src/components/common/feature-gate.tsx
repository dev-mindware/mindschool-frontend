"use client";

import { ReactNode } from "react";
import {
  PlanType,
  PLAN_HIERARCHY,
  Role,
  AppModule,
  PermissionAction,
} from "@/types";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useFeatureGate } from "@/contexts/feature-gate-context";
import { hasRole, hasModulePermission } from "@/constants/roles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FeatureGateProps {
  minPlan?: PlanType;
  roles?: readonly Role[];
  module?: AppModule;
  action?: PermissionAction;
  children: ReactNode;
  fallback?: "hidden" | "disabled";
  tooltipMessage?: string;
}

export function FeatureGate({
  minPlan,
  roles,
  module,
  action = "read",
  children,
  fallback = "hidden",
  tooltipMessage,
}: FeatureGateProps) {
  const { user } = useAuthStore();
  const { openUpgradeModal } = useFeatureGate();

  // Bypass para desenvolvimento ou flags de teste
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return <>{children}</>;
  }

  // 1. Verificação de Nível de Plano (se especificado)
  if (minPlan) {
    const currentPlan =
      (user?.company?.subscription?.plan?.name as PlanType) || "Base";
    const currentLevel = PLAN_HIERARCHY[currentPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[minPlan] || 0;

    if (currentLevel < requiredLevel) {
      if (fallback === "hidden") return null;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openUpgradeModal();
                }}
                className="cursor-not-allowed opacity-60 inline-flex"
              >
                <div className="pointer-events-none">{children}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {tooltipMessage ||
                  `Recurso disponível a partir do plano ${minPlan}. Clique para atualizar.`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  }

  // 2. Verificação de Papel / RBAC (se especificado)
  if (roles && roles.length > 0) {
    const userHasRole = hasRole(user?.role, roles);
    if (!userHasRole) {
      if (fallback === "hidden") return null;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-not-allowed opacity-50 inline-flex">
                <div className="pointer-events-none">{children}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {tooltipMessage ||
                  "A sua função atual não tem autorização para esta ação."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  }

  // 3. Verificação Granular de Módulo e Ação (se especificado)
  if (module) {
    const hasPermission = hasModulePermission(user?.role, module, action);
    if (!hasPermission) {
      if (fallback === "hidden") return null;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-not-allowed opacity-50 inline-flex">
                <div className="pointer-events-none">{children}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {tooltipMessage ||
                  "Permissão insuficiente para executar esta ação no módulo."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  }

  // Todos os critérios cumpridos com sucesso
  return <>{children}</>;
}
