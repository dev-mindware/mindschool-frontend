"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlobalModal, Button, ButtonSubmit, FormSelect, FormTextarea, Input, Icon } from "@/components";
import { DropoutRiskAlert, ActionType } from "@/types/dropout-risk";
import { isValidIsoDate, safeTextSchema, todayLocalIsoDate } from "@/schemas";

const interventionSchema = z.object({
  actionType: z.enum(
    [
      "GUARDIAN_CONTACT",
      "PEDAGOGIC_MEETING",
      "RECOVERY_PLAN",
      "TUTORING_ASSIGNED",
      "SOCIAL_ASSISTANCE",
    ],
    { error: "Seleccione o tipo de ação pedagógica." }
  ),
  followUpDate: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || isValidIsoDate(v),
      "A data prevista de retorno é inválida (formato esperado AAAA-MM-DD)."
    )
    .refine(
      (v) => v === "" || v >= todayLocalIsoDate(),
      "A data prevista de retorno não pode estar no passado."
    )
    .optional(),
  actionTitle: safeTextSchema(5, 150, "O título da intervenção"),
  actionNotes: safeTextSchema(5, 1000, "As notas e acordos"),
  intervenorName: safeTextSchema(3, 120, "O responsável pelo registo"),
});

type InterventionFormInput = z.input<typeof interventionSchema>;
type InterventionFormData = z.infer<typeof interventionSchema>;

interface DropoutRiskInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAlert: DropoutRiskAlert | null;
  onSaveIntervention: (
    alertId: string,
    action: {
      actionType: ActionType;
      title: string;
      notes: string;
      recordedBy: string;
      nextFollowUpDate?: string;
    }
  ) => void;
}

export function DropoutRiskInterventionModal({
  isOpen,
  onClose,
  selectedAlert,
  onSaveIntervention,
}: DropoutRiskInterventionModalProps) {
  const defaultFollowUp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<InterventionFormInput, unknown, InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    mode: "onChange",
    defaultValues: {
      actionType: "GUARDIAN_CONTACT",
      actionTitle: "",
      actionNotes: "",
      followUpDate: defaultFollowUp,
      intervenorName: "Direção Pedagógica",
    },
  });

  useEffect(() => {
    if (isOpen && selectedAlert) {
      reset({
        actionType: "GUARDIAN_CONTACT",
        actionTitle: `Contacto Pedagógico - ${selectedAlert.studentName}`,
        actionNotes: "",
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        intervenorName: "Direção Pedagógica",
      });
    }
  }, [isOpen, selectedAlert, reset]);

  const actionType = watch("actionType");
  const actionNotes = watch("actionNotes") ?? "";

  const onSubmit = (data: InterventionFormData) => {
    if (!selectedAlert) return;

    onSaveIntervention(selectedAlert.id, {
      actionType: data.actionType,
      title: data.actionTitle,
      notes: data.actionNotes,
      recordedBy: data.intervenorName,
      nextFollowUpDate: data.followUpDate || undefined,
    });
    onClose();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedAlert ? `Nova Intervenção: ${selectedAlert.studentName}` : "Nova Intervenção"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="p-3 bg-muted/40 rounded-xs text-xs space-y-1">
          <p className="font-medium text-foreground">
            Aluno: {selectedAlert?.studentName} ({selectedAlert?.studentNumber})
          </p>
          <p className="text-muted-foreground">
            Turma: {selectedAlert?.className} • Encarregado: {selectedAlert?.guardianName} ({selectedAlert?.guardianPhone})
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Tipo de Ação Pedagógica *"
            value={actionType}
            error={errors.actionType?.message}
            onValueChange={(val) =>
              setValue("actionType", val as ActionType, {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true,
              })
            }
            options={[
              { label: "Contacto Telefónico com Encarregado", value: "GUARDIAN_CONTACT" },
              { label: "Reunião Presencial na Direção", value: "PEDAGOGIC_MEETING" },
              { label: "Plano de Recuperação Académica", value: "RECOVERY_PLAN" },
              { label: "Atribuição de Apoio / Tutoria", value: "TUTORING_ASSIGNED" },
              { label: "Encaminhamento para Apoio Social", value: "SOCIAL_ASSISTANCE" },
            ]}
          />

          <Input
            label="Data Prevista de Retorno / Acompanhamento"
            type="date"
            min={todayLocalIsoDate()}
            error={errors.followUpDate?.message}
            {...register("followUpDate")}
          />
        </div>

        <Input
          label="Título da Intervenção *"
          type="text"
          maxLength={150}
          error={errors.actionTitle?.message}
          placeholder="Ex: Reunião Presencial com o Encarregado de Educação..."
          {...register("actionTitle")}
        />

        <FormTextarea
          label="Notas e Acordos Estabelecidos *"
          rows={4}
          maxLength={1000}
          value={actionNotes}
          error={errors.actionNotes?.message}
          onChange={(val) =>
            setValue("actionNotes", val, {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true,
            })
          }
          placeholder="Descreva o que foi acordado com o aluno/encarregado (ex: compromisso de assiduidade, inscrição nas aulas de reforço aos sábados)..."
        />

        <Input
          label="Responsável pelo Registo *"
          type="text"
          maxLength={120}
          error={errors.intervenorName?.message}
          placeholder="Ex.: Prof. João Silva (Coordenador Pedagógico)"
          {...register("intervenorName")}
        />

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={false} disabled={!isValid || !selectedAlert}>
            <Icon name="Check" className="w-4 h-4" />
            Gravar Intervenção
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
