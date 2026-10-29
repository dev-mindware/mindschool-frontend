"use client";
import { useCan } from "@/hooks/auth/use-can";
import { ScoreCell } from "./score-cell";
import { formatDate } from "@/utils";

import React, { useMemo } from "react";
import { ClassSubjectGradeSheet, StudentGradeEntry } from "@/types/grade";
import { Badge } from "@/components/ui/badge";
import { GenericTable, type Column } from "@/components/common/generic-table";
import { HelpHint, Icon } from "@/components";
import { useQuery } from "@tanstack/react-query";
import { readRawSettings } from "@/services/school-settings-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { ErrorMessage } from "@/utils/messages";

interface GradeEntryTableProps {
  sheet: ClassSubjectGradeSheet;
  isPautaClosed: boolean;
  onUpdateGrade: (
    studentId: string,
    field: "continuousAssessment" | "teacherTest" | "termExam",
    value: number | undefined
  ) => void;
  onSetStatus?: (studentId: string, field: "continuousAssessment" | "teacherTest" | "termExam", status: "avaliado" | "ausente" | "dispensado" | "nao_avaliado") => void;
}

type GradeRow = StudentGradeEntry & { index: number };

export function GradeEntryTable({
  sheet,
  isPautaClosed,
  onUpdateGrade,
  onSetStatus,
}: GradeEntryTableProps) {
  const canWrite = useCan().can("assessment:write", "grade:write");
  const isReadOnly = sheet.isLocked || isPautaClosed || !canWrite;
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const settings = useQuery({ queryKey: ["settings-raw", schoolId], queryFn: readRawSettings, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const passMark = Number((settings.data?.["evaluation"] as { pass_mark?: number } | undefined)?.pass_mark ?? 10);

  const handleInputChange = (
    studentId: string,
    field: "continuousAssessment" | "teacherTest" | "termExam",
    rawVal: string
  ) => {
    if (isReadOnly) return;

    if (rawVal.trim() === "") {
      onUpdateGrade(studentId, field, undefined);
      return;
    }

    const num = parseFloat(rawVal.replace(",", "."));
    if (isNaN(num)) return;

    if (num < 0 || num > 20) {
      ErrorMessage("As notas devem estar estritamente entre 0 e 20 valores (Decreto 424/25).");
      return;
    }

    onUpdateGrade(studentId, field, Number(num.toFixed(1)));
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) {
      return (
        <Badge variant="warning">Pendente</Badge>
      );
    }
    if (score >= passMark) {
      return (
        <Badge variant="success">
          {score.toFixed(1)} ✓ positiva
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        {score.toFixed(1)} ✗ negativa
      </Badge>
    );
  };

  const students: GradeRow[] = useMemo(
    () => sheet.entries.map((entry, index) => ({ ...entry, id: entry.id || entry.studentId, index: index + 1 })),
    [sheet.entries]
  );

  const columns: Column<GradeRow>[] = [
    {
      key: "index",
      header: "N.º",
      className: "w-10 text-center",
      render: (_, entry) => <span className="font-mono text-muted-foreground">{entry.index}</span>,
    },
    {
      key: "studentName",
      header: "Nome do Estudante",
      className: "min-w-[200px]",
      render: (_, entry) => (
        <div>
          <div className="font-medium text-foreground text-sm">{entry.studentName}</div>
          <div className="text-[10px] font-mono text-muted-foreground">{entry.studentNumber}</div>
        </div>
      ),
    },
    {
      key: "continuousAssessment",
      header: (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 font-medium text-foreground">MAC <HelpHint term="mac" /></div>
          <span className="text-[9px] font-normal text-muted-foreground normal-case">Avaliação contínua</span>
        </div>
      ),
      className: "text-center w-28",
      render: (_, entry) => (
        <ScoreCell
          value={entry.continuousAssessment}
          status={entry.statuses?.continuousAssessment}
          readOnly={isReadOnly}
          label={`${entry.studentName} — MAC (avaliação contínua)`}
          onValueChange={(raw) => handleInputChange(entry.studentId, "continuousAssessment", raw)}
          onStatusChange={onSetStatus ? (s) => onSetStatus(entry.studentId, "continuousAssessment", s) : undefined}
        />
      ),
    },
    {
      key: "teacherTest",
      header: (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 font-medium text-foreground">NPP <HelpHint term="npp" /></div>
          <span className="text-[9px] font-normal text-muted-foreground normal-case">Avaliação sistemática</span>
        </div>
      ),
      className: "text-center w-28",
      render: (_, entry) => (
        <ScoreCell
          value={entry.teacherTest}
          status={entry.statuses?.teacherTest}
          readOnly={isReadOnly}
          label={`${entry.studentName} — NPP (prova do professor)`}
          onValueChange={(raw) => handleInputChange(entry.studentId, "teacherTest", raw)}
          onStatusChange={onSetStatus ? (s) => onSetStatus(entry.studentId, "teacherTest", s) : undefined}
        />
      ),
    },
    {
      key: "systematicAverage",
      header: (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 font-medium text-primary">MAS <HelpHint term="mas" /></div>
          <span className="text-[9px] font-normal text-muted-foreground normal-case">Média das sistemáticas</span>
        </div>
      ),
      className: "text-center w-24",
      render: (_, entry) => (
        <span className="font-medium text-foreground">
          {entry.systematicAverage !== undefined ? entry.systematicAverage.toFixed(1) : "—"}
        </span>
      ),
    },
    {
      key: "termExam",
      header: (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 font-medium text-foreground">NPT <HelpHint term="npt" /></div>
          <span className="text-[9px] font-normal text-muted-foreground normal-case">Prova trimestral</span>
        </div>
      ),
      className: "text-center w-28",
      render: (_, entry) => (
        <ScoreCell
          value={entry.termExam}
          status={entry.statuses?.termExam}
          readOnly={isReadOnly}
          label={`${entry.studentName} — NPT (prova trimestral)`}
          onValueChange={(raw) => handleInputChange(entry.studentId, "termExam", raw)}
          onStatusChange={onSetStatus ? (s) => onSetStatus(entry.studentId, "termExam", s) : undefined}
        />
      ),
    },
    {
      key: "termAverage",
      header: (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 font-medium text-primary">MT <HelpHint term="mt" /></div>
          <span className="text-[9px] font-normal text-muted-foreground normal-case">Média ponderada</span>
        </div>
      ),
      className: "text-center w-24",
      render: (_, entry) => (
        <span className="font-medium text-foreground">
          {entry.termAverage !== undefined ? entry.termAverage.toFixed(1) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Resultado",
      className: "text-center w-28",
      render: (_, entry) => getScoreBadge(entry.termAverage),
    },
  ];

  return (
    <div className="space-y-4">
      {!canWrite && (
        <div role="note" className="flex items-center gap-2">
          <Badge variant="warning">Só consulta</Badge>
          <span className="text-xs text-muted-foreground">As notas são lançadas pelo professor da disciplina ou pela direção pedagógica.</span>
        </div>
      )}
      {/* Banner de Estado da Mini-Pauta */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-xs flex items-center justify-center shrink-0 ${
              isPautaClosed
                ? "bg-primary/10 text-primary border border-primary/20"
                : sheet.isLocked
                ? "bg-warning-muted text-warning border border-warning-border"
                : "bg-success-muted text-success border border-success-border"
            }`}
          >
            <Icon
              name={isPautaClosed ? "ShieldCheck" : sheet.isLocked ? "Lock" : "FilePenLine"}
              className="h-5 w-5"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                {sheet.subjectName} — {sheet.sectionName}
              </span>
              <Badge
                variant={isPautaClosed ? "default" : sheet.isLocked ? "warning" : "success"}
                className="text-[11px]"
              >
                {isPautaClosed
                  ? "Pauta Geral Fechada"
                  : sheet.isLocked
                  ? "Mini-Pauta Trancada"
                  : "Em Lançamento"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Docente: {sheet.teacherName} • Última atualização:{" "}
              {formatDate(sheet.updatedAt)}{" "}
              {new Date(sheet.updatedAt).toLocaleTimeString("pt-AO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPautaClosed && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Icon name="Info" className="h-3.5 w-3.5" />
              As notas ficam guardadas ao lançar. Quem fecha a pauta da turma é a Direção.
            </span>
          )}

          {isPautaClosed && (
            <span className="text-[11px] text-primary font-medium flex items-center gap-1">
              <Icon name="ShieldAlert" className="h-3.5 w-3.5" />
              Imutável (Fecho Geral Homologado)
            </span>
          )}
        </div>
      </div>

      {/* Grid de Lançamento Conforme Decreto 424/25 */}
      <GenericTable data={students} columns={columns} />

      {/* Nota de Rodapé Legal MED */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
        <Icon name="Info" className="h-3.5 w-3.5 text-info shrink-0" />
        <span>
          <strong>Como se calcula:</strong> a MT é a média ponderada de MAC, MAS e prova trimestral, pelos pesos e arredondamento definidos em Definições › Políticas da Escola, e só existe quando a prova trimestral está lançada. As médias recalculam-se a cada nota. «Ausente» conta 0 ou sai da média, conforme a política; «Dispensado/Não avaliado» sai sempre da média.
        </span>
      </div>
    </div>
  );
}
