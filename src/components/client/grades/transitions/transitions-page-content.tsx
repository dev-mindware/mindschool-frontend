"use client";

import React, { useState, useMemo } from "react";
import {
  TitleList,
  DynamicMetricCard,
  PaginatedSelect,
  Button,
  Icon,
} from "@/components";
import { GenericTable, Column } from "@/components/common/generic-table";
import { Badge } from "@/components/ui/badge";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { useGradeStore } from "@/stores/school/grade-store";
import { ConsolidatedStudentRow } from "@/types/grade";
import Link from "next/link";

export function TransitionsPageContent() {
  const { sections } = useSchoolDataStore();
  const { getConsolidatedPauta } = useGradeStore();

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || "sec-7a"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Paginated Section Search
  const [sectionSearch, setSectionSearch] = useState("");
  const [sectionPage, setSectionPage] = useState(1);
  const SECTION_PAGE_SIZE = 5;

  const filteredSections = useMemo(() => {
    return sections.filter(
      (sec) =>
        sec.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        sec.classLevel.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        sec.roomNumber.toLowerCase().includes(sectionSearch.toLowerCase())
    );
  }, [sections, sectionSearch]);

  const totalSectionPages = Math.ceil(filteredSections.length / SECTION_PAGE_SIZE) || 1;

  const paginatedSections = useMemo(() => {
    const start = (sectionPage - 1) * SECTION_PAGE_SIZE;
    return filteredSections.slice(start, start + SECTION_PAGE_SIZE);
  }, [filteredSections, sectionPage]);

  const sectionOptions = useMemo(() => {
    const opts = paginatedSections.map((sec) => ({
      value: sec.id,
      label: `${sec.name} (${sec.shift === "MORNING" ? "Manhã" : "Tarde"})`,
      description: `${sec.classLevel} • ${sec.currentEnrollmentCount} alunos`,
    }));

    if (
      selectedSectionId &&
      !opts.some((opt) => opt.value === selectedSectionId)
    ) {
      const selected = sections.find((s) => s.id === selectedSectionId);
      if (selected) {
        opts.unshift({
          value: selected.id,
          label: `${selected.name} (${selected.shift === "MORNING" ? "Manhã" : "Tarde"})`,
          description: `${selected.classLevel} • ${selected.currentEnrollmentCount} alunos`,
        });
      }
    }
    return opts;
  }, [paginatedSections, selectedSectionId, sections]);

  // Obter Pauta Consolidada do 3º Trimestre (ou actual) para avaliar transições
  const pauta = useMemo(() => {
    return getConsolidatedPauta(selectedSectionId, "TRIMESTER_1");
  }, [getConsolidatedPauta, selectedSectionId]);

  const studentsList = pauta?.students || [];

  const filteredStudents = useMemo(() => {
    return studentsList.filter(
      (s) =>
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [studentsList, searchTerm]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  // Estatísticas de Transição
  const stats = useMemo(() => {
    const directApproval = studentsList.filter((s) => s.transitionStatus === "APPROVED").length;
    const conditionalApproval = studentsList.filter((s) => s.transitionStatus === "APPROVED_WITH_CONDITIONS").length;
    const recoveryCount = studentsList.filter((s) => s.transitionStatus === "RECOVERY_EXAM").length;
    const failedCount = studentsList.filter((s) => s.transitionStatus === "FAILED").length;
    return { directApproval, conditionalApproval, recoveryCount, failedCount };
  }, [studentsList]);

  const columns: Column<ConsolidatedStudentRow>[] = [
    {
      key: "studentName",
      header: "Estudante",
      render: (_, item) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {item.studentName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">
              {item.studentName}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {item.studentNumber}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "termAverageTotal",
      header: "Média Global",
      render: (_, item) => (
        <span
          className={`font-medium text-sm ${
            item.termAverageTotal >= 12
              ? "text-emerald-700 dark:text-emerald-400"
              : item.termAverageTotal >= 10
              ? "text-blue-700 dark:text-blue-400"
              : "text-amber-700 dark:text-amber-400"
          }`}
        >
          {item.termAverageTotal.toFixed(1)} / 20
        </span>
      ),
    },
    {
      key: "failedSubjectsCount",
      header: "Disciplinas Não Concluídas",
      render: (_, item) => {
        if (item.failedSubjectsCount === 0) {
          return (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Icon name="CircleCheck" className="h-3.5 w-3.5" />
              Nenhuma
            </span>
          );
        }
        return (
          <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
            <Icon name="CircleAlert" className="h-3.5 w-3.5" />
            {item.failedSubjectsCount} disciplina{item.failedSubjectsCount > 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      key: "transitionStatus",
      header: "Deliberação Legal MED",
      render: (_, item) => {
        switch (item.transitionStatus) {
          case "APPROVED":
            return (
              <Badge variant="default" className="text-xs bg-emerald-600 text-white hover:bg-emerald-600">
                <Icon name="CircleCheck" className="h-3 w-3 mr-1" />
                Transita Directo
              </Badge>
            );
          case "APPROVED_WITH_CONDITIONS":
            return (
              <Badge
                variant="outline"
                className="text-xs border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950/30"
              >
                <Icon name="Scale" className="h-3 w-3 mr-1" />
                Excepção Legal 7ª/8ª
              </Badge>
            );
          case "RECOVERY_EXAM":
            return (
              <Badge
                variant="outline"
                className="text-xs border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/30"
              >
                <Icon name="Clock" className="h-3 w-3 mr-1" />
                Prova de Recurso
              </Badge>
            );
          case "FAILED":
            return (
              <Badge variant="destructive" className="text-xs">
                <Icon name="CircleX" className="h-3 w-3 mr-1" />
                Não Transita (Retido)
              </Badge>
            );
          default:
            return null;
        }
      },
    },
    {
      key: "exceptionApplied",
      header: "Fundamentação & Observação",
      render: (_, item) => (
        <span className="text-xs text-muted-foreground truncate max-w-[240px] block" title={item.exceptionApplied}>
          {item.exceptionApplied || "Aprovação curricular regular conforme Decreto Executivo n.º 424/25."}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: (_, item) => (
        <Link href={`/certificates/report-cards?studentId=${item.studentId}`}>
          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1.5">
            <Icon name="ScrollText" className="h-3.5 w-3.5" />
            Ver Boletim
          </Button>
        </Link>
      ),
    },
  ];

  const handlePrintAta = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <TitleList
        title="Motor de Transição de Classe (Conselho de Notas)"
        suTitle="Aplicação automatizada das regras do Decreto Executivo n.º 424/25 e regime de excepções da 7.ª e 8.ª classe."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintAta} className="gap-2">
            <Icon name="Printer" className="h-4 w-4" />
            Imprimir Ata do Conselho
          </Button>
          <Link href="/grades/pautas">
            <Button variant="default" size="sm" className="gap-2">
              <Icon name="ClipboardList" className="h-4 w-4" />
              Pautas Trimestrais
            </Button>
          </Link>
        </div>
      </TitleList>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={stats.directApproval.toString()}
          subtitle="Aprovados Directos"
          description="Sem deficiências em disciplinas"
          icon="CircleCheck"
        />
        <DynamicMetricCard
          title={stats.conditionalApproval.toString()}
          subtitle="Excepções Legais"
          description="Art.º 24.º Dec. 424/25 (7ª e 8ª)"
          icon="Scale"
        />
        <DynamicMetricCard
          title={stats.recoveryCount.toString()}
          subtitle="Prova de Recurso"
          description="Até 2 disciplinas para 2ª época"
          icon="CircleHelp"
        />
        <DynamicMetricCard
          title={stats.failedCount.toString()}
          subtitle="Não Transitam"
          description="Retidos por deficiências críticas"
          icon="CircleX"
        />
      </div>

      {/* Banner Informativo Legal do MED */}
      <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-blue-950 dark:text-blue-200 space-y-1.5">
        <div className="font-bold flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
          <Icon name="BookOpen" className="h-4 w-4" />
          Regulamento de Avaliação do Ensino Geral — Decreto Executivo n.º 424/25
        </div>
        <p>
          <strong>Regra Geral:</strong> Transição para o ano seguinte requer nota final de disciplina (MFD) ≥ 10.0 valores em todas as disciplinas curriculares.
        </p>
        <p>
          <strong>Regime Especial 7.ª e 8.ª classe (Art.º 24.º):</strong> Podem transitar estudantes com até 2 (duas) disciplinas entre 7.0 e 9.4 valores, desde que estas <strong>não sejam simultaneamente Língua Portuguesa e Matemática</strong>.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-lg border bg-card shadow-xs">
        <div className="w-full sm:w-80">
          <PaginatedSelect
            options={sectionOptions}
            value={selectedSectionId}
            onChange={setSelectedSectionId}
            placeholder="Pesquise por nome da turma ou sala..."
            searchValue={sectionSearch}
            onSearchChange={(val) => {
              setSectionSearch(val);
              setSectionPage(1);
            }}
            pagination={{
              page: sectionPage,
              totalPages: totalSectionPages,
            }}
            onPageChange={setSectionPage}
            fullWidth
          />
        </div>

        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Pesquisar estudante por nome ou número..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Tabela de Transições */}
      <div className="rounded-lg border bg-card">
        <GenericTable<ConsolidatedStudentRow>
          columns={columns}
          data={paginatedStudents}
          page={currentPage}
          totalPages={totalPages}
          total={filteredStudents.length}
          setPage={setCurrentPage}
          goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          emptyMessage="Nenhum estudante encontrado para deliberação de conselho."
        />
      </div>
    </div>
  );
}
