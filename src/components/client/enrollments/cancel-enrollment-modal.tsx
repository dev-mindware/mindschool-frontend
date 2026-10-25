"use client";

import React, { useState } from "react";
import { Enrollment } from "@/types";
import { useEnrollments } from "@/hooks/school/use-enrollments";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  GlobalModal,
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
  const [justified, setJustified] = useState(false);
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
      await cancel.mutateAsync({ id: enrollment.id, reason: finalReason, justified });
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
            <strong>{enrollment.sectionName}</strong>. A anulação é feita com
            a data de hoje e fica registada na auditoria.
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-4">
            <li>As faturas ainda por pagar são anuladas (as já certificadas ficam a precisar de nota de crédito).</li>
            <li>A vaga é libertada e o primeiro da lista de espera da classe é promovido.</li>
            <li>Se for a única matrícula do aluno, o aluno passa a «inactivo».</li>
            <li>Depois do fim do 2.º trimestre só a Direção, com justificação documentada, pode anular.</li>
          </ul>
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

        <label className="flex items-start gap-2 text-xs cursor-pointer">
          <input type="checkbox" className="mt-0.5" checked={justified} onChange={(e) => setJustified(e.target.checked)} />
          <span>
            <strong>Motivo justificado</strong> (doença comprovada, mudança de localidade). Marque só se houver comprovativo: dá direito a exame especial.
          </span>
        </label>

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
