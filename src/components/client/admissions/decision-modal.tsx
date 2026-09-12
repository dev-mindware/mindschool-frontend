"use client";

import React, { useState } from "react";
import { AdmissionApplication } from "@/types/admission";
import { useAdmissionStore } from "@/stores/school/admission-store";
import {
  GlobalModal,
  SelectField,
  Button,
  ButtonSubmit,
  Icon,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

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
  const { decideApplication } = useAdmissionStore();

  const [decision, setDecision] = useState<"APPROVED" | "WAITLIST" | "REJECTED">(
    application?.examScore !== undefined && application.examScore >= application.minPassingScore
      ? "APPROVED"
      : "WAITLIST"
  );
  const [notes, setNotes] = useState("");
  const [decidedBy, setDecidedBy] = useState("Direção Pedagógica");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim() || notes.trim().length < 3) {
      ErrorMessage("Por favor, informe a fundamentação ou nota do despacho.");
      return;
    }

    setIsSubmitting(true);
    try {
      await decideApplication(application.id, decision, notes.trim(), decidedBy);
      SucessMessage("Decisão de admissão registada com sucesso!");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao registar decisão";
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
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="Stamp" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Despacho de Admissão (UC-00.1)
            </h3>
            <p className="text-xs text-muted-foreground">
              Decisão formal da Direção Pedagógica para o candidato
            </p>
          </div>
        </div>
      }
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-2xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Resumo do Candidato */}
        <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5 text-xs">
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
              <strong>Pretensão:</strong> {application.desiredClassLevelName} ({application.desiredShift})
            </span>
            {application.requiresEntranceExam && (
              <span>
                <strong>Nota no Exame:</strong>{" "}
                {application.examScore !== undefined ? (
                  <span
                    className={`font-bold ${
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
          <SelectField
            label="Deliberação / Decisão Oficial"
            value={decision}
            onValueChange={(val) =>
              setDecision(val as "APPROVED" | "WAITLIST" | "REJECTED")
            }
            options={[
              {
                value: "APPROVED",
                label: "Aprovado / Admissão Concedida (Pronto para Matrícula)",
              },
              {
                value: "WAITLIST",
                label: "Lista de Espera (Aprovado em Prova, Excedente de Vagas)",
              },
              {
                value: "REJECTED",
                label: "Não Admitido / Reprovado",
              },
            ]}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fundamentação do Despacho (Obrigatório)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Candidato aprovado no exame de acesso com média favorável. Vaga atribuída na turma matutina..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Responsável pelo Despacho
            </label>
            <input
              type="text"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="gap-2">
            <Icon name="Check" className="h-4 w-4" />
            Confirmar e Gravar Despacho
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
