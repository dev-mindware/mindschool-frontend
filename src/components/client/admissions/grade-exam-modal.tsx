"use client";

import React, { useState } from "react";
import { AdmissionApplication } from "@/types/admission";
import { useAdmissions } from "@/hooks/school/use-admissions";
import {
  GlobalModal,
  Input,
  Button,
  ButtonSubmit,
  Icon,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

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

  const [score, setScore] = useState<string>(
    application?.examScore !== undefined ? String(application.examScore) : ""
  );
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 20) {
      ErrorMessage("A pontuação deve estar entre 0 e 20 valores.");
      return;
    }

    setIsSubmitting(true);
    try {
      await gradeCandidateExam(application.id, numericScore, feedback.trim() || undefined);
      SucessMessage(
        `Nota de ${numericScore.toFixed(1)} valores atribuída com sucesso! Estado do candidato atualizado.`
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao lançar nota";
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
            <Icon name="PenTool" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Lançar Nota do Exame de Acesso
            </h3>
            <p className="text-xs text-muted-foreground">
              {application.candidateName} • {application.desiredClassLevelName}
            </p>
          </div>
        </div>
      }
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="p-3.5 rounded-lg border bg-muted/40 text-xs space-y-1">
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
            label="Nota da Prova de Acesso (0 a 20 valores)"
            type="number"
            step="0.1"
            min="0"
            max="20"
            placeholder="Ex: 14.5"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Parecer / Observações do Professor Corretor
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex: Bom domínio de compreensão de texto e raciocínio lógico..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="gap-2">
            <Icon name="Check" className="h-4 w-4" />
            Gravar Nota do Exame
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
