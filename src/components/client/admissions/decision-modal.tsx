"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdmissionApplication } from "@/types/admission";
import { useAdmissions } from "@/hooks/school/use-admissions";
import { useAuthStore } from "@/stores";
import { safeTextSchema } from "@/schemas";
import {
  GlobalModal,
  FormSelect,
  Button,
  ButtonSubmit,
  FormTextarea,
  Icon,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";

const decisionModalSchema = z.object({
  decision: z.enum(["APPROVED", "WAITLIST", "REJECTED"], {
    error: "Seleccione a deliberação oficial.",
  }),
  notes: safeTextSchema(5, 500, "A fundamentação do despacho"),
});

type DecisionFormInput = z.input<typeof decisionModalSchema>;
type DecisionFormData = z.infer<typeof decisionModalSchema>;

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: AdmissionApplication | null;
}

export function DecisionModal({
  isOpen,
  onClose,
  application,
}: DecisionModalProps) {
  const { decideApplication } = useAdmissions();

  const defaultDecision: DecisionFormData["decision"] =
    application?.examScore !== undefined && application.examScore >= application.minPassingScore
      ? "APPROVED"
      : "WAITLIST";

  // Quem decide fica registado pela API com o utilizador autenticado (não é um texto livre).
  const decidedBy = useAuthStore((s) => s.user?.name) ?? "o utilizador atual";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<DecisionFormInput, unknown, DecisionFormData>({
    resolver: zodResolver(decisionModalSchema),
    mode: "onChange",
    defaultValues: {
      decision: defaultDecision,
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen && application) {
      reset({
        decision:
          application.examScore !== undefined &&
          application.examScore >= application.minPassingScore
            ? "APPROVED"
            : "WAITLIST",
        notes: "",
      });
    }
  }, [isOpen, application, reset]);

  const decision = watch("decision");
  const notes = watch("notes") ?? "";

  if (!application || !isOpen) return null;

  const onSubmit = async (data: DecisionFormData) => {
    setIsSubmitting(true);
    try {
      await decideApplication(application.id, data.decision, data.notes, decidedBy);
      SucessMessage("Decisão de admissão registada com sucesso!");
      onClose();
    } catch (err: unknown) {
      ErrorMessage(
        getApiErrorMessage(err, "Não foi possível registar a decisão da candidatura. Tente novamente."),
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
      size="md"
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="Stamp" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Despacho de Admissão
            </h3>
            <p className="text-xs text-muted-foreground">
              Decisão formal da Direção Pedagógica para o candidato
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 pt-2">
        {/* Resumo do Candidato */}
        <div className="p-3.5 rounded-xs border bg-muted/40 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground text-sm">
              {application.candidateName}
            </span>
            <span className="text-muted-foreground font-mono">
              {application.applicationNumber}
            </span>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <strong>Pretensão:</strong> {application.desiredClassLevelName}{application.desiredShift ? ` (${{ MORNING: "Manhã", AFTERNOON: "Tarde", EVENING: "Noite" }[application.desiredShift as "MORNING" | "AFTERNOON" | "EVENING"] ?? application.desiredShift})` : ""}
            </span>
            {application.requiresEntranceExam && (
              <span>
                <strong>Nota no Exame:</strong>{" "}
                {application.examScore !== undefined ? (
                  <span
                    className={`font-semibold ${
                      application.examScore >= application.minPassingScore
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {application.examScore.toFixed(1)} valores
                  </span>
                ) : (
                  <span className="italic">Pendente de nota</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Escolha da Decisão */}
        <div className="space-y-4">
          <FormSelect
            label="Deliberação / Decisão Oficial *"
            value={decision}
            error={errors.decision?.message}
            onValueChange={(val) =>
              setValue("decision", val as DecisionFormData["decision"], {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true,
              })
            }
            options={[
              {
                value: "APPROVED",
                label: "Aprovado (admissão concedida)",
              },
              {
                value: "WAITLIST",
                label: "Lista de espera (sem vaga por agora)",
              },
              {
                value: "REJECTED",
                label: "Não Admitido / Reprovado",
              },
            ]}
          />

          <FormTextarea
            label="Fundamentação do Despacho (Obrigatório)"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(val) =>
              setValue("notes", val, {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true,
              })
            }
            error={errors.notes?.message}
            placeholder="Ex: Candidato aprovado no exame de acesso com média favorável. Vaga atribuída na turma matutina..."
          />

          <p className="text-xs text-muted-foreground">
            O despacho fica registado em nome de <strong className="text-foreground">{decidedBy}</strong>, com data e hora.
          </p>
          <div className="space-y-1 rounded-xs border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground">
            <p><strong className="text-foreground">Aprovado:</strong> admite o candidato. Se a classe já não tiver vagas, o sistema coloca-o automaticamente em lista de espera. Se a candidatura tem prova de acesso e a nota ficou abaixo do mínimo da escola, a aprovação é recusada.</p>
            <p><strong className="text-foreground">Lista de espera:</strong> o candidato aguarda vaga; é promovido quando uma matrícula é anulada ou quando se promove a lista.</p>
            <p><strong className="text-foreground">Não admitido:</strong> encerra a candidatura.</p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} disabled={!isValid || isSubmitting} className="gap-2">
            <Icon name="Check" className="h-4 w-4" />
            Confirmar e Gravar Despacho
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
