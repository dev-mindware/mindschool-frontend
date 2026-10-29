"use client";

import React, { useState, useEffect } from "react";
import { GlobalModal, Button, ButtonSubmit, FormTextarea, Input, SelectField, Icon } from "@/components";
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
  const [intervenorName, setIntervenorName] = useState("Direção Pedagógica");

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
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-muted/40 rounded-xs text-xs space-y-1">
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
              { label: "Reunião Presencial na Direção", value: "PEDAGOGIC_MEETING" },
              { label: "Plano de Recuperação Académica", value: "RECOVERY_PLAN" },
              { label: "Atribuição de Apoio / Tutoria", value: "TUTORING_ASSIGNED" },
              { label: "Encaminhamento para Apoio Social", value: "SOCIAL_ASSISTANCE" },
            ]}
          />

          <Input
            label="Data Prevista de Retorno / Acompanhamento"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>

        <Input
          label="Título da Intervenção *"
          type="text"
          required
          value={actionTitle}
          onChange={(e) => setActionTitle(e.target.value)}
          placeholder="Ex: Reunião Presencial com o Encarregado de Educação..."
        />

        <FormTextarea
          label="Notas e Acordos Estabelecidos *"
          rows={4}
          value={actionNotes}
          onChange={setActionNotes}
          placeholder="Descreva o que foi acordado com o aluno/encarregado (ex: compromisso de assiduidade, inscrição nas aulas de reforço aos sábados)..."
        />

        <Input
          label="Responsável pelo Registo"
          type="text"
          value={intervenorName}
          onChange={(e) => setIntervenorName(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={false}>
            <Icon name="Check" className="w-4 h-4" />
            Gravar Intervenção
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
