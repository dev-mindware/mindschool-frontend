"use client";

import React, { useState } from "react";
import {
  Button,
  Icon,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { PsychopedagogicalPlan } from "@/types";
import { toast } from "sonner";

interface NewPsychologySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: PsychopedagogicalPlan | null;
  onSaveSession: (
    planId: string,
    sessionData: {
      practitionerName: string;
      sessionType: "INDIVIDUAL" | "FAMILY_GUARDIAN" | "TEACHER_CONFERENCE";
      topicsDiscussed: string;
      observations: string;
      recommendations: string;
      nextSessionDate?: string;
    }
  ) => void;
}

export function NewPsychologySessionModal({
  isOpen,
  onClose,
  selectedPlan,
  onSaveSession,
}: NewPsychologySessionModalProps) {
  const [sessionPractitioner, setSessionPractitioner] = useState("Dra. Isabel Vunge (Psicopedagoga)");
  const [sessionType, setSessionType] = useState<"INDIVIDUAL" | "FAMILY_GUARDIAN" | "TEACHER_CONFERENCE">("INDIVIDUAL");
  const [sessionTopics, setSessionTopics] = useState("");
  const [sessionObservations, setSessionObservations] = useState("");
  const [sessionRecommendations, setSessionRecommendations] = useState("");
  const [nextSessionDate, setNextSessionDate] = useState("");

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!sessionTopics.trim() || !sessionRecommendations.trim()) {
      toast.error("Preencha os tópicos abordados e as recomendações da sessão");
      return;
    }

    onSaveSession(selectedPlan.id, {
      practitionerName: sessionPractitioner,
      sessionType,
      topicsDiscussed: sessionTopics,
      observations: sessionObservations,
      recommendations: sessionRecommendations,
      nextSessionDate: nextSessionDate || undefined,
    });

    toast.success("Sessão psicopedagógica registada com sucesso!");
    onClose();

    // Reset
    setSessionTopics("");
    setSessionObservations("");
    setSessionRecommendations("");
    setNextSessionDate("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Registar Sessão Psicopedagógica
          </DialogTitle>
          {selectedPlan && (
            <p className="text-xs text-muted-foreground">
              Aluno: {selectedPlan.studentName} ({selectedPlan.classLevel})
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-foreground">Profissional Responsável</label>
            <input
              type="text"
              value={sessionPractitioner}
              onChange={(e) => setSessionPractitioner(e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              required
            />
          </div>

          <div>
            <label className="font-medium text-foreground">Tipo de Sessão</label>
            <Select
              value={sessionType}
              onValueChange={(val) =>
                setSessionType(val as "INDIVIDUAL" | "FAMILY_GUARDIAN" | "TEACHER_CONFERENCE")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual com o Aluno</SelectItem>
                <SelectItem value="FAMILY_GUARDIAN">Com os Encarregados de Educação</SelectItem>
                <SelectItem value="TEACHER_CONFERENCE">Reunião Pedagógica com Docentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-medium text-foreground">Tópicos Abordados *</label>
            <textarea
              rows={2}
              value={sessionTopics}
              onChange={(e) => setSessionTopics(e.target.value)}
              placeholder="Ex: Trabalho de foco e concentração, gestão de ansiedade..."
              className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              required
            />
          </div>

          <div>
            <label className="font-medium text-foreground">Recomendações e Encaminhamentos *</label>
            <textarea
              rows={2}
              value={sessionRecommendations}
              onChange={(e) => setSessionRecommendations(e.target.value)}
              placeholder="Orientações aos professores ou encarregados..."
              className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              required
            />
          </div>

          <div>
            <label className="font-medium text-foreground">Data da Próxima Sessão (Opcional)</label>
            <input
              type="date"
              value={nextSessionDate}
              onChange={(e) => setNextSessionDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gap-1.5">
              <Icon name="Check" className="size-4" />
              Gravar Sessão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
