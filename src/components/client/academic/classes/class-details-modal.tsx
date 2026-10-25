"use client";

import React from "react";
import { AcademicSection } from "@/types";
import {
  GlobalModal,
  Button,
  Badge,
  DetailRow,
  Icon,
} from "@/components";

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: AcademicSection | null;
}

const CYCLE_LABELS: Record<string, string> = {
  PRIMARY: "Ensino Primário",
  LOWER_SECONDARY: "Iº Ciclo Secundário",
  UPPER_SECONDARY: "IIº Ciclo Secundário / Técnico",
};

export function ClassDetailsModal({
  isOpen,
  onClose,
  section,
}: ClassDetailsModalProps) {
  if (!section || !isOpen) return null;

  const occupancyRate =
    section.capacity > 0
      ? Math.round((section.currentEnrollmentCount / section.capacity) * 100)
      : 0;

  const availableSpots = section.capacity - section.currentEnrollmentCount;

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="DoorOpen" className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Turma: {section.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {section.classLevel} • {section.roomNumber}
              </span>
              <Badge variant="outline" className="text-xs">
                {section.shift === "MORNING" ? "Manhã" : section.shift === "AFTERNOON" ? "Tarde" : "Noite"}
              </Badge>
              <Badge
                variant={availableSpots <= 0 ? "destructive" : occupancyRate > 85 ? "secondary" : "default"}
                className="text-xs"
              >
                {availableSpots <= 0 ? "Lotada" : `${availableSpots} vagas livres`}
              </Badge>
            </div>
          </div>
        </div>
      }
      className="!max-h-[85vh] !w-[95vw] sm:!max-w-2xl lg:!max-w-3xl overflow-y-auto"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Informações da Turma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-card border">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Estrutura Pedagógica
            </h4>
            <DetailRow label="Designação da Turma" value={section.name} />
            <DetailRow label="Ano de Escolaridade" value={section.classLevel} />
            <DetailRow label="Ciclo Curricular" value={CYCLE_LABELS[section.cycle] || section.cycle} />
            <DetailRow label="Ano Letivo" value={section.academicYear} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Logística & Turno
            </h4>
            <DetailRow label="Sala de Aulas" value={section.roomNumber} />
            <DetailRow
              label="Turno Letivo"
              value={
                section.shift === "MORNING"
                  ? "Manhã"
                  : section.shift === "AFTERNOON"
                  ? "Tarde"
                  : "Noite / Pós-laboral"
              }
            />
            <DetailRow label="Diretor de Turma" value={section.mainTeacherName || "Ainda não atribuído"} />
          </div>
        </div>

        {/* Lotação e Vagas */}
        <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-foreground">
              Ocupação de Vagas na Sala
            </span>
            <span className="font-bold text-primary">
              {section.currentEnrollmentCount} / {section.capacity} Alunos ({occupancyRate}%)
            </span>
          </div>

          {/* Barra de Progresso */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                occupancyRate >= 100
                  ? "bg-rose-500"
                  : occupancyRate >= 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="p-2 bg-card rounded-lg border">
              <span className="text-muted-foreground block">Capacidade Total</span>
              <span className="font-bold text-sm">{section.capacity}</span>
            </div>
            <div className="p-2 bg-card rounded-lg border">
              <span className="text-muted-foreground block">Matriculados</span>
              <span className="font-bold text-sm text-primary">{section.currentEnrollmentCount}</span>
            </div>
            <div className="p-2 bg-card rounded-lg border">
              <span className="text-muted-foreground block">Vagas Restantes</span>
              <span className={`font-bold text-sm ${availableSpots <= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {availableSpots > 0 ? availableSpots : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlobalModal>
  );
}
