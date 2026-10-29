"use client";

import React from "react";
import { AcademicSection } from "@/types";
import {
  Button,
  Badge,
  DetailRow,
  Icon,
  Progress,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
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
  if (!section) return null;

  const occupancyRate =
    section.capacity > 0
      ? Math.round((section.currentEnrollmentCount / section.capacity) * 100)
      : 0;

  const availableSpots = section.capacity - section.currentEnrollmentCount;

  return (
    <Sheet open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader className="p-0">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Icon name="DoorOpen" className="size-6" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                Turma: {section.name}
              </SheetTitle>
              <SheetDescription asChild>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {section.classLevel} • {section.roomNumber}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {section.shift === "MORNING"
                      ? "Manhã"
                      : section.shift === "AFTERNOON"
                      ? "Tarde"
                      : "Noite"}
                  </Badge>
                  <Badge
                    variant={
                      availableSpots <= 0
                        ? "destructive"
                        : occupancyRate > 85
                        ? "warning"
                        : "success"
                    }
                    className="text-xs"
                  >
                    {availableSpots <= 0 ? "Lotada" : `${availableSpots} vagas livres`}
                  </Badge>
                </div>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Informações da Turma */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estrutura Pedagógica
              </h4>
              <DetailRow label="Designação da Turma" value={section.name} />
              <DetailRow label="Ano de Escolaridade" value={section.classLevel} />
              <DetailRow
                label="Ciclo Curricular"
                value={CYCLE_LABELS[section.cycle] || section.cycle}
              />
              <DetailRow label="Ano Letivo" value={section.academicYear} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
              <DetailRow
                label="Diretor de Turma"
                value={section.mainTeacherName || "Ainda não atribuído"}
              />
            </div>
          </div>

          <Separator />

          {/* Lotação e Vagas */}
          <div className="space-y-3 rounded-xs bg-muted/30 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                Ocupação de Vagas na Sala
              </span>
              <span className="font-bold text-primary">
                {section.currentEnrollmentCount} / {section.capacity} Alunos ({occupancyRate}%)
              </span>
            </div>

            <Progress value={Math.min(100, occupancyRate)} className="h-2" />

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="rounded-xs bg-muted/30 p-3">
                <span className="block text-muted-foreground">Capacidade Total</span>
                <span className="text-sm font-bold">{section.capacity}</span>
              </div>
              <div className="rounded-xs bg-muted/30 p-3">
                <span className="block text-muted-foreground">Matriculados</span>
                <span className="text-sm font-bold text-primary">
                  {section.currentEnrollmentCount}
                </span>
              </div>
              <div className="rounded-xs bg-muted/30 p-3">
                <span className="block text-muted-foreground">Vagas Restantes</span>
                <span
                  className={`text-sm font-bold ${
                    availableSpots <= 0 ? "text-destructive" : "text-emerald-600"
                  }`}
                >
                  {availableSpots > 0 ? availableSpots : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
