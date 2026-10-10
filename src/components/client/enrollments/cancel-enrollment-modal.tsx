"use client";

import React, { useState } from "react";
import { Enrollment } from "@/types";
import { useEnrollments } from "@/hooks/school/use-enrollments";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
  Textarea,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

interface CancelEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: Enrollment | null;
}

const COMMON_REASONS = [
  { value: "Transferência para outra escola", label: "Transferência para outra escola" },
  { value: "Mudança de província / residência", label: "Mudança de província / residência" },
  { value: "Dificuldades financeiras do encarregado", label: "Dificuldades financeiras do encarregado" },
  { value: "Desistência por motivos de saúde", label: "Desistência por motivos de saúde" },
  { value: "Problemas disciplinares graves", label: "Problemas disciplinares graves" },
  { value: "Outro motivo", label: "Outro motivo específico" },
];

export function CancelEnrollmentModal({
  isOpen,
  onClose,
  enrollment,
}: CancelEnrollmentModalProps) {
  const { cancel } = useEnrollments();
  const [selectedPreset, setSelectedPreset] = useState(COMMON_REASONS[0].value);
  const [customReason, setCustomReason] = useState("");
  const [cancellationDate, setCancellationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!enrollment) return null;

  const finalReason =
    selectedPreset === "Outro motivo"
      ? customReason.trim()
      : selectedPreset + (customReason ? ` - ${customReason.trim()}` : "");

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalReason) {
      ErrorMessage("Por favor, especifique o motivo do cancelamento.");
      return;
    }

    setIsSubmitting(true);
    try {
      await cancel.mutateAsync({ id: enrollment.id, reason: finalReason });
      SucessMessage("Matrícula anulada e vaga libertada no sistema!");
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Ocorreu um erro ao anular a matrícula."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      warning
      title="Cancelar Matrícula"
      description="Processo auditado de anulação de vaga escolar (UC-07)"
      className="!max-h-[85vh] !max-w-md"
    >
      <form onSubmit={handleConfirm} className="space-y-4 pt-2">
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <p className="font-medium">Atenção:</p>
          <p className="mt-0.5">
            Está a anular a matrícula do estudante{" "}
            <strong>{enrollment.studentName}</strong> (Nº{" "}
            {enrollment.enrollmentNumber}) na turma{" "}
            <strong>{enrollment.sectionName}</strong>. Esta ação libertará a
            vaga da sala de aulas.
          </p>
        </div>

        <SelectField
          label="Motivo Principal *"
          value={selectedPreset}
          options={COMMON_REASONS}
          onValueChange={setSelectedPreset}
        />

        <div className="space-y-1">
          <label className="text-sm font-medium">
            {selectedPreset === "Outro motivo"
              ? "Descreva o motivo detalhado *"
              : "Detalhes Adicionais (Opcional)"}
          </label>
          <Textarea
            rows={3}
            placeholder="Observações complementares para registo da secretaria..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        </div>

        <Input
          type="date"
          label="Data Efectiva de Cancelamento *"
          startIcon="Calendar"
          value={cancellationDate}
          onChange={(e) => setCancellationDate(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Desistir
          </Button>
          <ButtonSubmit
            isLoading={isSubmitting}
            className="w-max bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Confirmar Anulação
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
