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
import { useTeacherAssignments } from "@/hooks/school/use-academic";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { AssignmentsList } from "./assignments-list";
import { AssignmentModal } from "./assignment-modal";

export function TeacherAssignmentsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { sections } = useSchoolDataStore();
  const {
    assignments,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    counts,
  } = useTeacherAssignments(searchQuery, sectionFilter);

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Distribuição Docente"
          suTitle="Atribuição de professores a turmas e disciplinas lectivas para o ano corrente"
        />
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0"
        >
          <Icon name="UserPlus" className="w-4 h-4" />
          Nova Atribuição
        </Button>
      </div>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.totalAssignments}
          subtitle="Total Atribuições"
          description="Alocações activas de aulas"
          icon="BookOpenCheck"
        />
        <DynamicMetricCard
          title={counts.uniqueTeachers}
          subtitle="Docentes Alocados"
          description="Professores em actividade"
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

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-3 rounded-xl border">
        <div className="relative w-full md:w-80">
          <Icon
            name="Search"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Pesquisar por professor ou disciplina..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <div className="w-52">
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filtrar por Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as Turmas</SelectItem>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela de Atribuições */}
      <AssignmentsList
        assignments={assignments}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
      />

      {/* Modal de Nova Atribuição */}
      <AssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
