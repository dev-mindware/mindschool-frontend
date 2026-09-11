"use client";

import { ReactNode } from "react";
import { usePlanAccess } from "@/providers";
import { PlanUpgradeGate } from "./plan-upgrade-gate";
import { Loader } from "@/contexts";

interface PlanGateProps {
  children: ReactNode;
}

export function PlanGate({ children }: PlanGateProps) {
  const { hasAccess, requiredPlan, featureName, isLoading } = usePlanAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (!hasAccess && requiredPlan) {
    return (
      <PlanUpgradeGate
        requiredPlan={requiredPlan}
        featureName={featureName}
      />
    );
  }

  return <>{children}</>;
}
