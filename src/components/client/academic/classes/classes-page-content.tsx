"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Can, Icon } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useAcademicSections } from "@/hooks/school/use-academic";
import { ClassesList } from "./classes-list";
import { ClassModal } from "./class-modal";

export function ClassesPageContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { allSections, counts, isLoading } = useAcademicSections();


  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Turmas & Salas de Aulas"
          suTitle="Organização de classes, turnos lectivos e controle de lotação de vagas por sala"
        />
        <Can permission="section:write">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0"
        >
          <Icon name="CirclePlus" className="w-4 h-4" />
          Criar Nova Turma
        </Button>
        </Can>
      </div>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.total}
          subtitle="Total de Turmas"
          description="Turmas activas no ano corrente"
          icon="DoorOpen"
        />
        <DynamicMetricCard
          title={counts.morning}
          subtitle="Turno da Manhã"
          description="Período matutino"
          icon="Sun"
        />
        <DynamicMetricCard
          title={counts.afternoon}
          subtitle="Turno da Tarde"
          description="Período vespertino"
          icon="Sunset"
        />
        <DynamicMetricCard
          title={`${counts.overallOccupancyRate}%`}
          subtitle="Taxa Média de Ocupação"
          description="Aproveitamento global de vagas"
          icon="ChartPie"
        />
      </div>

      <ClassesList sections={allSections} isLoading={isLoading} />

      {/* Modal de Nova Turma */}
      <ClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
