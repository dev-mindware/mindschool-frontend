"use client";

import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { RoleDashboardData } from "@/types";

interface DashboardKpiGridProps {
  kpis: RoleDashboardData["kpis"];
}

export function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <DynamicMetricCard
          key={`${kpi.title}-${idx}`}
          title={kpi.value}
          subtitle={kpi.title}
          description={kpi.description}
          icon={kpi.icon as any}
          trend={
            kpi.variation !== undefined
              ? {
                  percent: kpi.variation,
                  higherIsBetter: kpi.trend !== "down",
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
