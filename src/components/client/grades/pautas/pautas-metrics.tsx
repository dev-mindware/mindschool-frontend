'use client';

import React from 'react';
import { DynamicMetricCard } from '@/components';

interface PautasMetricsProps {
  total: number;
  closed: number;
  pending: number;
  auditCount: number;
}

export function PautasMetrics({
  total,
  closed,
  pending,
  auditCount,
}: PautasMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicMetricCard
        title={total.toString()}
        subtitle="Pautas no Trimestre"
        description="Total de turmas ativas no sistema"
        icon="ClipboardList"
      />
      <DynamicMetricCard
        title={closed.toString()}
        subtitle="Pautas Homologadas"
        description="Fechadas e bloqueadas contra edição"
        icon="Lock"
      />
      <DynamicMetricCard
        title={pending.toString()}
        subtitle="Pendentes de Fecho"
        description="Aguardando validação da Direcção"
        icon="Clock"
      />
      <DynamicMetricCard
        title={auditCount.toString()}
        subtitle="Reaberturas Auditadas"
        description="Alterações justificadas pós-fecho"
        icon="ShieldAlert"
      />
    </div>
  );
}
