"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Can, Icon } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useSubjects } from "@/hooks/school/use-academic";
import { SubjectsList } from "./subjects-list";
import { SubjectModal } from "./subject-modal";

export function SubjectsPageContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { allSubjects, counts, isLoading } = useSubjects();


  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Disciplinas & Matriz Curricular"
          suTitle="Definição do plano de estudos curricular, cargas horárias e ciclos pedagógicos"
        />
        <Can permission="subject:write">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0"
        >
          <Icon name="CirclePlus" className="w-4 h-4" />
          Nova Disciplina
        </Button>
        </Can>
      </div>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.total}
          subtitle="Total de Disciplinas"
          description="Disciplinas curriculares cadastradas"
          icon="BookOpen"
        />
        <DynamicMetricCard
          title={counts.core}
          subtitle="Disciplinas Nucleares"
          description="Disciplinas chave de transição e aprovação"
          icon="Star"
        />
        <DynamicMetricCard
          title={counts.quantitative}
          subtitle="Regime Quantitativo"
          description="Escala numérica de 0 a 20 valores"
          icon="GraduationCap"
        />
        <DynamicMetricCard
          title={counts.active}
          subtitle="Disciplinas Ativas"
          description="Em vigor na matriz curricular"
          icon="CircleCheck"
        />
      </div>

      <SubjectsList subjects={allSubjects} isLoading={isLoading} />

      {/* Modal de Nova Disciplina */}
      <SubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
