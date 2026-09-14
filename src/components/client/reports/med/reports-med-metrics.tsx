'use client';

import React from 'react';
import { DynamicMetricCard } from '@/components';
import { MedMetrics } from '@/types/reports-med';

interface ReportsMedMetricsProps {
  metrics: MedMetrics;
}

export function ReportsMedMetrics({ metrics }: ReportsMedMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicMetricCard
        title="100%"
        subtitle="Conformidade Estatística MED"
        description="Normas do Decreto 424/25"
        icon="FileCheck"
      />
      <DynamicMetricCard
        title={`${metrics.femaleStudentRatioPercentage}% Fem / ${100 - metrics.femaleStudentRatioPercentage}% Masc`}
        subtitle="Equilíbrio Demográfico"
        description="Estratificação de género auditada"
        icon="Users"
      />
      <DynamicMetricCard
        title={`${metrics.overallSuccessRatePercentage}%`}
        subtitle="Taxa de Aproveitamento Geral"
        description="Aprovados no snapshot oficial"
        icon="Award"
      />
      <DynamicMetricCard
        title={metrics.totalSnapshots}
        subtitle="Snapshots Arquivados"
        description="Imutabilidade para auditorias"
        icon="Clock"
      />
    </div>
  );
}
