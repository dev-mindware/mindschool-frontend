"use client";

import React, { useState } from "react";
import { ConsolidatedPauta } from "@/types/grade";
import { usePautas } from "@/hooks/school/use-pautas";
import { getApiErrorMessage } from "@/utils/api-error";
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
  const { close } = usePautas(pauta.term, []);
  const [directorName, setDirectorName] = useState(
    "Prof. António Silva (Dir. Pedagógico)"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const hasMissingGrades = pauta.missingGradesCount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasMissingGrades) {
      ErrorMessage(
        `Impossível fechar pauta: Existem ${pauta.missingGradesCount} notas pendentes de lançamento.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await close.mutateAsync({ sectionId: pauta.sectionId, term: pauta.term, notes: `Homologada por ${directorName}` });
      SucessMessage(`Pauta da ${pauta.sectionName} homologada e trancada com sucesso!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Erro ao fechar pauta"));
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
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
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
          <div className="p-3.5 rounded-lg border border-destructive-border bg-destructive-muted text-xs text-destructive space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-sm text-destructive">
              <Icon name="CircleAlert" className="h-4 w-4" />
              Bloqueio de Conformidade MED (PAUTA_INCOMPLETE)
            </div>
            <p>
              A turma possui <strong>{pauta.missingGradesCount} avaliações por lançar</strong>. O regulamento escolar e o Ministério da Educação exigem que 100% dos estudantes tenham notas lançadas em todas as disciplinas antes da homologação da pauta.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-xs text-foreground space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-sm text-primary">
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
          <Icon name="Info" className="h-3.5 w-3.5 text-info shrink-0" />
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
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Icon name="Lock" className="h-4 w-4" />
            Homologar e Trancar Pauta
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
