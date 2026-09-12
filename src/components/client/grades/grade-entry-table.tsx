"use client";

import React, { useState } from "react";
import { ClassSubjectGradeSheet, StudentGradeEntry } from "@/types/grade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

interface GradeEntryTableProps {
  sheet: ClassSubjectGradeSheet;
  isPautaClosed: boolean;
  onUpdateGrade: (
    studentId: string,
    field: "continuousAssessment" | "teacherTest" | "termExam",
    value: number | undefined
  ) => void;
  onLockSheet: () => void;
}

export function GradeEntryTable({
  sheet,
  isPautaClosed,
  onUpdateGrade,
  onLockSheet,
}: GradeEntryTableProps) {
  const isReadOnly = sheet.isLocked || isPautaClosed;

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
    if (score >= 10) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {score.toFixed(1)} ✓
        </span>
      );
    }
    if (score >= 7.0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {score.toFixed(1)} (Rec.)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300">
        {score.toFixed(1)} ✗
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
                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50"
                : sheet.isLocked
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50"
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
              {new Date(sheet.updatedAt).toLocaleDateString("pt-AO")}{" "}
              {new Date(sheet.updatedAt).toLocaleTimeString("pt-AO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!sheet.isLocked && !isPautaClosed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onLockSheet();
                SucessMessage("Mini-pauta trancada pelo docente com sucesso!");
              }}
              className="gap-1.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950/20"
            >
              <Icon name="Lock" className="h-3.5 w-3.5" />
              Trancar Lançamento (Finalizar)
            </Button>
          )}

          {sheet.isLocked && !isPautaClosed && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <Icon name="CircleCheck" className="h-3.5 w-3.5" />
              Entregue à Direcção Pedagógica
            </span>
          )}

          {isPautaClosed && (
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
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
              <th className="py-3 px-3 text-center w-28 bg-blue-50/40 dark:bg-blue-950/20">
                <div className="font-medium text-foreground">MAC</div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  Avaliação Contínua
                </span>
              </th>
              <th className="py-3 px-3 text-center w-28 bg-blue-50/40 dark:bg-blue-950/20">
                <div className="font-medium text-foreground">NPP</div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  Prova do Professor
                </span>
              </th>
              <th className="py-3 px-3 text-center w-24 bg-muted/60">
                <div className="font-medium text-primary">MAS</div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  (MAC + NPP)/2
                </span>
              </th>
              <th className="py-3 px-3 text-center w-28 bg-indigo-50/40 dark:bg-indigo-950/20">
                <div className="font-medium text-foreground">NPT</div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  Prova Trimestral
                </span>
              </th>
              <th className="py-3 px-3 text-center w-24 bg-muted/60">
                <div className="font-medium text-primary">MT</div>
                <span className="text-[9px] font-normal text-muted-foreground">
                  (2·MAS + NPT)/3
                </span>
              </th>
              <th className="py-3 px-3 text-center w-28">Estado MED</th>
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
                  <td className="py-2 px-2 text-center bg-blue-50/20 dark:bg-blue-950/10">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      disabled={isReadOnly}
                      value={entry.continuousAssessment ?? ""}
                      placeholder="0.0 - 20"
                      onChange={(e) =>
                        handleInputChange(
                          entry.studentId,
                          "continuousAssessment",
                          e.target.value
                        )
                      }
                      className="w-20 text-center font-medium rounded-md border border-input bg-background py-1.5 text-xs shadow-xs focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-muted/50 disabled:text-muted-foreground"
                    />
                  </td>

                  {/* Input NPP */}
                  <td className="py-2 px-2 text-center bg-blue-50/20 dark:bg-blue-950/10">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      disabled={isReadOnly}
                      value={entry.teacherTest ?? ""}
                      placeholder="0.0 - 20"
                      onChange={(e) =>
                        handleInputChange(
                          entry.studentId,
                          "teacherTest",
                          e.target.value
                        )
                      }
                      className="w-20 text-center font-medium rounded-md border border-input bg-background py-1.5 text-xs shadow-xs focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-muted/50 disabled:text-muted-foreground"
                    />
                  </td>

                  {/* MAS Calculado */}
                  <td className="py-2.5 px-3 text-center font-medium text-foreground bg-muted/30">
                    {entry.systematicAverage !== undefined
                      ? entry.systematicAverage.toFixed(1)
                      : "—"}
                  </td>

                  {/* Input NPT */}
                  <td className="py-2 px-2 text-center bg-indigo-50/20 dark:bg-indigo-950/10">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      disabled={isReadOnly}
                      value={entry.termExam ?? ""}
                      placeholder="0.0 - 20"
                      onChange={(e) =>
                        handleInputChange(
                          entry.studentId,
                          "termExam",
                          e.target.value
                        )
                      }
                      className="w-20 text-center font-medium rounded-md border border-input bg-background py-1.5 text-xs shadow-xs focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-muted/50 disabled:text-muted-foreground"
                    />
                  </td>

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
        <Icon name="Info" className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span>
          <strong>Fórmulas do Decreto Executivo n.º 424/25:</strong> MAS = (MAC + NPP) / 2 • MT = (2 × MAS + NPT) / 3. Aprovação requer MT ≥ 10.0 valores.
        </span>
      </div>
    </div>
  );
}
