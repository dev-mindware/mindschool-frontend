"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { FilterPopover } from "@/components/shared/filters/filter-popover";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useAdmissionStore } from "@/stores/school/admission-store";
import { ApplicationsList } from "./applications-list";
import { CandidateApplicationModal } from "./candidate-application-modal";
import { AdmissionStatus } from "@/types/admission";

export function AdmissionsPageContent() {
  const { applications } = useAdmissionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | "ALL">("ALL");
  const [shiftFilter, setShiftFilter] = useState<string>("ALL");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Filter calculations
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidateDocumentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.guardianName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || app.status === statusFilter;

      const matchesShift =
        shiftFilter === "ALL" || app.desiredShift === shiftFilter;

      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [applications, searchQuery, statusFilter, shiftFilter]);

  const total = filteredApplications.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredApplications.slice(start, start + PAGE_SIZE);
  }, [filteredApplications, currentPage]);

  // Counts for DynamicMetricCards
  const counts = useMemo(() => {
    return {
      total: applications.length,
      pendingExam: applications.filter(
        (a) => a.requiresEntranceExam && a.examScore === undefined && a.status !== "REJECTED" && a.status !== "WITHDRAWN"
      ).length,
      approved: applications.filter((a) => a.status === "APPROVED").length,
      waitlist: applications.filter((a) => a.status === "WAITLIST").length,
      enrolled: applications.filter((a) => a.status === "ENROLLED").length,
    };
  }, [applications]);

  const hasActiveFilters = statusFilter !== "ALL" || shiftFilter !== "ALL" || Boolean(searchQuery);

  const handleClearFilters = () => {
    setStatusFilter("ALL");
    setShiftFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Ações Rápidas */}
      <TitleList
        title="Candidaturas & Admissões"
        suTitle="Gestão do processo de pré-inscrições, validação documental e provas de acesso."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admissions/exams">
            <Button variant="outline" size="sm" className="gap-2 shadow-xs">
              <Icon name="FileText" className="size-4 text-muted-foreground" />
              Provas de Acesso
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="gap-2 shrink-0 shadow-xs"
          >
            <Icon name="UserPlus" className="size-4" />
            Nova Candidatura
          </Button>
        </div>
      </TitleList>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.total}
          subtitle="Total de Candidaturas"
          icon="GraduationCap"
          description="Inscrições submetidas neste ano lectivo"
        />
        <DynamicMetricCard
          title={counts.pendingExam}
          subtitle="Provas de Acesso Pendentes"
          icon="Clock"
          description="Aguardando realização ou nota do exame"
        />
        <DynamicMetricCard
          title={counts.approved}
          subtitle="Candidatos Aprovados"
          icon="CircleCheck"
          description="Aptos para matrícula imediata em 1 clique"
        />
        <DynamicMetricCard
          title={counts.waitlist}
          subtitle="Em Lista de Espera"
          icon="Users"
          description="Ordenados por pontuação de exame"
        />
      </div>

      {/* Barra de Filtros e Pesquisa Padrão MindGest */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-xs">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Pesquisar por candidato, N.º processo ou BI..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Estado"
            icon="ListFilter"
            options={[
              { label: "Todos os Estados", value: "ALL" },
              { label: "Submetida (Novas)", value: "SUBMITTED" },
              { label: "Docs Validados", value: "DOCS_VALIDATED" },
              { label: "Em Avaliação / Prova", value: "UNDER_REVIEW" },
              { label: "Aprovados", value: "APPROVED" },
              { label: "Lista de Espera", value: "WAITLIST" },
              { label: "Matriculados", value: "ENROLLED" },
              { label: "Não Admitidos", value: "REJECTED" },
            ]}
            value={statusFilter === "ALL" ? null : statusFilter}
            onChange={(val) => {
              setStatusFilter((val ?? "ALL") as AdmissionStatus | "ALL");
              setCurrentPage(1);
            }}
          />

          <FilterPopover
            label="Turno"
            icon="ListFilter"
            options={[
              { label: "Todos os Turnos", value: "ALL" },
              { label: "Manhã", value: "MORNING" },
              { label: "Tarde", value: "AFTERNOON" },
              { label: "Noite", value: "EVENING" },
            ]}
            value={shiftFilter === "ALL" ? null : shiftFilter}
            onChange={(val) => {
              setShiftFilter(val ?? "ALL");
              setCurrentPage(1);
            }}
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

      {/* Tabela de Candidaturas */}
      <ApplicationsList
        applications={paginatedApplications}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
      />

      {/* Modal de Nova Candidatura */}
      <CandidateApplicationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
}
