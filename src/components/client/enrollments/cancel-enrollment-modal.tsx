"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Enrollment } from "@/types";
import { useEnrollments } from "@/hooks/school/use-enrollments";
import { getApiErrorMessage } from "@/utils/api-error";
import { optionalSafeTextSchema, safeTextSchema } from "@/schemas";
import {
  GlobalModal,
  FormSelect,
  Button,
  ButtonSubmit,
  Checkbox,
  FormTextarea,
  Label,
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

const cancelEnrollmentSchema = z
  .object({
    selectedPreset: z.string().trim().min(1, "Seleccione o motivo principal."),
    customReason: z.string(),
    justified: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.selectedPreset === "Outro motivo") {
      const res = safeTextSchema(5, 500, "O motivo detalhado").safeParse(data.customReason);
      if (!res.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customReason"],
          message:
            res.error.issues[0]?.message ??
            "Descreva o motivo detalhado (mínimo 5 caracteres).",
        });
      }
    } else {
      const res = optionalSafeTextSchema(400, 2, "Os detalhes adicionais").safeParse(
        data.customReason
      );
      if (!res.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customReason"],
          message: res.error.issues[0]?.message ?? "Detalhes adicionais inválidos.",
        });
      }
    }
  });

type CancelEnrollmentFormData = z.infer<typeof cancelEnrollmentSchema>;

export function CancelEnrollmentModal({
  isOpen,
  onClose,
  enrollment,
}: CancelEnrollmentModalProps) {
  const { cancel } = useEnrollments();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CancelEnrollmentFormData>({
    resolver: zodResolver(cancelEnrollmentSchema),
    mode: "onChange",
    defaultValues: {
      selectedPreset: COMMON_REASONS[0].value,
      customReason: "",
      justified: false,
    },
  });

  useEffect(() => {
    if (isOpen && enrollment) {
      reset({
        selectedPreset: COMMON_REASONS[0].value,
        customReason: "",
        justified: false,
      });
    }
  }, [isOpen, enrollment, reset]);

  const selectedPreset = watch("selectedPreset");
  const customReason = watch("customReason") ?? "";
  const justified = watch("justified");

  if (!enrollment) return null;

  const onConfirm = async (data: CancelEnrollmentFormData) => {
    const trimmedCustom = data.customReason.trim();
    const finalReason =
      data.selectedPreset === "Outro motivo"
        ? trimmedCustom
        : data.selectedPreset + (trimmedCustom ? ` - ${trimmedCustom}` : "");

    setIsSubmitting(true);
    try {
      await cancel.mutateAsync({
        id: enrollment.id,
        reason: finalReason,
        justified: data.justified,
      });
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
      size="md"
      title="Cancelar Matrícula"
      description="Processo auditado de anulação de vaga escolar"
    >
      <form onSubmit={handleSubmit(onConfirm)} noValidate className="space-y-4 pt-2">
        <div className="rounded-xs border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
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
            <li>Se for a única matrícula do aluno, o aluno passa a «inativo».</li>
            <li>Depois do fim do 2.º trimestre só a Direção, com justificação documentada, pode anular.</li>
          </ul>
        </div>

        <FormSelect
          label="Motivo Principal *"
          value={selectedPreset}
          options={COMMON_REASONS}
          error={errors.selectedPreset?.message}
          onValueChange={(val) =>
            setValue("selectedPreset", val, {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true,
            })
          }
        />

        <FormTextarea
          label={
            selectedPreset === "Outro motivo"
              ? "Descreva o motivo detalhado *"
              : "Detalhes Adicionais (Opcional)"
          }
          rows={3}
          maxLength={selectedPreset === "Outro motivo" ? 500 : 400}
          placeholder="Observações complementares para registo da secretaria..."
          value={customReason}
          error={errors.customReason?.message}
          onChange={(val) =>
            setValue("customReason", val, {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true,
            })
          }
        />

        <div className="flex items-start gap-2">
          <Checkbox
            id="cancel-enrollment-justified"
            className="mt-0.5"
            checked={justified}
            onCheckedChange={(checked) =>
              setValue("justified", Boolean(checked), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          <Label htmlFor="cancel-enrollment-justified" className="text-xs font-normal leading-relaxed cursor-pointer">
            <strong>Motivo justificado</strong> (doença comprovada, mudança de localidade). Marque só se houver comprovativo: dá direito a exame especial.
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Desistir
          </Button>
          <ButtonSubmit
            isLoading={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Confirmar Anulação
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
