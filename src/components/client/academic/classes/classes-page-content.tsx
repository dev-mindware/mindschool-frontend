"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useAcademicSections } from "@/hooks/school/use-academic";
import { ClassesList } from "./classes-list";
import { ClassModal } from "./class-modal";
import { Shift, EducationCycle } from "@/types";

export function ClassesPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState<Shift | "ALL">("ALL");
  const [cycleFilter, setCycleFilter] = useState<EducationCycle | "ALL">("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    sections,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    counts,
  } = useAcademicSections(searchQuery, shiftFilter, cycleFilter);

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Turmas & Salas de Aulas"
          suTitle="Organização de classes, turnos lectivos e controle de lotação de vagas por sala"
        />
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0"
        >
          <Icon name="CirclePlus" className="w-4 h-4" />
          Criar Nova Turma
        </Button>
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

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-3 rounded-xl border">
        <div className="relative w-full md:w-80">
          <Icon
            name="Search"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Pesquisar turma, classe ou sala..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <div className="w-40">
            <Select
              value={shiftFilter}
              onValueChange={(val) => setShiftFilter(val as Shift | "ALL")}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Turnos</SelectItem>
                <SelectItem value="MORNING">Manhã</SelectItem>
                <SelectItem value="AFTERNOON">Tarde</SelectItem>
                <SelectItem value="EVENING">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select
              value={cycleFilter}
              onValueChange={(val) =>
                setCycleFilter(val as EducationCycle | "ALL")
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Ciclo de Ensino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Ciclos</SelectItem>
                <SelectItem value="PRIMARY">Primário (1ª à 6ª)</SelectItem>
                <SelectItem value="LOWER_SECONDARY">
                  Iº Ciclo Secundário
                </SelectItem>
                <SelectItem value="UPPER_SECONDARY">
                  IIº Ciclo / Médio
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela de Turmas */}
      <ClassesList
        sections={sections}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
      />

      {/* Modal de Nova Turma */}
      <ClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
