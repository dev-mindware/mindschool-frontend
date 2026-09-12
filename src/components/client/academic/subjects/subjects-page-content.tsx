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
import { useSubjects } from "@/hooks/school/use-academic";
import { SubjectsList } from "./subjects-list";
import { SubjectModal } from "./subject-modal";
import { EducationCycle } from "@/types";

export function SubjectsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cycleFilter, setCycleFilter] = useState<EducationCycle | "ALL">("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    subjects,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    counts,
  } = useSubjects(searchQuery, cycleFilter);

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Disciplinas & Matriz Curricular"
          suTitle="Definição do plano de estudos curricular, cargas horárias e ciclos pedagógicos"
        />
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0"
        >
          <Icon name="CirclePlus" className="w-4 h-4" />
          Nova Disciplina
        </Button>
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
          title={counts.primary}
          subtitle="Ensino Primário"
          description="Matriz da 1ª à 6ª classe"
          icon="Bookmark"
        />
        <DynamicMetricCard
          title={counts.lowerSecondary}
          subtitle="Iº Ciclo Secundário"
          description="Matriz da 7ª à 9ª classe"
          icon="Layers"
        />
        <DynamicMetricCard
          title={`${counts.totalWeeklyHours}h`}
          subtitle="Carga Horária Semanal"
          description="Soma de horas lectivas semanais"
          icon="Clock"
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
            placeholder="Pesquisar por nome ou código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <div className="w-52">
            <Select
              value={cycleFilter}
              onValueChange={(val) =>
                setCycleFilter(val as EducationCycle | "ALL")
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Ciclo Curricular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Ciclos</SelectItem>
                <SelectItem value="PRIMARY">Ensino Primário</SelectItem>
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

      {/* Tabela de Disciplinas */}
      <SubjectsList
        subjects={subjects}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
      />

      {/* Modal de Nova Disciplina */}
      <SubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
