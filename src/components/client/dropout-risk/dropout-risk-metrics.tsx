"use client";

import React from "react";
import { DynamicMetricCard } from "@/components";
import { DropoutMetrics } from "@/types/dropout-risk";

interface DropoutRiskMetricsProps {
  metrics: DropoutMetrics;
}

export function DropoutRiskMetrics({ metrics }: DropoutRiskMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicMetricCard
        title={`${metrics.highRiskCount} Alunos`}
        subtitle="Risco Crítico / Alto"
        description="Faltas > 15 dias ou média < 7 valores"
        icon="TriangleAlert"
      />
      <DynamicMetricCard
        title={`${metrics.moderateRiskCount} Alunos`}
        subtitle="Risco Moderado"
        description="Em vigilância activa pedagógica"
        icon="CircleAlert"
      />
      <DynamicMetricCard
        title={`${metrics.retentionRatePercentage}%`}
        subtitle="Taxa de Retenção Escolar"
        description="Alunos mantidos no ano letivo"
        icon="TrendingUp"
      />
      <DynamicMetricCard
        title={`${metrics.resolvedCasesCount} Casos`}
        subtitle="Intervenções com Sucesso"
        description="Alunos reintegrados neste trimestre"
        icon="CircleCheck"
      />
    </div>
  );
}
