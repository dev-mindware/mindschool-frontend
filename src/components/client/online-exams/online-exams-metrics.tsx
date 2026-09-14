'use client';

import React from 'react';
import { DynamicMetricCard } from '@/components';
import { ExamMetrics } from '@/types/online-exam';

interface OnlineExamsMetricsProps {
  metrics: ExamMetrics;
}

export function OnlineExamsMetrics({ metrics }: OnlineExamsMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicMetricCard
        title={metrics.totalExams}
        subtitle="Provas Criadas"
        description="Neste trimestre lectivo"
        icon="FileSpreadsheet"
      />
      <DynamicMetricCard
        title={metrics.activeExamsCount}
        subtitle="Provas Activas / Em Curso"
        description="Disponíveis para os alunos"
        icon="Clock"
      />
      <DynamicMetricCard
        title={`${metrics.autoGradingAccuracyPercentage}%`}
        subtitle="Taxa de Correcção Automática"
        description="Média instantânea de objetivas"
        icon="Zap"
      />
      <DynamicMetricCard
        title={`${metrics.averageScore} val`}
        subtitle="Média Geral dos Alunos"
        description="Escala de 0 a 20 do Decreto 424/25"
        icon="Award"
      />
    </div>
  );
}
