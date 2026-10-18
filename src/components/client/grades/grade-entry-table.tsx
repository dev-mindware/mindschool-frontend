"use client";
import { ScoreCell } from "./score-cell";
import { formatDate } from "@/utils";

import React, { useState } from "react";
import { ClassSubjectGradeSheet, StudentGradeEntry } from "@/types/grade";
import { Badge } from "@/components/ui/badge";
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

export function GradeEntryTable({
  sheet,
  isPautaClosed,
  onUpdateGrade,
  onSetStatus,
}: GradeEntryTableProps) {
  const isReadOnly = sheet.isLocked || isPautaClosed;
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
        <span className="text-xs text-muted-foreground italic">Pendente</span>
      );
    }
    // positiva a partir da nota mínima da escola (Políticas); o regime de excepção só se aplica na transição, não aqui
    if (score >= passMark) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-success-border bg-success-muted text-success">
          {score.toFixed(1)} ✓ positiva
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-destructive-border bg-destructive-muted text-destructive">
        {score.toFixed(1)} ✗ negativa
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Banner de Estado da Mini-Pauta */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border bg-card text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
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
                variant={isPautaClosed ? "default" : sheet.isLocked ? "secondary" : "outline"}
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
              Docente: {sheet.teacherName} • Última actualização:{" "}
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
              As notas ficam guardadas ao lançar. Quem fecha a pauta da turma é a Direcção.
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
      <div className="rounded-lg border bg-card overflow-x-auto shadow-sm">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3 w-10 text-center">N.º</th>
              <th className="py-3 px-3 min-w-[200px]">Nome do Estudante</th>
              <th className="py-3 px-3 text-center w-28 bg-info-muted/30">
                <div className="flex items-center justify-center gap-1 font-medium text-foreground">MAC <HelpHint term="mac" /></div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  Avaliação contínua
                </span>
              </th>
              <th className="py-3 px-3 text-center w-28 bg-info-muted/30">
                <div className="flex items-center justify-center gap-1 font-medium text-foreground">NPP <HelpHint term="npp" /></div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  Avaliação sistemática
                </span>
              </th>
              <th className="py-3 px-3 text-center w-24 bg-muted/60">
                <div className="flex items-center justify-center gap-1 font-medium text-primary">MAS <HelpHint term="mas" /></div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  Média das sistemáticas
                </span>
              </th>
              <th className="py-3 px-3 text-center w-28 bg-primary/5">
                <div className="flex items-center justify-center gap-1 font-medium text-foreground">NPT <HelpHint term="npt" /></div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  Prova trimestral
                </span>
              </th>
              <th className="py-3 px-3 text-center w-24 bg-muted/60">
                <div className="flex items-center justify-center gap-1 font-medium text-primary">MT <HelpHint term="mt" /></div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  Média ponderada
                </span>
              </th>
              <th className="py-3 px-3 text-center w-28">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sheet.entries.map((entry, index) => {
              return (
                <tr
                  key={entry.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-foreground text-sm">
                      {entry.studentName}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {entry.studentNumber}
                    </div>
                  </td>

                  {/* Input MAC */}
                  <ScoreCell
                    value={entry.continuousAssessment}
                    status={entry.statuses?.continuousAssessment}
                    readOnly={isReadOnly}
                    tone="bg-info-muted/15"
                    onValueChange={(raw) => handleInputChange(entry.studentId, "continuousAssessment", raw)}
                    onStatusChange={onSetStatus ? (s) => onSetStatus(entry.studentId, "continuousAssessment", s) : undefined}
                  />

                  {/* Input NPP */}
                  <ScoreCell
                    value={entry.teacherTest}
                    status={entry.statuses?.teacherTest}
                    readOnly={isReadOnly}
                    tone="bg-info-muted/15"
                    onValueChange={(raw) => handleInputChange(entry.studentId, "teacherTest", raw)}
                    onStatusChange={onSetStatus ? (s) => onSetStatus(entry.studentId, "teacherTest", s) : undefined}
                  />

                  {/* MAS Calculado */}
                  <td className="py-2.5 px-3 text-center font-medium text-foreground bg-muted/30">
                    {entry.systematicAverage !== undefined
                      ? entry.systematicAverage.toFixed(1)
                      : "—"}
                  </td>

                  {/* Input NPT */}
                  <ScoreCell
                    value={entry.termExam}
                    status={entry.statuses?.termExam}
                    readOnly={isReadOnly}
                    tone="bg-primary/5"
                    onValueChange={(raw) => handleInputChange(entry.studentId, "termExam", raw)}
                    onStatusChange={onSetStatus ? (s) => onSetStatus(entry.studentId, "termExam", s) : undefined}
                  />

                  {/* MT Calculado Oficial */}
                  <td className="py-2.5 px-3 text-center font-medium text-foreground bg-muted/30">
                    {entry.termAverage !== undefined
                      ? entry.termAverage.toFixed(1)
                      : "—"}
                  </td>

                  {/* Badge de Estado */}
                  <td className="py-2.5 px-3 text-center">
                    {getScoreBadge(entry.termAverage)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
