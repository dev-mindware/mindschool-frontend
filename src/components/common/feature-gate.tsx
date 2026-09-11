"use client";

import { ReactNode } from "react";
import { PlanType, PLAN_HIERARCHY } from "@/types/subscription";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useFeatureGate } from "@/contexts/feature-gate-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FeatureGateProps = {
  minPlan: PlanType;
  children: ReactNode;
  fallback?: "hidden" | "disabled";
};

export function FeatureGate({
  minPlan,
  children,
  fallback = "hidden",
}: FeatureGateProps) {
  const { user } = useAuthStore();
  const { openUpgradeModal } = useFeatureGate();

  // Assuming user?.company?.subscription?.plan.name is the source of truth
  // Defaulting to Base if no plan found (safe default)
  const currentPlan =
    (user?.company?.subscription?.plan.name as PlanType) || "Base";

  const currentLevel = PLAN_HIERARCHY[currentPlan] || 0;
  const requiredLevel = PLAN_HIERARCHY[minPlan] || 0;

  const hasAccess = currentLevel >= requiredLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback === "hidden") {
    return null;
  }

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
          <p>Para ter acesso a este recurso suba de plano</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
