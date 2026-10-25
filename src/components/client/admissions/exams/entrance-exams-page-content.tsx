"use client";
import { formatDate } from "@/utils";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, Icon, type Column } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useAdmissions } from "@/hooks/school/use-admissions";
import { EntranceExam, AdmissionApplication } from "@/types/admission";
import { GradeExamModal } from "../grade-exam-modal";

const EXAM_STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  SCHEDULED: { label: "Agendada", variant: "outline" },
  IN_PROGRESS: { label: "A Decorrer", variant: "secondary" },
  GRADING: { label: "Em Correção", variant: "secondary" },
  COMPLETED: { label: "Concluída", variant: "default" },
};

export function EntranceExamsPageContent() {
  const { entranceExams, applications } = useAdmissions();
  const [selectedExamId, setSelectedExamId] = useState<string>(entranceExams[0]?.id || "");
  const [gradingApp, setGradingApp] = useState<AdmissionApplication | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const selectedExam = entranceExams.find((e) => e.id === selectedExamId);

  // Candidates assigned to this exam
  const examCandidates = applications.filter((a) => a.entranceExamId === selectedExamId);
  const graded = applications.filter((a) => a.requiresEntranceExam && a.examScore !== undefined);
  const approvalRate = graded.length ? Math.round((graded.filter((a) => (a.examScore ?? 0) >= a.minPassingScore).length / graded.length) * 100) : 0;
  const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));

  const examColumns: Column<EntranceExam>[] = [
    {
      key: "title",
      header: "Prova de Acesso",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{item.title}</span>
          <span className="text-xs text-muted-foreground">{item.subjectName}</span>
        </div>
      ),
    },
    {
      key: "classLevelName",
      header: "Nível / Classe",
      render: (_, item) => (
        <span className="text-sm font-medium">{item.classLevelName}</span>
      ),
    },
    {
      key: "examDate",
      header: "Data & Sala",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground">
            {formatDate(item.examDate)} às{" "}
            {new Date(item.examDate).toLocaleTimeString("pt-AO", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-[11px] text-muted-foreground">{item.roomNumber}</span>
        </div>
      ),
    },
    {
      key: "enrolledCandidatesCount",
      header: "Candidatos",
      render: (_, item) => (
        <span className="text-xs font-semibold">
          {item.enrolledCandidatesCount} / {item.maxCapacity} inscritos
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => {
        const cfg = EXAM_STATUS_CONFIG[item.status] || {
          label: item.status,
          variant: "outline",
        };
        return (
          <Badge variant={cfg.variant} className="text-xs py-0.5">
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Pauta de Candidatos",
      render: (_, item) => (
        <Button
          variant={item.id === selectedExamId ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedExamId(item.id)}
          className="gap-1.5 text-xs"
        >
          <Icon name="Users" className="h-3.5 w-3.5" />
          {item.id === selectedExamId ? "Pauta Ativa" : "Ver Candidatos"}
        </Button>
      ),
    },
  ];

  const candidateColumns: Column<AdmissionApplication>[] = [
    {
      key: "applicationNumber",
      header: "N.º Candidatura",
      render: (_, item) => (
        <span className="font-mono text-xs font-medium">{item.applicationNumber}</span>
      ),
    },
    {
      key: "candidateName",
      header: "Nome do Candidato",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">{item.candidateName}</span>
          <span className="text-[11px] text-muted-foreground">BI: {item.candidateDocumentNumber}</span>
        </div>
      ),
    },
    {
      key: "examScore",
      header: "Nota Obtida (0 a 20)",
      render: (_, item) => {
        if (item.examScore !== undefined) {
          const isPassed = item.examScore >= item.minPassingScore;
          return (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                isPassed
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
              }`}
            >
              {item.examScore.toFixed(1)} valores ({isPassed ? "Aprovado" : "Não Apto"})
            </span>
          );
        }
        return (
          <span className="text-xs text-amber-600 dark:text-amber-400 italic">
            Aguardando correção
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => (
        <Badge
          variant={item.status === "APPROVED" ? "default" : item.status === "REJECTED" ? "destructive" : "outline"}
          className="text-xs py-0.5"
        >
          {item.status === "APPROVED"
            ? "Aprovado"
            : item.status === "WAITLIST"
            ? "Lista de Espera"
            : item.status === "REJECTED"
            ? "Reprovado"
            : "Em Avaliação"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: (_, item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setGradingApp(item);
            setIsGradingOpen(true);
          }}
          className="gap-1.5 text-xs text-primary hover:text-primary"
        >
          <Icon name="PenTool" className="h-3.5 w-3.5" />
          {item.examScore !== undefined ? "Alterar Nota" : "Lançar Nota"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header com TitleList */}
      <TitleList
        title="Provas & Exames de Acesso"
        suTitle="Convocatórias, pautas e lançamento de pontuações de admissão (purpose: prova_admissao)"
      />

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DynamicMetricCard
          title={entranceExams.length}
          subtitle="Total de Provas Programadas"
          icon="FileText"
          description="Exames cadastrados para o ano letivo"
        />
        <DynamicMetricCard
          title={entranceExams.reduce((acc, e) => acc + e.enrolledCandidatesCount, 0)}
          subtitle="Candidatos Convocados"
          icon="Users"
          description="Total de pré-inscritos a prestar prova"
        />
        <DynamicMetricCard
          title={`${approvalRate}%`}
          subtitle="Taxa de aprovação nos exames"
          icon="TrendingUp"
          description={`${graded.length} candidato(s) com nota lançada`}
        />
      </div>

      {/* Tabela de Provas de Acesso */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Icon name="Calendar" className="h-4 w-4 text-primary" />
          Calendário de Exames de Acesso
        </h3>
        <DataList<EntranceExam>
          prefix="provas"
          rows={entranceExams}
          columns={examColumns}
          pageSize={8}
          searchPlaceholder="Pesquisar prova, disciplina ou sala"
          searchText={(e) => `${e.title} ${e.subjectName} ${e.roomNumber}`}
          filters={[
            { key: "estado", label: "Estado", icon: "ListFilter", options: Object.entries(EXAM_STATUS_CONFIG).map(([value, c]) => ({ value, label: c.label })), match: (e, v) => e.status === v },
            { key: "classe", label: "Classe", icon: "GraduationCap", options: uniq(entranceExams.map((e) => e.classLevelName)).map((v) => ({ value: v, label: v })), match: (e, v) => e.classLevelName === v },
            { key: "disciplina", label: "Disciplina", icon: "BookOpen", options: uniq(entranceExams.map((e) => e.subjectName)).map((v) => ({ value: v, label: v })), match: (e, v) => e.subjectName === v },
            { key: "sala", label: "Sala", icon: "DoorOpen", options: uniq(entranceExams.map((e) => e.roomNumber)).map((v) => ({ value: v, label: v })), match: (e, v) => e.roomNumber === v },
          ]}
          dateFilters={[{ key: "data", label: "Data da prova", getDate: (e) => e.examDate }]}
          sorts={[
            { value: "data", label: "Data", compare: (a, b) => a.examDate.localeCompare(b.examDate) },
            { value: "titulo", label: "Título", compare: (a, b) => a.title.localeCompare(b.title, "pt") },
            { value: "inscritos", label: "Inscritos", compare: (a, b) => a.enrolledCandidatesCount - b.enrolledCandidatesCount },
          ]}
          emptyTitle="Nenhuma prova agendada"
          emptyDescription="As provas de acesso aparecem aqui quando forem criadas."
          emptyIcon="FileText"
        />
      </div>

      {/* Pauta dos Candidatos do Exame Selecionado */}
      {selectedExam && (
        <div className="space-y-3 pt-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon name="GraduationCap" className="h-4 w-4 text-primary" />
                Pauta Classificatória: {selectedExam.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedExam.roomNumber} • Data: {formatDate(selectedExam.examDate)} • Mínimo de Aprovação: {selectedExam.minPassingScore} valores
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {examCandidates.length} candidatos associados a esta prova
            </span>
          </div>

          <DataList<AdmissionApplication>
            prefix="pauta"
            rows={examCandidates}
            columns={candidateColumns}
            pageSize={10}
            searchPlaceholder="Pesquisar candidato, BI ou n.º de candidatura"
            searchText={(c) => `${c.candidateName} ${c.candidateDocumentNumber} ${c.applicationNumber}`}
            filters={[
              { key: "resultado", label: "Resultado", icon: "ListFilter", options: [{ value: "aprovado", label: "Aprovado na prova" }, { value: "reprovado", label: "Não apto" }, { value: "pendente", label: "Aguarda correção" }], match: (c, v) => (v === "pendente" ? c.examScore === undefined : c.examScore !== undefined && (v === "aprovado" ? c.examScore >= c.minPassingScore : c.examScore < c.minPassingScore)) },
              { key: "estado", label: "Estado", icon: "Flag", options: [{ value: "APPROVED", label: "Aprovado" }, { value: "WAITLIST", label: "Lista de espera" }, { value: "REJECTED", label: "Reprovado" }, { value: "UNDER_REVIEW", label: "Em avaliação" }], match: (c, v) => c.status === v },
              { key: "genero", label: "Género", icon: "User", options: [{ value: "MALE", label: "Masculino" }, { value: "FEMALE", label: "Feminino" }], match: (c, v) => c.candidateGender === v },
            ]}
            sorts={[
              { value: "nota", label: "Nota", compare: (a, b) => (a.examScore ?? -1) - (b.examScore ?? -1) },
              { value: "nome", label: "Nome", compare: (a, b) => a.candidateName.localeCompare(b.candidateName, "pt") },
            ]}
            emptyTitle="Sem candidatos nesta prova"
            emptyDescription="Ainda não há candidaturas associadas a esta prova."
            emptyIcon="Users"
          />
        </div>
      )}

      {/* Modal de Lançamento de Nota */}
      {gradingApp && (
        <GradeExamModal
          isOpen={isGradingOpen}
          onClose={() => {
            setIsGradingOpen(false);
            setGradingApp(null);
          }}
          application={gradingApp}
        />
      )}
    </div>
  );
}
