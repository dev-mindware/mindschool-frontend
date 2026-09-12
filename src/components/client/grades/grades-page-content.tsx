"use client";

import React, { useState, useMemo } from "react";
import {
  TitleList,
  DynamicMetricCard,
  PaginatedSelect,
  SelectField,
  Button,
  Icon,
} from "@/components";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { useGradeStore } from "@/stores/school/grade-store";
import { AssessmentTerm } from "@/types/grade";
import { GradeEntryTable } from "./grade-entry-table";
import Link from "next/link";

const TERMS: { value: AssessmentTerm; label: string }[] = [
  { value: "TRIMESTER_1", label: "1.º Trimestre" },
  { value: "TRIMESTER_2", label: "2.º Trimestre" },
  { value: "TRIMESTER_3", label: "3.º Trimestre" },
];

export function GradesPageContent() {
  const { sections, subjects } = useSchoolDataStore();
  const {
    getSectionGradeSheet,
    updateGradeEntry,
    lockMiniPauta,
    closedPautas,
  } = useGradeStore();

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || "sec-7a"
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || "sub-mat"
  );
  const [selectedTerm, setSelectedTerm] = useState<AssessmentTerm>("TRIMESTER_1");

  // Section Paginated Select
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

  const totalPages = Math.ceil(filteredSections.length / SECTION_PAGE_SIZE) || 1;

  const paginatedSections = useMemo(() => {
    const start = (sectionPage - 1) * SECTION_PAGE_SIZE;
    return filteredSections.slice(start, start + SECTION_PAGE_SIZE);
  }, [filteredSections, sectionPage]);

  const sectionOptions = useMemo(() => {
    const opts = paginatedSections.map((sec) => ({
      value: sec.id,
      label: `${sec.name} (${sec.shift === "MORNING" ? "Manhã" : "Tarde"})`,
      description: `${sec.roomNumber} • ${sec.currentEnrollmentCount} alunos`,
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
          description: `${selected.roomNumber} • ${selected.currentEnrollmentCount} alunos`,
        });
      }
    }
    return opts;
  }, [paginatedSections, selectedSectionId, sections]);

  // Subject options
  const subjectOptions = useMemo(() => {
    return subjects.map((subj) => ({
      value: subj.id,
      label: `${subj.name} (${subj.code})`,
    }));
  }, [subjects]);

  // Obter Mini-Pauta activa
  const activeSheet = useMemo(() => {
    return getSectionGradeSheet(selectedSectionId, selectedSubjectId, selectedTerm);
  }, [getSectionGradeSheet, selectedSectionId, selectedSubjectId, selectedTerm]);

  // Checar se a pauta geral da turma está fechada
  const pautaKey = `${selectedSectionId}_${selectedTerm}`;
  const isPautaClosed = !!closedPautas[pautaKey]?.isClosed;

  // Métricas da Mini-Pauta
  const stats = useMemo(() => {
    if (!activeSheet || activeSheet.entries.length === 0) {
      return {
        totalStudents: 0,
        average: 0,
        passingRate: 0,
        pendingCount: 0,
      };
    }

    const totalStudents = activeSheet.entries.length;
    const graded = activeSheet.entries.filter((e) => e.termAverage !== undefined);
    const sum = graded.reduce((acc, e) => acc + (e.termAverage || 0), 0);
    const average = graded.length > 0 ? Number((sum / graded.length).toFixed(1)) : 0;
    const approved = graded.filter((e) => (e.termAverage || 0) >= 10);
    const passingRate = graded.length > 0 ? Number(((approved.length / graded.length) * 100).toFixed(1)) : 0;
    const pendingCount = totalStudents - graded.length;

    return { totalStudents, average, passingRate, pendingCount };
  }, [activeSheet]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TitleList
        title="Lançamento de Notas (MED)"
        suTitle="Registo de notas e cálculo de MAC, NPP e NPT com recálculo automático de MAS e MT oficial (Decreto Executivo n.º 424/25)."
      >
        <div className="flex items-center gap-2">
          <Link href="/grades/pautas">
            <Button variant="outline" size="sm" className="gap-2">
              <Icon name="ClipboardList" className="h-4 w-4" />
              Pautas Trimestrais
            </Button>
          </Link>
          <Link href="/grades/transitions">
            <Button variant="outline" size="sm" className="gap-2">
              <Icon name="CircleCheck" className="h-4 w-4" />
              Conselho de Transições
            </Button>
          </Link>
        </div>
      </TitleList>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${stats.average.toFixed(1)} / 20`}
          subtitle="Média da Disciplina"
          description={`${selectedSubject?.name || "Disciplina"} na ${selectedSection?.name || "Turma"}`}
          icon="TrendingUp"
        />
        <DynamicMetricCard
          title={`${stats.passingRate.toFixed(1)}%`}
          subtitle="Taxa de Positivas"
          description="Alunos com MT ≥ 10.0 valores"
          icon="Award"
        />
        <DynamicMetricCard
          title={stats.pendingCount.toString()}
          subtitle="Notas Pendentes"
          description={
            stats.pendingCount === 0
              ? "100% dos alunos avaliados"
              : "Alunos sem nota final calculada"
          }
          icon="Clock"
        />
        <DynamicMetricCard
          title={
            isPautaClosed
              ? "Pauta Homologada"
              : activeSheet?.isLocked
              ? "Mini-Pauta Trancada"
              : "Em Aberto"
          }
          subtitle="Estado de Submissão"
          description={
            isPautaClosed
              ? "Pauta Geral fechada pela Direcção"
              : activeSheet?.isLocked
              ? "Submetida pelo docente à Direcção"
              : "Edição permitida ao docente"
          }
          icon={isPautaClosed ? "ShieldCheck" : activeSheet?.isLocked ? "Lock" : "FileSpreadsheet"}
        />
      </div>

      {/* Barra de Filtros e Selecção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border bg-card shadow-xs">
        {/* Turma (PaginatedSelect) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Turma Seleccionada
          </label>
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
              totalPages,
            }}
            onPageChange={setSectionPage}
            fullWidth
          />
        </div>

        {/* Disciplina */}
        <div>
          <SelectField
            label="Disciplina Curricular"
            options={subjectOptions}
            value={selectedSubjectId}
            onValueChange={setSelectedSubjectId}
            placeholder="Selecione a disciplina..."
          />
        </div>

        {/* Trimestre */}
        <div>
          <SelectField
            label="Trimestre de Avaliação"
            options={TERMS}
            value={selectedTerm}
            onValueChange={(val) => setSelectedTerm(val as AssessmentTerm)}
            placeholder="Selecione o trimestre..."
          />
        </div>
      </div>

      {/* Tabela de Lançamento */}
      {activeSheet ? (
        <GradeEntryTable
          sheet={activeSheet}
          isPautaClosed={isPautaClosed}
          onUpdateGrade={(studentId, field, value) => {
            updateGradeEntry(
              selectedSectionId,
              selectedSubjectId,
              selectedTerm,
              studentId,
              field,
              value
            );
          }}
          onLockSheet={() => {
            lockMiniPauta(
              selectedSectionId,
              selectedSubjectId,
              selectedTerm,
              "Prof. Docente"
            );
          }}
        />
      ) : (
        <div className="p-8 text-center text-muted-foreground text-sm border rounded-lg">
          Selecione uma turma e disciplina para carregar a mini-pauta.
        </div>
      )}
    </div>
  );
}
