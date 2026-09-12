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

interface ReopenPautaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pauta: ConsolidatedPauta;
  onSuccess?: () => void;
}

export function ReopenPautaModal({
  isOpen,
  onClose,
  pauta,
  onSuccess,
}: ReopenPautaModalProps) {
  const { reopenSectionPauta } = useGradeStore();
  const [reason, setReason] = useState("");
  const [directorName, setDirectorName] = useState(
    "Prof. António Silva (Dir. Pedagógico)"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (reason.trim().length < 10) {
      ErrorMessage(
        "A justificativa de reabertura deve conter pelo menos 10 caracteres para fins de auditoria."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      reopenSectionPauta(pauta.sectionId, pauta.term, reason, directorName);
      SucessMessage(
        `Pauta da ${pauta.sectionName} reaberta. Evento auditado com sucesso!`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao reabrir pauta";
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
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
            <Icon name="RotateCcw" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Reabertura de Pauta Trimestral (Auditoria Obrigatória)
            </h3>
            <p className="text-xs text-muted-foreground">
              Registo de alteração excepcional pós-fecho para conformidade MED
            </p>
          </div>
        </div>
      }
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-xl lg:!max-w-2xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs text-amber-950 dark:text-amber-200 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-sm text-amber-800 dark:text-amber-300">
            <Icon name="TriangleAlert" className="h-4 w-4" />
            Controlo de Integridade de Notas
          </div>
          <p>
            A pauta da <strong>{pauta.sectionName}</strong> encontra-se formalmente fechada. A reabertura destranca a edição aos professores e será permanentemente gravada no <strong>Livro de Auditoria Pedagógica</strong> com data, utilizador e justificação oficial.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Justificativa da Reabertura (Obrigatório)*
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: Rectificação da nota de Matemática do aluno João Silva após deferimento de reclamação pelo Conselho Pedagógico..."
            rows={4}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
          <span className="text-[11px] text-muted-foreground">
            Mínimo de 10 caracteres exigido para auditoria.
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Responsável pela Autorização
          </label>
          <input
            type="text"
            value={directorName}
            onChange={(e) => setDirectorName(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit
            isLoading={isSubmitting}
            disabled={reason.trim().length < 10}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            <Icon name="RotateCcw" className="h-4 w-4" />
            Confirmar Reabertura Auditada
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
