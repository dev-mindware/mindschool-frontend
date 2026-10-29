"use client";

import React, { useState } from "react";
import { Can, ConfirmModal, DataList, type Column } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { useAcademicSections } from "@/hooks/school/use-academic";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
import { AcademicSection } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassModal } from "./class-modal";
import { ClassDetailsModal } from "./class-details-modal";

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));

interface ClassesListProps {
  sections: AcademicSection[];
  isLoading?: boolean;
}

export function ClassesList({ sections, isLoading }: ClassesListProps) {
  const [selectedSection, setSelectedSection] =
    useState<AcademicSection | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<AcademicSection | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AcademicSection | null>(null);
  const { openModal } = useModal();
  const { remove } = useAcademicSections();

  const handleEdit = (section: AcademicSection) => {
    setSelectedSection(section);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (section: AcademicSection) => {
    setSelectedForDetails(section);
    setIsDetailsModalOpen(true);
  };

  const columns: Column<AcademicSection>[] = [
    {
      key: "name",
      header: "Turma",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground">
            Ano Letivo: {item.academicYear}
          </span>
        </div>
      ),
    },
    {
      key: "classLevel",
      header: "Classe / Nível",
      render: (_, item) => (
        <span className="font-medium text-foreground text-sm">
          {item.classLevel}
        </span>
      ),
    },
    {
      key: "cycle",
      header: "Ciclo",
      render: (_, item) => {
        const cycleMap: Record<string, { label: string; variant: "info" | "default" | "warning" }> = {
          PRIMARY: { label: "Primário", variant: "info" },
          LOWER_SECONDARY: { label: "Iº Ciclo", variant: "default" },
          UPPER_SECONDARY: { label: "IIº Ciclo / Médio", variant: "warning" },
        };
        const conf = cycleMap[item.cycle] || cycleMap.PRIMARY;
        return (
          <Badge variant={conf.variant} className="text-xs">
            {conf.label}
          </Badge>
        );
      },
    },
    {
      key: "shift",
      header: "Turno",
      render: (_, item) => {
        const shiftMap = {
          MORNING: { label: "Manhã", icon: "Sun", color: "text-warning" },
          AFTERNOON: { label: "Tarde", icon: "Sunset", color: "text-warning" },
          EVENING: { label: "Noite", icon: "Moon", color: "text-info" },
          DIURNO: { label: "Diurno", icon: "SunMedium", color: "text-amber-500" },
        };
        const conf = shiftMap[item.shift] || shiftMap.MORNING;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Icon name={conf.icon as any} className={`w-3.5 h-3.5 ${conf.color}`} />
            {conf.label}
          </span>
        );
      },
    },
    {
      key: "roomNumber",
      header: "Sala",
      render: (_, item) => {
        const room = item.roomNumber?.trim();
        if (!room || room === "—") {
          return <span className="text-xs text-muted-foreground italic">Sem sala</span>;
        }
        return (
          <span className="text-xs font-mono bg-muted/80 px-2 py-0.5 rounded border border-border/50 text-foreground font-medium">
            {room}
          </span>
        );
      },
    },
    {
      key: "capacity",
      header: "Ocupação / Vagas",
      render: (_, item) => {
        const percent = Math.min(
          Math.round((item.currentEnrollmentCount / item.capacity) * 100),
          100
        );
        const isFull = item.currentEnrollmentCount >= item.capacity;
        return (
          <div className="flex flex-col gap-1 w-36">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">
                {item.currentEnrollmentCount} / {item.capacity}
              </span>
              <span
                className={`font-mono text-[11px] ${
                  isFull ? "text-rose-600 font-medium" : "text-muted-foreground"
                }`}
              >
                {percent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percent >= 90
                    ? "bg-rose-500"
                    : percent >= 75
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "id",
      header: "Ações",
      render: (_, item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Abrir menu de ações">
              <Icon name="EllipsisVertical" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleViewDetails(item)}
            >
              <Icon name="Eye" className="h-4 w-4 text-muted-foreground" />
              Ver Detalhes da Turma
            </DropdownMenuItem>
<Can permission="section:write">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleEdit(item)}
            >
              <Icon name="Pencil" className="h-4 w-4" />
              Editar Turma
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={() => { setToDelete(item); openModal("section-delete"); }}
            >
              <Icon name="Trash2" className="h-4 w-4" />
              Apagar Turma
            </DropdownMenuItem>
</Can>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataList<AcademicSection>
        prefix="turmas"
        rows={sections}
        columns={columns}
        isLoading={isLoading}
        pageSize={10}
        searchPlaceholder="Pesquisar turma, classe, sala ou diretor"
        searchText={(s) => `${s.name} ${s.classLevel} ${s.roomNumber} ${s.mainTeacherName ?? ""}`}
        filters={[
          { key: "turno", label: "Turno", icon: "Sun", options: [{ value: "MORNING", label: "Manhã" }, { value: "AFTERNOON", label: "Tarde" }, { value: "EVENING", label: "Noite" }], match: (s, v) => s.shift === v },
          { key: "ciclo", label: "Ciclo", icon: "Layers", options: [{ value: "PRIMARY", label: "Primário" }, { value: "LOWER_SECONDARY", label: "Iº Ciclo" }, { value: "UPPER_SECONDARY", label: "IIº Ciclo / Médio" }], match: (s, v) => s.cycle === v },
          { key: "classe", label: "Classe", icon: "GraduationCap", options: uniq(sections.map((s) => s.classLevel)).map((v) => ({ value: v, label: v })), match: (s, v) => s.classLevel === v },
          { key: "ano", label: "Ano letivo", icon: "CalendarRange", options: uniq(sections.map((s) => s.academicYear)).map((v) => ({ value: v, label: v })), match: (s, v) => s.academicYear === v },
          { key: "lotacao", label: "Lotação", icon: "Gauge", options: [{ value: "cheia", label: "Lotada (≥100%)" }, { value: "alta", label: "Alta (≥85%)" }, { value: "livre", label: "Com vagas (<85%)" }], match: (s, v) => { const r = s.capacity > 0 ? s.currentEnrollmentCount / s.capacity : 0; return v === "cheia" ? r >= 1 : v === "alta" ? r >= 0.85 : r < 0.85; } },
          { key: "estado", label: "Estado", icon: "ToggleLeft", options: [{ value: "on", label: "Ativas" }, { value: "off", label: "Inactivas" }], match: (s, v) => (v === "on" ? s.isActive : !s.isActive) },
          { key: "director", label: "Diretor de turma", icon: "UserCheck", options: [{ value: "com", label: "Com diretor" }, { value: "sem", label: "Sem diretor" }], match: (s, v) => (v === "com" ? Boolean(s.mainTeacherId) : !s.mainTeacherId) },
        ]}
        sorts={[
          { value: "nome", label: "Nome", compare: (a, b) => a.name.localeCompare(b.name, "pt") },
          { value: "lotacao", label: "Lotação", compare: (a, b) => a.currentEnrollmentCount / (a.capacity || 1) - b.currentEnrollmentCount / (b.capacity || 1) },
          { value: "capacidade", label: "Capacidade", compare: (a, b) => a.capacity - b.capacity },
        ]}
        emptyTitle="Nenhuma turma encontrada"
        emptyDescription="Ajuste os filtros ou crie uma nova turma."
        emptyIcon="DoorOpen"
      />

      <ClassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSection(null);
        }}
        sectionToEdit={selectedSection}
      />

      <ConfirmModal
        id="section-delete"
        title="Apagar turma"
        description={toDelete ? `Apagar a turma «${toDelete.classLevel} ${toDelete.name}»?` : ""}
        confirmLabel="Apagar turma"
        destructive
        irreversible
        isLoading={remove.isPending}
        effects={[
          "Só se apaga uma turma vazia: sem alunos matriculados, disciplinas atribuídas, horário, aulas, pautas ou conselhos.",
          "Se a turma já tem histórico, o sistema recusa e diz o que a impede de ser apagada.",
          "Apagar a turma liberta uma vaga na quota de turmas do plano.",
        ]}
        onConfirm={() =>
          toDelete
            ? remove.mutateAsync(toDelete.id).then(() => { SucessMessage("Turma apagada."); setToDelete(null); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível apagar a turma.")); throw e; })
            : undefined
        }
      />

      <ClassDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedForDetails(null);
        }}
        section={selectedForDetails}
      />
    </>
  );
}
