"use client";

import { RoleDashboardData } from "@/types";
import {
  DashboardKpiGrid,
  DashboardQuickActions,
  PautasStatusWidget,
  AcademicCyclePerformanceChart,
  DropoutRiskAlertsWidget,
} from "../widgets";

interface PedagogicDashboardViewProps {
  data: RoleDashboardData;
}

export function PedagogicDashboardView({ data }: PedagogicDashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Pedagogical KPIs */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* Quick Actions */}
      <DashboardQuickActions actions={data.quickActions} />

      {/* Pautas Closing Progress Widget */}
      <PautasStatusWidget status={data.pautaStatus} />

      {/* Cycle Performance & Early Dropout Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AcademicCyclePerformanceChart data={data.cyclePerformance} />
        </div>
        <div>
          <DropoutRiskAlertsWidget alerts={data.dropoutAlerts} />
        </div>
      </div>
    </div>
  );
}
