"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdmissionApplication } from "@/types/admission";
import { useAdmissions } from "@/hooks/school/use-admissions";
import { admissionGradeExamSchema, optionalSafeTextSchema } from "@/schemas";
import {
  GlobalModal,
  Input,
  Button,
  ButtonSubmit,
  FormTextarea,
  Icon,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";

const gradeExamModalSchema = admissionGradeExamSchema.extend({
  feedback: optionalSafeTextSchema(500, 2, "O parecer"),
});

type GradeExamInput = z.input<typeof gradeExamModalSchema>;
type GradeExamFormData = z.infer<typeof gradeExamModalSchema>;

interface GradeExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: AdmissionApplication | null;
}

export function GradeExamModal({
  isOpen,
  onClose,
  application,
}: GradeExamModalProps) {
  const { gradeCandidateExam } = useAdmissions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<GradeExamInput, unknown, GradeExamFormData>({
    resolver: zodResolver(gradeExamModalSchema),
    mode: "onChange",
    defaultValues: {
      examScore: application?.examScore !== undefined ? String(application.examScore) : "",
      feedback: "",
    },
  });

  useEffect(() => {
    if (isOpen && application) {
      reset({
        examScore: application.examScore !== undefined ? String(application.examScore) : "",
        feedback: "",
      });
    }
  }, [isOpen, application, reset]);

  const feedback = watch("feedback") ?? "";

  if (!application || !isOpen) return null;

  const onSubmit = async (data: GradeExamFormData) => {
    setIsSubmitting(true);
    try {
      await gradeCandidateExam(
        application.id,
        data.examScore,
        data.feedback || undefined
      );
      SucessMessage(
        `Nota de ${data.examScore.toFixed(1)} valores atribuída com sucesso! Estado do candidato atualizado.`
      );
      onClose();
    } catch (err: unknown) {
      ErrorMessage(
        getApiErrorMessage(err, "Não foi possível lançar a nota da prova de acesso. Tente novamente."),
      );
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
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="PenTool" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Lançar Nota do Exame de Acesso
            </h3>
            <p className="text-xs text-muted-foreground">
              {application.candidateName} • {application.desiredClassLevelName}
            </p>
          </div>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-2">
        <div className="p-3.5 rounded-xs border bg-muted/40 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">
              Prova: {application.entranceExamTitle || "Exame de Admissão"}
            </span>
            <span className="text-muted-foreground">
              N.º {application.applicationNumber}
            </span>
          </div>
          <p className="text-muted-foreground">
            Escala oficial angolana (0 a 20 valores). Nota mínima de aprovação:{" "}
            <strong>{application.minPassingScore} valores</strong>.
          </p>
        </div>

        <div className="space-y-3">
          <Input
            label="Nota da Prova de Acesso (0 a 20 valores) *"
            type="number"
            step="0.01"
            min={0}
            max={20}
            placeholder="Ex: 14.5"
            error={errors.examScore?.message}
            {...register("examScore")}
          />

          <FormTextarea
            label="Parecer / Observações do Professor Corretor"
            rows={3}
            maxLength={500}
            value={feedback}
            onChange={(val) =>
              setValue("feedback", val, {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true,
              })
            }
            error={errors.feedback?.message}
            placeholder="Ex: Bom domínio de compreensão de texto e raciocínio lógico..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} disabled={!isValid || isSubmitting} className="gap-2">
            <Icon name="Check" className="h-4 w-4" />
            Gravar Nota do Exame
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
