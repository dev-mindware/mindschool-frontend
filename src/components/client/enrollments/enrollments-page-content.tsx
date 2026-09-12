"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { FilterPopover } from "@/components/shared/filters/filter-popover";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useEnrollments } from "@/hooks/school/use-enrollments";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { EnrollmentsList } from "./enrollments-list";
import { EnrollmentModal } from "./enrollment-modal";
import { EnrollmentStatus } from "@/types";

export function EnrollmentsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "ALL">(
    "ALL"
  );
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const { sections } = useSchoolDataStore();
  const {
    enrollments,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    counts,
  } = useEnrollments(searchQuery, statusFilter, sectionFilter);

  const hasActiveFilters = statusFilter !== "ALL" || sectionFilter !== "ALL" || Boolean(searchQuery);

  const handleClearFilters = () => {
    setStatusFilter("ALL");
    setSectionFilter("ALL");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <TitleList
        title="Matrículas & Inscrições"
        suTitle="Gestão do processo lectivo digital, confirmações e atribuição de turmas."
      >
        <Button
          size="sm"
          onClick={() => setIsEnrollModalOpen(true)}
          className="gap-2 shrink-0 shadow-xs"
        >
          <Icon name="FileCheck" className="size-4" />
          Nova Matrícula
        </Button>
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

      {/* Barra de Filtros e Pesquisa – Padrão MindGest */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-xs">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={setSearchQuery}
          placeholder="Pesquisar por nº matrícula ou aluno..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Estado"
            icon="ListFilter"
            options={[
              { label: "Todos os Estados", value: "ALL" },
              { label: "Activas", value: "ACTIVE" },
              { label: "Pendentes", value: "PENDING" },
              { label: "Transferidas", value: "TRANSFERRED" },
              { label: "Canceladas", value: "CANCELLED" },
            ]}
            value={statusFilter === "ALL" ? null : statusFilter}
            onChange={(val) =>
              setStatusFilter((val ?? "ALL") as EnrollmentStatus | "ALL")
            }
          />

          <FilterPopover
            label="Turma"
            icon="ListFilter"
            options={[
              { label: "Todas as Turmas", value: "ALL" },
              ...sections.map((sec) => ({
                label: `${sec.name} (${sec.shift === "MORNING" ? "Manhã" : "Tarde"})`,
                value: sec.id,
              })),
            ]}
            value={sectionFilter === "ALL" ? null : sectionFilter}
            onChange={(val) => setSectionFilter(val ?? "ALL")}
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="mr-1 size-3.5" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Lista com Tabela Genérica */}
      <EnrollmentsList
        enrollments={enrollments}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
      />

      {/* Modal de Matrícula Digital */}
      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />
    </div>
  );
}
