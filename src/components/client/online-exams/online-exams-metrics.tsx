'use client';

import React from 'react';
import { DynamicMetricCard } from '@/components';

interface OnlineExamsMetricsProps {
  metrics: { total: number; open: number; googleForms: number; drafts: number };
}

export function OnlineExamsMetrics({ metrics }: OnlineExamsMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicMetricCard title={metrics.total} subtitle="Provas Criadas" description="Todas as provas da escola" icon="FileSpreadsheet" />
      <DynamicMetricCard title={metrics.open} subtitle="Provas Abertas Agora" description="Publicadas e dentro da janela" icon="Clock" />
      <DynamicMetricCard title={metrics.googleForms} subtitle="Em Google Forms" description="Respostas importadas pela API" icon="Link" />
      <DynamicMetricCard title={metrics.drafts} subtitle="Rascunhos" description="Ainda por publicar" icon="Pencil" />
    </div>
  );
}
