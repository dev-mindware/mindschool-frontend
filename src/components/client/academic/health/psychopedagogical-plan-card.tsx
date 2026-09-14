"use client";

import React from "react";
import { Button, Badge, Icon } from "@/components";
import { PsychopedagogicalPlan, SpecialNeedType } from "@/types";

interface PsychopedagogicalPlanCardProps {
  plan: PsychopedagogicalPlan;
  onRegisterSession: (plan: PsychopedagogicalPlan) => void;
}

export function getSpecialNeedBadge(type: SpecialNeedType) {
  switch (type) {
    case "AUTISM_SPECTRUM":
      return (
        <Badge variant="special">
          Espectro do Autismo (PEA)
        </Badge>
      );
    case "ADHD":
      return (
        <Badge variant="info">
          TDAH (Défice de Atenção / Hiperactividade)
        </Badge>
      );
    case "DYSLEXIA":
      return (
        <Badge variant="warning">
          Dislexia / Leitura
        </Badge>
      );
    case "HEARING_IMPAIRMENT":
      return <Badge variant="secondary">Deficiência Auditiva</Badge>;
    case "VISUAL_IMPAIRMENT":
      return <Badge variant="secondary">Baixa Visão / Deficiência Visual</Badge>;
    case "LEARNING_DIFFICULTY":
      return (
        <Badge variant="success">
          Dificuldades de Aprendizagem
        </Badge>
      );
    case "GIFTED":
      return (
        <Badge variant="default">
          Altas Habilidades / Sobredotação
        </Badge>
      );
    default:
      return <Badge variant="outline">AEE / Apoio Específico</Badge>;
  }
}

export function PsychopedagogicalPlanCard({
  plan,
  onRegisterSession,
}: PsychopedagogicalPlanCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card space-y-4 hover:border-primary/40 transition-colors">
      {/* Plan Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground">
              {plan.studentName}
            </h4>
            <span className="text-xs text-muted-foreground font-mono">
              ({plan.studentNumber})
            </span>
            {getSpecialNeedBadge(plan.specialNeedType)}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {plan.classLevel} • {plan.sectionName} | Início: {plan.startDate} | Revisão: {plan.reviewDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs h-8"
            onClick={() => onRegisterSession(plan)}
          >
            <Icon name="CalendarPlus" className="size-3.5 text-primary" />
            Registar Sessão
          </Button>
        </div>
      </div>

      {/* Diagnosis / Summary */}
      <div className="text-xs bg-muted/20 p-3 rounded border">
        <span className="font-semibold text-foreground block mb-1">
          Diagnóstico & Parecer Psicopedagógico:
        </span>
        <p className="text-muted-foreground">{plan.diagnosisSummary}</p>
        <div className="mt-2 text-[11px] text-muted-foreground flex gap-4">
          <span><strong>Coord. Pedagógico:</strong> {plan.pedagogicalCoordinator}</span>
          <span><strong>Psicólogo(a) Escolar:</strong> {plan.schoolPsychologist}</span>
        </div>
      </div>

      {/* Curriculum Accommodations & Classroom Adjustments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-info-muted border border-info-border rounded space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-info">
            <Icon name="FileCheck" className="size-4" />
            Acomodações em Avaliações & Provas:
          </div>
          <ul className="list-disc list-inside space-y-1 text-foreground/90 text-[11px]">
            {plan.curriculumAccommodations.map((acc, i) => (
              <li key={i}>{acc}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-success-muted border border-success-border rounded space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-success">
            <Icon name="LayoutDashboard" className="size-4" />
            Orientações para a Sala de Aula:
          </div>
          <ul className="list-disc list-inside space-y-1 text-foreground/90 text-[11px]">
            {plan.classroomAdjustments.map((adj, i) => (
              <li key={i}>{adj}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sessions History */}
      {plan.sessions && plan.sessions.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <span className="font-semibold text-xs text-foreground block">
            Histórico de Sessões & Evolução ({plan.sessions.length}):
          </span>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {plan.sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-2.5 rounded border bg-muted/10 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                  <span>
                    📅 {sess.date} — {sess.practitionerName} ({sess.sessionType})
                  </span>
                  {sess.nextSessionDate && (
                    <span className="text-primary font-semibold">
                      Próxima: {sess.nextSessionDate}
                    </span>
                  )}
                </div>
                <p className="text-foreground">
                  <strong>Tópicos:</strong> {sess.topicsDiscussed}
                </p>
                <p className="text-muted-foreground">
                  <strong>Recomendações:</strong> {sess.recommendations}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
