"use client";

import { RoleDashboardData } from "@/types";
import {
  DashboardKpiGrid,
  DashboardQuickActions,
  AcademicCyclePerformanceChart,
  TeacherAttendanceWidget,
  DropoutRiskAlertsWidget,
  TuitionRevenueChart,
} from "../widgets";

interface DirectorDashboardViewProps {
  data: RoleDashboardData;
}

export function DirectorDashboardView({ data }: DirectorDashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Executive KPIs */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* Quick Actions */}
      <DashboardQuickActions actions={data.quickActions} />

      {/* Performance by Academic Cycle & Dropout Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AcademicCyclePerformanceChart data={data.cyclePerformance} />
        </div>
        <div>
          <DropoutRiskAlertsWidget alerts={data.dropoutAlerts} />
        </div>
      </div>

      {/* Teacher Attendance (QR Code) & Tuition Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeacherAttendanceWidget attendance={data.teacherAttendance} />
        <TuitionRevenueChart financial={data.tuitionFinancial} />
      </div>
    </div>
  );
}
