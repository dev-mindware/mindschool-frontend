"use client";

import React, { useState } from "react";
import { Button, Icon } from "@/components";
import { useHealthStore } from "@/stores/school/health-store";
import { PsychopedagogicalPlan } from "@/types";
import { PsychopedagogicalPlanCard } from "./psychopedagogical-plan-card";
import { NewPsychologySessionModal } from "./new-psychology-session-modal";
import { NewPsychopedagogicalPlanModal } from "./new-psychopedagogical-plan-modal";

export function PsychopedagogicalView() {
  const { plans, addPsychologySession, addPsychopedagogicalPlan } = useHealthStore();

  const [selectedPlan, setSelectedPlan] = useState<PsychopedagogicalPlan | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);

  const handleOpenSessionModal = (plan: PsychopedagogicalPlan) => {
    setSelectedPlan(plan);
    setSessionModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Icon name="BrainCircuit" className="size-4 text-primary" />
            Atendimento Educacional Especializado (AEE) & Inclusão Escolar
          </h3>
          <p className="text-xs text-muted-foreground">
            Acompanhamento individualizado e adaptações pedagógicas preconizadas pelas diretrizes do MED
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setNewPlanModalOpen(true)}
        >
          <Icon name="Plus" className="size-3.5" />
          Novo Plano AEE
        </Button>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <PsychopedagogicalPlanCard
            key={plan.id}
            plan={plan}
            onRegisterSession={handleOpenSessionModal}
          />
        ))}
      </div>

      {/* Modal: New Session */}
      <NewPsychologySessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        selectedPlan={selectedPlan}
        onSaveSession={addPsychologySession}
      />

      {/* Modal: New Plan */}
      <NewPsychopedagogicalPlanModal
        isOpen={newPlanModalOpen}
        onClose={() => setNewPlanModalOpen(false)}
        onSavePlan={addPsychopedagogicalPlan}
      />
    </div>
  );
}
