"use client";

import React, { useState, useMemo } from "react";
import {
  TitleList,
  DynamicMetricCard,
  PaginatedSelect,
  SelectField,
  Button,
  Icon,
  EmptyState,
} from "@/components";
import { useTeachingScope } from "@/hooks/school/use-teaching-scope";
import { useGradeSheet } from "@/hooks/school/use-grades";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";
import { AssessmentTerm } from "@/types/grade";
import { GradeEntryTable } from "./grade-entry-table";

const TERMS: { value: AssessmentTerm; label: string }[] = [
  { value: "TRIMESTER_1", label: "1.º Trimestre" },
  { value: "TRIMESTER_2", label: "2.º Trimestre" },
  { value: "TRIMESTER_3", label: "3.º Trimestre" },
];

export function GradesPageContent() {
  const { isTeacher, mySections: sections, getSubjectsForSection, isLoading: isScopeLoading } = useTeachingScope();

  const [pickedSectionId, setSelectedSectionId] = useState<string>("");
  const [pickedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<AssessmentTerm>("TRIMESTER_2");

  const selectedSectionId = useMemo(() => {
    if (pickedSectionId && sections.some((s) => s.id === pickedSectionId)) {
      return pickedSectionId;
    }
    return sections[0]?.id || "";
  }, [pickedSectionId, sections]);

  const availableSubjects = useMemo(() => {
    return getSubjectsForSection(selectedSectionId);
  }, [getSubjectsForSection, selectedSectionId]);

  const selectedSubjectId = useMemo(() => {
    if (pickedSubjectId && availableSubjects.some((s) => s.id === pickedSubjectId)) {
      return pickedSubjectId;
    }
    return availableSubjects[0]?.id || "";
  }, [pickedSubjectId, availableSubjects]);

  const { sheet: activeSheet, pautaStatus, isLoading, isMissingAssignment, saveGrade } = useGradeSheet(selectedSectionId, selectedSubjectId, selectedTerm);

  // Section Paginated Select
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

  const totalPages = Math.ceil(filteredSections.length / SECTION_PAGE_SIZE) || 1;

  const paginatedSections = useMemo(() => {
    const start = (sectionPage - 1) * SECTION_PAGE_SIZE;
    return filteredSections.slice(start, start + SECTION_PAGE_SIZE);
  }, [filteredSections, sectionPage]);

  const sectionOptions = useMemo(() => {
    const opts = paginatedSections.map((sec) => ({
      value: sec.id,
      label: `${sec.classLevel} ${sec.name} (${sec.shift === "MORNING" ? "Manhã" : "Tarde"})`,
      description: `${sec.currentEnrollmentCount} alunos`,
    }));

    if (
      selectedSectionId &&
      !opts.some((opt) => opt.value === selectedSectionId)
    ) {
      const selected = sections.find((s) => s.id === selectedSectionId);
      if (selected) {
        opts.unshift({
          value: selected.id,
          label: `${selected.classLevel} ${selected.name} (${selected.shift === "MORNING" ? "Manhã" : "Tarde"})`,
          description: `${selected.currentEnrollmentCount} alunos`,
        });
      }
    }
    return opts;
  }, [paginatedSections, selectedSectionId, sections]);

  // Subject options restritos ao escopo docente da turma
  const subjectOptions = useMemo(() => {
    return availableSubjects.map((subj) => ({
      value: subj.id,
      label: subj.name,
    }));
  }, [availableSubjects]);

  // A pauta geral da turma esta fechada?
  const isPautaClosed = pautaStatus === "fechada";

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
  if (!isScopeLoading && isTeacher && sections.length === 0) {
    return (
      <div className="space-y-6">
        <TitleList
          title="Lançamento de Notas (MED)"
          suTitle="Registo de notas e cálculo de MAC, NPP e NPT com recálculo automático de MAS e MT oficial (Decreto Executivo n.º 424/25)."
        />
        <EmptyState
          icon="BookOpen"
          title="Nenhuma Turma Atribuída"
          description="Não tem turmas atribuídas no presente ano lectivo. Os professores apenas podem lançar notas das turmas e disciplinas que lhes foram formalmente atribuídas pela Direcção Pedagógica."
        />
      </div>
    );
  }

  const selectedSubject = availableSubjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TitleList
        title="Lançamento de Notas (MED)"
        suTitle="Registo de notas e cálculo de MAC, NPP e NPT com recálculo automático de MAS e MT oficial (Decreto Executivo n.º 424/25)."
      />

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
          title={isPautaClosed ? "Pauta fechada" : "Em lançamento"}
          subtitle="Estado da pauta"
          description={
            isPautaClosed
              ? "Fechada pela Direcção: as notas já não se alteram (só por reapreciação)"
              : "As notas lançadas ficam guardadas; a Direcção fecha a pauta da turma"
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
          onSetStatus={(enrollmentId, field, status) => saveGrade.mutate({ enrollmentId, field, status }, { onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar o estado.")) })}
          onUpdateGrade={(enrollmentId, field, value) => {
            if (value === undefined) {
              ErrorMessage("Não é possível apagar uma nota lançada; corrija o valor.");
              return;
            }
            saveGrade.mutate({ enrollmentId, field, value }, { onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a nota.")) });
          }}
        />
      ) : (
        <div className="p-8 text-center text-muted-foreground text-sm border rounded-lg bg-card">
          {isLoading
            ? "A carregar a mini-pauta…"
            : availableSubjects.length === 0
              ? isTeacher
                ? "Não lecciona nenhuma disciplina nesta turma."
                : "Esta turma não possui disciplinas atribuídas (Académico → Atribuições)."
              : isMissingAssignment
                ? "Esta disciplina não está atribuída a esta turma (Académico → Atribuições)."
                : "Selecione uma turma e disciplina para carregar a mini-pauta."}
        </div>
      )}
    </div>
  );
}
