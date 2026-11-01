"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Can, Icon, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useCan } from "@/hooks/auth/use-can";
import { useAcademicSections } from "@/hooks/school/use-academic";
import { CoordinationPanel } from "../coordination";
import { ClassesList } from "./classes-list";
import { ClassModal } from "./class-modal";

export function ClassesPageContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { allSections, counts, isLoading } = useAcademicSections();
  const { can } = useCan();


  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Turmas & Salas de Aulas"
          suTitle="Organização de classes, turnos letivos e controle de lotação de vagas por sala"
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

      <Tabs defaultValue="turmas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="turmas" className="gap-1.5"><Icon name="DoorOpen" className="size-4" />Turmas</TabsTrigger>
          {can("pauta:read") && <TabsTrigger value="direcao" className="gap-1.5"><Icon name="UsersRound" className="size-4" />Direção de turma</TabsTrigger>}
        </TabsList>

        <TabsContent value="turmas" className="space-y-6">
          {/* Cartões de Métricas no Padrão MindGest */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <DynamicMetricCard
              title={counts.total}
              subtitle="Total de Turmas"
              description="Turmas ativas no ano corrente"
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
        </TabsContent>

        {can("pauta:read") && (
          <TabsContent value="direcao">
            <CoordinationPanel />
          </TabsContent>
        )}
      </Tabs>

      {/* Modal de Nova Turma */}
      <ClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
