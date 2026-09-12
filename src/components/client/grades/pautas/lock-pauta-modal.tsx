"use client";

import React, { useState } from "react";
import { ConsolidatedPauta } from "@/types/grade";
import { useGradeStore } from "@/stores/school/grade-store";
import {
  GlobalModal,
  Button,
  ButtonSubmit,
  Icon,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

interface LockPautaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pauta: ConsolidatedPauta;
  onSuccess?: () => void;
}

export function LockPautaModal({
  isOpen,
  onClose,
  pauta,
  onSuccess,
}: LockPautaModalProps) {
  const { closeSectionPauta } = useGradeStore();
  const [directorName, setDirectorName] = useState(
    "Prof. António Silva (Dir. Pedagógico)"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const hasMissingGrades = pauta.missingGradesCount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasMissingGrades) {
      ErrorMessage(
        `Impossível fechar pauta: Existem ${pauta.missingGradesCount} notas pendentes de lançamento.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = closeSectionPauta(pauta.sectionId, pauta.term, directorName);
      if (res.success) {
        SucessMessage(
          `Pauta da ${pauta.sectionName} homologada e trancada com sucesso!`
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        ErrorMessage(
          `Erro ao fechar pauta: ${res.missingGradesCount} notas em falta.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao fechar pauta";
      ErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
            <Icon name="Lock" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Homologação e Fecho de Pauta Geral
            </h3>
            <p className="text-xs text-muted-foreground">
              Bloqueio de imutabilidade de notas e emissão de boletins
            </p>
          </div>
        </div>
      }
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-xl lg:!max-w-2xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Aviso se houver notas em falta */}
        {hasMissingGrades ? (
          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30 text-xs text-red-900 dark:text-red-200 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-sm text-red-700 dark:text-red-300">
              <Icon name="CircleAlert" className="h-4 w-4" />
              Bloqueio de Conformidade MED (PAUTA_INCOMPLETE)
            </div>
            <p>
              A turma possui <strong>{pauta.missingGradesCount} avaliações por lançar</strong>. O regulamento escolar e o Ministério da Educação exigem que 100% dos estudantes tenham notas lançadas em todas as disciplinas antes da homologação da pauta.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/50 dark:border-purple-900/40 dark:bg-purple-950/30 text-xs text-purple-950 dark:text-purple-200 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-sm text-purple-800 dark:text-purple-300">
              <Icon name="ShieldCheck" className="h-4 w-4" />
              Pronto para Homologação
            </div>
            <p>
              Todas as disciplinas da <strong>{pauta.sectionName}</strong> têm notas lançadas (0 pendências). A média geral calculada é de <strong>{pauta.averageClassScore.toFixed(1)} valores</strong> com <strong>{pauta.approvalRate.toFixed(1)}% de aproveitamento</strong>.
            </p>
          </div>
        )}

        {/* Resumo da Pauta */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg border bg-card text-xs">
          <div>
            <span className="text-muted-foreground">Turma:</span>
            <p className="font-semibold text-foreground text-sm">{pauta.sectionName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Trimestre:</span>
            <p className="font-semibold text-foreground text-sm">
              {pauta.term === "TRIMESTER_1"
                ? "1.º Trimestre"
                : pauta.term === "TRIMESTER_2"
                ? "2.º Trimestre"
                : "3.º Trimestre"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Total de Alunos:</span>
            <p className="font-semibold text-foreground text-sm">
              {pauta.students.length} Estudantes
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Ano Lectivo:</span>
            <p className="font-semibold text-foreground text-sm">{pauta.academicYear}</p>
          </div>
        </div>

        {/* Nome do Responsável Pedagógico */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Responsável pelo Fecho (Direcção Pedagógica)
          </label>
          <input
            type="text"
            value={directorName}
            onChange={(e) => setDirectorName(e.target.value)}
            disabled={hasMissingGrades || isSubmitting}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted"
            required
          />
        </div>

        {/* Aviso de Imutabilidade */}
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Icon name="Info" className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>
            Após o fecho, os professores titulares não poderão alterar notas. Qualquer rectificação futura exigirá justificativa auditada pelo Conselho de Notas.
          </span>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit
            isLoading={isSubmitting}
            disabled={hasMissingGrades}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium"
          >
            <Icon name="Lock" className="h-4 w-4" />
            Homologar e Trancar Pauta
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
