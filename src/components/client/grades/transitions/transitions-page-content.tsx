"use client";

import React, { useState, useMemo } from "react";
import {
  TitleList,
  DynamicMetricCard,
  PaginatedSelect,
  DataList,
  type Column,
  Button,
  Icon,
} from "@/components";
import { Badge } from "@/components/ui/badge";
import { useSections } from "@/hooks/school/use-sections";
import { useTransitions } from "@/hooks/school/use-transitions";
import { ConsolidatedStudentRow } from "@/types/grade";
import { TransitionsExportModal } from "./transitions-export-modal";
import Link from "next/link";

export function TransitionsPageContent() {
  const { data: sections = [] } = useSections();

  const [pickedSectionId, setSelectedSectionId] = useState<string>("");
  const selectedSectionId = pickedSectionId || sections[0]?.id || "";
  const [isExportOpen, setIsExportOpen] = useState(false);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId),
    [sections, selectedSectionId]
  );

  // Paginated Section Search
  const [sectionSearch, setSectionSearch] = useState("");
  const [sectionPage, setSectionPage] = useState(1);
  const SECTION_PAGE_SIZE = 5;

  const filteredSections = useMemo(() => {
    return sections.filter(
      (sec) =>
        sec.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        sec.classLevel.toLowerCase().includes(sectionSearch.toLowerCase())
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

  // Propostas de progressão da API (exigem as pautas de todos os períodos fechadas)
  const { students: studentsList } = useTransitions(selectedSectionId);

  // Estatísticas de Transição
  const stats = useMemo(() => {
    const directApproval = studentsList.filter((s) => s.transitionStatus === "APPROVED").length;
    const conditionalApproval = studentsList.filter((s) => s.transitionStatus === "APPROVED_WITH_CONDITIONS").length;
    const failedCount = studentsList.filter((s) => s.transitionStatus === "FAILED").length;
    return { directApproval, conditionalApproval, failedCount };
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
                Transita Direto
              </Badge>
            );
          case "APPROVED_WITH_CONDITIONS":
            return (
              <Badge
                variant="outline"
                className="text-xs border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950/30"
              >
                <Icon name="Scale" className="h-3 w-3 mr-1" />
                Exceção Legal 7ª/8ª
              </Badge>
            );
          case "FAILED":
            return (
              <Badge variant="destructive" className="text-xs">
                <Icon name="CircleX" className="h-3 w-3 mr-1" />
                Não transita (proposta)
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

    return (
    <div className="space-y-6">
      <TitleList
        title="Motor de Transição de Classe (Conselho de Notas)"
        suTitle="Aplicação automatizada das regras do Decreto Executivo n.º 424/25 e regime de exceções da 7.ª e 8.ª classe."
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExportOpen(true)}
            className="gap-2"
          >
            <Icon name="Download" className="h-4 w-4" />
            <span>Baixar Ata (PDF)</span>
          </Button>
        </div>
      </TitleList>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DynamicMetricCard
          title={stats.directApproval.toString()}
          subtitle="Aprovados Diretos"
          description="Sem deficiências em disciplinas"
          icon="CircleCheck"
        />
        <DynamicMetricCard
          title={stats.conditionalApproval.toString()}
          subtitle="Exceções Legais"
          description="Art.º 24.º Dec. 424/25 (7ª e 8ª)"
          icon="Scale"
        />
        <DynamicMetricCard
          title={stats.failedCount.toString()}
          subtitle="Não Transitam"
          description="Proposta: alguma disciplina abaixo da nota mínima"
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
          <strong>Regime de exceção (7.ª e 8.ª classe), se estiver ativo:</strong> pode transitar com apoio quem tiver, no máximo, o número de disciplinas negativas definido pela escola, com notas dentro do intervalo definido, e <strong>nenhuma delas nuclear (Língua Portuguesa ou Matemática)</strong>. Os valores estão em Definições › Políticas da Escola.
        </p>
        <p>
          <strong>Isto é uma proposta do sistema.</strong> A decisão final é tomada e registada no Conselho de Turma final (Avaliação › Conselhos de Turma); se divergir da proposta, exige justificação.
        </p>
      </div>

      <DataList<ConsolidatedStudentRow>
        prefix="transicoes"
        rows={studentsList}
        columns={columns}
        pageSize={10}
        toolbar={
          <div className="w-full sm:w-72">
            <PaginatedSelect
              options={sectionOptions}
              value={selectedSectionId}
              onChange={setSelectedSectionId}
              placeholder="Turma..."
              searchValue={sectionSearch}
              onSearchChange={(val) => {
                setSectionSearch(val);
                setSectionPage(1);
              }}
              pagination={{ page: sectionPage, totalPages: totalSectionPages }}
              onPageChange={setSectionPage}
              fullWidth
            />
          </div>
        }
        searchPlaceholder="Pesquisar estudante por nome ou número"
        searchText={(r) => `${r.studentName} ${r.studentNumber}`}
        filters={[
          { key: "situacao", label: "Situação", icon: "ListFilter", options: [{ value: "APPROVED", label: "Aprovado" }, { value: "APPROVED_WITH_CONDITIONS", label: "Exceção legal" }, { value: "FAILED", label: "Não transita" }], match: (r, v) => r.transitionStatus === v },
          { key: "deficiencias", label: "Disciplinas negativas", icon: "TriangleAlert", options: [{ value: "0", label: "Nenhuma" }, { value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3 ou mais" }], match: (r, v) => (v === "3" ? r.failedSubjectsCount >= 3 : r.failedSubjectsCount === Number(v)) },
          { key: "media", label: "Média global", icon: "Gauge", options: [{ value: "alta", label: "14 ou mais" }, { value: "media", label: "10 a 13,9" }, { value: "baixa", label: "Abaixo de 10" }], match: (r, v) => (v === "alta" ? r.termAverageTotal >= 14 : v === "media" ? r.termAverageTotal >= 10 && r.termAverageTotal < 14 : r.termAverageTotal < 10) },
        ]}
        sorts={[
          { value: "media", label: "Média global", compare: (a, b) => a.termAverageTotal - b.termAverageTotal },
          { value: "nome", label: "Nome", compare: (a, b) => a.studentName.localeCompare(b.studentName, "pt") },
          { value: "negativas", label: "Disciplinas negativas", compare: (a, b) => a.failedSubjectsCount - b.failedSubjectsCount },
        ]}
        emptyTitle="Nenhum estudante para deliberação"
        emptyDescription="Escolha uma turma com pautas fechadas."
        emptyIcon="Scale"
      />

      <TransitionsExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        sectionName={selectedSection?.name || "Turma"}
        classLevel={selectedSection?.classLevel || "7.ª Classe"}
        shift={selectedSection?.shift || "Manhã"}
        students={studentsList}
        stats={stats}
      />
    </div>
  );
}
