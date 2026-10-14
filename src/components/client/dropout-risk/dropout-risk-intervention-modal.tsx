"use client";

import React, { useState, useEffect } from "react";
import { GlobalModal, Button, SelectField, Icon } from "@/components";
import { DropoutRiskAlert, ActionType } from "@/types/dropout-risk";

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
  const [actionType, setActionType] = useState<ActionType>("GUARDIAN_CONTACT");
  const [actionTitle, setActionTitle] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [intervenorName, setIntervenorName] = useState("Direcção Pedagógica");

  useEffect(() => {
    if (selectedAlert) {
      setActionTitle(`Contacto Pedagógico - ${selectedAlert.studentName}`);
      setActionNotes("");
      setFollowUpDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      );
    }
  }, [selectedAlert]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert || !actionTitle.trim() || !actionNotes.trim()) return;

    onSaveIntervention(selectedAlert.id, {
      actionType,
      title: actionTitle,
      notes: actionNotes,
      recordedBy: intervenorName,
      nextFollowUpDate: followUpDate || undefined,
    });
    onClose();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedAlert ? `Nova Intervenção: ${selectedAlert.studentName}` : "Nova Intervenção"}
      className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
          <p className="font-medium text-foreground">
            Aluno: {selectedAlert?.studentName} ({selectedAlert?.studentNumber})
          </p>
          <p className="text-muted-foreground">
            Turma: {selectedAlert?.className} • Encarregado: {selectedAlert?.guardianName} ({selectedAlert?.guardianPhone})
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Tipo de Ação Pedagógica"
            value={actionType}
            onValueChange={(val) => setActionType(val as ActionType)}
            options={[
              { label: "Contacto Telefónico com Encarregado", value: "GUARDIAN_CONTACT" },
              { label: "Reunião Presencial na Direcção", value: "PEDAGOGIC_MEETING" },
              { label: "Plano de Recuperação Académica", value: "RECOVERY_PLAN" },
              { label: "Atribuição de Apoio / Tutoria", value: "TUTORING_ASSIGNED" },
              { label: "Encaminhamento para Apoio Social", value: "SOCIAL_ASSISTANCE" },
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Data Prevista de Retorno / Acompanhamento
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Título da Intervenção *
          </label>
          <input
            type="text"
            required
            value={actionTitle}
            onChange={(e) => setActionTitle(e.target.value)}
            placeholder="Ex: Reunião Presencial com o Encarregado de Educação..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Notas e Acordos Estabelecidos *
          </label>
          <textarea
            required
            rows={4}
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            placeholder="Descreva o que foi acordado com o aluno/encarregado (ex: compromisso de assiduidade, inscrição nas aulas de reforço aos sábados)..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Responsável pelo Registo
          </label>
          <input
            type="text"
            value={intervenorName}
            onChange={(e) => setIntervenorName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" type="button" className="w-max" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="w-max gap-2 font-medium">
            <Icon name="Check" className="w-4 h-4" />
            Gravar Intervenção
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
