"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Can, Icon } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useTeacherAssignments } from "@/hooks/school/use-academic";
import { AssignmentsList } from "./assignments-list";
import { AssignmentModal } from "./assignment-modal";

export function TeacherAssignmentsPageContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { allAssignments, counts, isLoading } = useTeacherAssignments();


  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Distribuição Docente"
          suTitle="Atribuição de professores a turmas e disciplinas letivas para o ano corrente"
        />
        <Can permission="teaching:write">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0"
        >
          <Icon name="UserPlus" className="w-4 h-4" />
          Nova Atribuição
        </Button>
        </Can>
      </div>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.totalAssignments}
          subtitle="Total Atribuições"
          description="Alocações ativas de aulas"
          icon="BookOpenCheck"
        />
        <DynamicMetricCard
          title={counts.uniqueTeachers}
          subtitle="Docentes Alocados"
          description="Professores em atividade"
          icon="GraduationCap"
        />
        <DynamicMetricCard
          title={counts.uniqueSections}
          subtitle="Turmas Cobertas"
          description="Turmas com corpo docente"
          icon="DoorOpen"
        />
        <DynamicMetricCard
          title={`${counts.totalAllocatedHours}h`}
          subtitle="Horas Semanais"
          description="Carga horária total distribuída"
          icon="Clock"
        />
      </div>

      <AssignmentsList assignments={allAssignments} isLoading={isLoading} />

      {/* Modal de Nova Atribuição */}
      <AssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
