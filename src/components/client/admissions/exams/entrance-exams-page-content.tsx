"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { GenericTable, Column } from "@/components/common/generic-table";
import { useAdmissionStore } from "@/stores/school/admission-store";
import { EntranceExam, AdmissionApplication } from "@/types/admission";
import { GradeExamModal } from "../grade-exam-modal";

const EXAM_STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  SCHEDULED: { label: "Agendada", variant: "outline" },
  IN_PROGRESS: { label: "A Decorrer", variant: "secondary" },
  GRADING: { label: "Em Correção", variant: "secondary" },
  COMPLETED: { label: "Concluída", variant: "default" },
};

export function EntranceExamsPageContent() {
  const { entranceExams, applications } = useAdmissionStore();
  const [selectedExamId, setSelectedExamId] = useState<string>(entranceExams[0]?.id || "");
  const [gradingApp, setGradingApp] = useState<AdmissionApplication | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const selectedExam = entranceExams.find((e) => e.id === selectedExamId);

  // Candidates assigned to this exam
  const examCandidates = applications.filter((a) => a.entranceExamId === selectedExamId);

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
            {new Date(item.examDate).toLocaleDateString("pt-AO")} às{" "}
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Provas & Exames de Acesso"
          suTitle="Convocatórias, pautas e lançamento de pontuações de admissão (purpose: prova_admissao)"
        />
        <Link href="/students/admissions">
          <Button variant="outline" className="gap-2">
            <Icon name="ArrowLeft" className="w-4 h-4" />
            Voltar a Candidaturas
          </Button>
        </Link>
      </div>

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DynamicMetricCard
          title={entranceExams.length}
          subtitle="Total de Provas Programadas"
          icon="FileText"
          description="Exames cadastrados para o ano lectivo"
        />
        <DynamicMetricCard
          title={entranceExams.reduce((acc, e) => acc + e.enrolledCandidatesCount, 0)}
          subtitle="Candidatos Convocados"
          icon="Users"
          description="Total de pré-inscritos a prestar prova"
        />
        <DynamicMetricCard
          title="74.2%"
          subtitle="Média de Aprovação nos Exames"
          icon="TrendingUp"
          description="Taxa de aproveitamento >= 10 valores"
        />
      </div>

      {/* Tabela de Provas de Acesso */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Icon name="Calendar" className="h-4 w-4 text-primary" />
          Calendário de Exames de Acesso
        </h3>
        <div className="rounded-lg border bg-card">
          <GenericTable<EntranceExam>
            columns={examColumns}
            data={entranceExams}
            page={1}
            totalPages={1}
            total={entranceExams.length}
            setPage={() => {}}
            goToNextPage={() => {}}
            goToPreviousPage={() => {}}
          />
        </div>
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
                {selectedExam.roomNumber} • Data: {new Date(selectedExam.examDate).toLocaleDateString("pt-AO")} • Mínimo de Aprovação: {selectedExam.minPassingScore} valores
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {examCandidates.length} candidatos associados a esta prova
            </span>
          </div>

          <div className="rounded-lg border bg-card">
            <GenericTable<AdmissionApplication>
              columns={candidateColumns}
              data={examCandidates}
              page={1}
              totalPages={1}
              total={examCandidates.length}
              setPage={() => {}}
              goToNextPage={() => {}}
              goToPreviousPage={() => {}}
            />
          </div>
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
