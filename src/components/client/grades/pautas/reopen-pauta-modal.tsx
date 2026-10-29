"use client";

import React, { useState } from "react";
import { ConsolidatedPauta } from "@/types/grade";
import { usePautas } from "@/hooks/school/use-pautas";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  GlobalModal,
  Button,
  ButtonSubmit,
  FormTextarea,
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
  const { reopen } = usePautas(pauta.term, []);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reason.trim().length < 10) {
      ErrorMessage(
        "A justificativa de reabertura deve conter pelo menos 10 caracteres para fins de auditoria."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await reopen.mutateAsync({ sectionId: pauta.sectionId, term: pauta.term, reason });
      SucessMessage(`Pauta da ${pauta.sectionName} reaberta. Evento auditado com sucesso!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Erro ao reabrir pauta"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      size="md"
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-warning-muted flex items-center justify-center text-warning shrink-0">
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
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="p-3.5 rounded-xs border border-warning-border bg-warning-muted text-xs text-foreground space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-sm text-warning">
            <Icon name="TriangleAlert" className="h-4 w-4" />
            Controlo de Integridade de Notas
          </div>
          <p>
            A pauta da <strong>{pauta.sectionName}</strong> encontra-se formalmente fechada. A reabertura destranca a edição aos professores e será permanentemente gravada no <strong>Livro de Auditoria Pedagógica</strong> com data, utilizador e justificação oficial.
          </p>
        </div>

        <div className="space-y-1.5">
          <FormTextarea
            label="Justificativa da Reabertura (Obrigatório)*"
            value={reason}
            onChange={setReason}
            placeholder="Ex.: Rectificação da nota de Matemática do aluno João Silva após deferimento de reclamação pelo Conselho Pedagógico..."
            rows={4}
          />
          <span className="text-[11px] text-muted-foreground">
            Mínimo de 10 caracteres exigido para auditoria.
          </span>
        </div>

        <div className="space-y-1.5 rounded-xs border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground">
          <p className="font-semibold text-foreground">Antes de reabrir</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Só a Direção pode reabrir, e só enquanto o ano letivo não estiver encerrado.</li>
            <li>Não é possível se já existirem decisões de transição confirmadas: é preciso anulá-las primeiro.</li>
            <li>A versão guardada ao fechar não se apaga; ao fechar de novo cria-se uma versão nova. Fica tudo na auditoria, com o seu nome.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit
            isLoading={isSubmitting}
            disabled={reason.trim().length < 10}
            className="gap-2"
          >
            <Icon name="RotateCcw" className="h-4 w-4" />
            Confirmar Reabertura Auditada
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
