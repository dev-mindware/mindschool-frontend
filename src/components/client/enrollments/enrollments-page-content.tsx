"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Can, Icon } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useEnrollments } from "@/hooks/school/use-enrollments";
import { EnrollmentsList } from "./enrollments-list";
import { EnrollmentModal } from "./enrollment-modal";

export function EnrollmentsPageContent() {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const { allEnrollments, counts, isLoading, isError } = useEnrollments();


  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <TitleList
        title="Matrículas & Inscrições"
        suTitle="Gestão do processo lectivo digital, confirmações e atribuição de turmas."
      >
        <Can permission="enrollment:write">
        <Button
          size="sm"
          onClick={() => setIsEnrollModalOpen(true)}
          className="gap-2 shrink-0 shadow-xs"
        >
          <Icon name="FileCheck" className="size-4" />
          Nova Matrícula
        </Button>
        </Can>
      </TitleList>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.total}
          subtitle="Total de Matrículas"
          description="Inscrições no ano lectivo activo"
          icon="ClipboardList"
        />
        <DynamicMetricCard
          title={counts.active}
          subtitle="Activas & Confirmadas"
          description="Alunos com vaga efectiva"
          icon="CircleCheck"
        />
        <DynamicMetricCard
          title={counts.pending}
          subtitle="Em Análise"
          description="Aguardam confirmação documental"
          icon="Clock"
        />
        <DynamicMetricCard
          title={counts.cancelled}
          subtitle="Canceladas"
          description="Anulações de matrícula"
          icon="FileX"
        />
      </div>

      <EnrollmentsList enrollments={allEnrollments} isLoading={isLoading} isError={isError} />

      {/* Modal de Matrícula Digital */}
      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />
    </div>
  );
}
