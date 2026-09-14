'use client';

import React from 'react';
import { DynamicMetricCard } from '@/components';
import { DocumentMetrics } from '@/types/certificate';

interface CertificatesMetricsProps {
  metrics: DocumentMetrics;
}

export function CertificatesMetrics({ metrics }: CertificatesMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicMetricCard
        title={metrics.totalIssued}
        subtitle="Documentos Emitidos"
        description="No ano lectivo corrente"
        icon="FileCheck"
      />
      <DynamicMetricCard
        title={metrics.declarationsCount}
        subtitle="Declarações Escolares"
        description="Com ou sem notas"
        icon="FileText"
      />
      <DynamicMetricCard
        title={metrics.certificatesCount}
        subtitle="Certificados de Habilitações"
        description="Conclusão de ciclo escolar"
        icon="Award"
      />
      <DynamicMetricCard
        title={metrics.pendingDeliveryCount}
        subtitle="Aguardam Levantamento"
        description="Na secretaria escolar"
        icon="Clock"
      />
    </div>
  );
}
