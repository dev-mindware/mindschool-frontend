"use client";

import React from "react";
import { ConsolidatedPauta } from "@/types/grade";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import {
  GlobalModal,
  Button,
  Icon,
} from "@/components";
import { Badge } from "@/components/ui/badge";

interface ConsolidatedPautaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pauta: ConsolidatedPauta;
  onOpenLockModal?: () => void;
  onOpenReopenModal?: () => void;
}

export function ConsolidatedPautaModal({
  isOpen,
  onClose,
  pauta,
  onOpenLockModal,
  onOpenReopenModal,
}: ConsolidatedPautaModalProps) {
  const { subjects } = useSchoolDataStore();

  if (!isOpen) return null;

  const termLabel =
    pauta.term === "TRIMESTER_1"
      ? "1.º Trimestre"
      : pauta.term === "TRIMESTER_2"
      ? "2.º Trimestre"
      : "3.º Trimestre";

  const handlePrint = () => {
    window.print();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="ClipboardList" className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                Pauta Consolidada Trimestral — {pauta.sectionName}
              </h3>
              <Badge
                variant={pauta.isClosed ? "default" : "outline"}
                className={`text-xs ${
                  pauta.isClosed
                    ? "bg-purple-600 text-white"
                    : "border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/20"
                }`}
              >
                {pauta.isClosed ? "Fechada e Homologada" : "Em Elaboração"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {termLabel} • Ano Lectivo {pauta.academicYear} • Turno: {pauta.shift} • {pauta.students.length} Estudantes
            </p>
          </div>
        </div>
      }
      className="!max-h-[92vh] !w-[96vw] sm:!max-w-5xl lg:!max-w-6xl xl:!max-w-7xl overflow-y-auto"
    >
      <div className="space-y-5 pt-2">
        {/* Banner com Indicadores Chave da Turma */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg border bg-muted/20 text-xs">
          <div>
            <span className="text-muted-foreground">Média Geral da Turma:</span>
            <p className="text-base font-bold text-foreground">
              {pauta.averageClassScore.toFixed(1)} / 20
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Taxa de Aproveitamento:</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {pauta.approvalRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Notas em Falta:</span>
            <p
              className={`text-base font-bold ${
                pauta.missingGradesCount === 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {pauta.missingGradesCount === 0
                ? "0 (100% Preenchida)"
                : `${pauta.missingGradesCount} pendentes`}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Estado do Fecho:</span>
            <p className="text-base font-bold text-foreground">
              {pauta.isClosed ? "Homologada" : "Aguardando Fecho"}
            </p>
          </div>
        </div>

        {/* Informações de Fecho e Auditoria */}
        {pauta.isClosed && pauta.closedBy && (
          <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 dark:border-purple-900/40 dark:bg-purple-950/20 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Lock" className="h-4 w-4 text-purple-600" />
              <span>
                Pauta trancada por <strong>{pauta.closedBy}</strong> em{" "}
                {pauta.closedAt ? new Date(pauta.closedAt).toLocaleString("pt-AO") : ""}.
              </span>
            </div>
            {onOpenReopenModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenReopenModal}
                className="gap-1.5 text-xs text-purple-700 border-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950"
              >
                <Icon name="RotateCcw" className="h-3.5 w-3.5" />
                Reabrir Pauta (Auditoria)
              </Button>
            )}
          </div>
        )}

        {/* Matriz Cruzada Alunos x Disciplinas (Cross-Table) */}
        <div className="rounded-lg border bg-card overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center sticky left-0 bg-muted/80 z-10">
                  N.º
                </th>
                <th className="py-2.5 px-3 min-w-[180px] sticky left-10 bg-muted/80 z-10">
                  Nome do Estudante
                </th>
                {subjects.map((s) => (
                  <th
                    key={s.id}
                    className="py-2.5 px-2 text-center min-w-[70px] border-l border-border/50"
                    title={s.name}
                  >
                    <div className="font-medium text-foreground truncate max-w-[75px]">
                      {s.code}
                    </div>
                    <span className="text-[9px] lowercase font-normal text-muted-foreground">
                      MT
                    </span>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center w-24 bg-primary/10 border-l border-border">
                  <div className="font-medium text-primary">Média MT</div>
                </th>
                <th className="py-2.5 px-3 text-center w-24 border-l border-border">
                  Deficiências
                </th>
                <th className="py-2.5 px-3 text-center min-w-[140px] border-l border-border">
                  Deliberação Proposta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pauta.students.map((student, idx) => {
                return (
                  <tr
                    key={student.studentId}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-muted-foreground sticky left-0 bg-card z-10">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 sticky left-10 bg-card z-10">
                      <div className="font-medium text-foreground text-xs">
                        {student.studentName}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {student.studentNumber}
                      </div>
                    </td>

                    {/* Notas de cada Disciplina (MT) */}
                    {subjects.map((subj) => {
                      const scoreData = student.subjects[subj.id];
                      const mt = scoreData?.mt;

                      return (
                        <td
                          key={subj.id}
                          className="py-2 px-2 text-center border-l border-border/40 font-mono"
                        >
                          {mt !== undefined ? (
                            <span
                              className={`font-medium ${
                                mt >= 10
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : mt >= 7
                                  ? "text-amber-700 dark:text-amber-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {mt.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Média Total */}
                    <td className="py-2.5 px-3 text-center font-medium text-foreground bg-primary/5 border-l border-border">
                      {student.termAverageTotal.toFixed(1)}
                    </td>

                    {/* Número de Deficiências (<10 val) */}
                    <td className="py-2.5 px-3 text-center border-l border-border">
                      {student.failedSubjectsCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300">
                          {student.failedSubjectsCount} disc.
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">0</span>
                      )}
                    </td>

                    {/* Deliberação Proposta */}
                    <td className="py-2.5 px-3 text-center border-l border-border">
                      {student.transitionStatus === "APPROVED" && (
                        <Badge variant="default" className="text-[10px] bg-emerald-600 text-white">
                          Aprovado
                        </Badge>
                      )}
                      {student.transitionStatus === "APPROVED_WITH_CONDITIONS" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950/30"
                          title={student.exceptionApplied}
                        >
                          Excepção 7ª/8ª
                        </Badge>
                      )}
                      {student.transitionStatus === "RECOVERY_EXAM" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/30"
                        >
                          Recurso
                        </Badge>
                      )}
                      {student.transitionStatus === "FAILED" && (
                        <Badge variant="destructive" className="text-[10px]">
                          Retido
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé e Ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Documento regulamentado pelo Decreto Executivo n.º 424/25 do Ministério da Educação.
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Icon name="Printer" className="h-4 w-4" />
              Imprimir Pauta Geral
            </Button>
            {!pauta.isClosed && onOpenLockModal && (
              <Button
                variant="default"
                size="sm"
                onClick={onOpenLockModal}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                <Icon name="Lock" className="h-4 w-4" />
                Homologar & Fechar Pauta
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </GlobalModal>
  );
}
