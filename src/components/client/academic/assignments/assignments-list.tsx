"use client";

import { useState } from "react";
import { TeacherAssignment } from "@/types";
import { ConfirmModal, ButtonOnlyAction, DataList, type Column } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { useTeacherAssignments } from "@/hooks/school/use-academic";

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));

interface AssignmentsListProps {
  assignments: TeacherAssignment[];
  isLoading?: boolean;
}

export function AssignmentsList({ assignments, isLoading }: AssignmentsListProps) {
  const { unassign } = useTeacherAssignments();
  const { openModal } = useModal();
  const [toRemove, setToRemove] = useState<TeacherAssignment | null>(null);

  const columns: Column<TeacherAssignment>[] = [
    {
      key: "teacherName",
      header: "Professor Docente",
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {item.teacherName.replace(/Prof\.(ª)?\s*(Dr\.(ª)?)?\s*/, "").slice(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-foreground">{item.teacherName}</span>
        </div>
      ),
    },
    {
      key: "subjectName",
      header: "Disciplina",
      render: (_, item) => (
        <span className="font-medium text-foreground text-sm">
          {item.subjectName}
        </span>
      ),
    },
    {
      key: "sectionName",
      header: "Turma Alocada",
      render: (_, item) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-medium">
          {item.sectionName}
        </span>
      ),
    },
    {
      key: "weeklyHours",
      header: "Carga Semanal",
      render: (_, item) => (
        <span className="text-xs font-semibold text-foreground">
          {item.weeklyHours} horas / semana
        </span>
      ),
    },
    {
      key: "academicYear",
      header: "Ano Letivo",
      render: (_, item) => (
        <span className="text-xs text-muted-foreground font-mono">
          {item.academicYear}
        </span>
      ),
    },
    {
      key: "id",
      header: "Ações",
      render: (_, item) => (
        <ButtonOnlyAction data={item} actions={[{ permission: "teaching:write", label: "Remover atribuição", icon: "Trash2", variant: "destructive", onClick: (x) => { setToRemove(x); openModal("assignment-remove"); } }]} />
      ),
    },
  ];

  return (
    <>
      <DataList<TeacherAssignment>
        prefix="atribuicoes"
        rows={assignments}
        columns={columns}
        isLoading={isLoading}
        pageSize={10}
        searchPlaceholder="Pesquisar por professor, disciplina ou turma"
        searchText={(a) => `${a.teacherName} ${a.subjectName} ${a.sectionName} ${a.teacherEmail ?? ""}`}
        filters={[
          { key: "professor", label: "Professor", icon: "User", options: uniq(assignments.map((a) => a.teacherName)).map((v) => ({ value: v, label: v })), match: (a, v) => a.teacherName === v },
          { key: "turma", label: "Turma", icon: "Users", options: uniq(assignments.map((a) => a.sectionName)).map((v) => ({ value: v, label: v })), match: (a, v) => a.sectionName === v },
          { key: "disciplina", label: "Disciplina", icon: "BookOpen", options: uniq(assignments.map((a) => a.subjectName)).map((v) => ({ value: v, label: v })), match: (a, v) => a.subjectName === v },
          { key: "ano", label: "Ano letivo", icon: "CalendarRange", options: uniq(assignments.map((a) => a.academicYear)).map((v) => ({ value: v, label: v })), match: (a, v) => a.academicYear === v },
          { key: "carga", label: "Carga semanal", icon: "Clock", options: [{ value: "baixa", label: "Até 2 h" }, { value: "media", label: "3 a 4 h" }, { value: "alta", label: "5 h ou mais" }], match: (a, v) => (v === "baixa" ? a.weeklyHours <= 2 : v === "media" ? a.weeklyHours >= 3 && a.weeklyHours <= 4 : a.weeklyHours >= 5) },
        ]}
        dateFilters={[{ key: "criada", label: "Atribuição", getDate: (a) => a.createdAt }]}
        sorts={[
          { value: "professor", label: "Professor", compare: (a, b) => a.teacherName.localeCompare(b.teacherName, "pt") },
          { value: "turma", label: "Turma", compare: (a, b) => a.sectionName.localeCompare(b.sectionName, "pt") },
          { value: "carga", label: "Carga semanal", compare: (a, b) => a.weeklyHours - b.weeklyHours },
        ]}
        emptyTitle="Nenhuma atribuição encontrada"
        emptyDescription="Ajuste os filtros ou crie uma nova atribuição."
        emptyIcon="UserPlus"
      />
      <ConfirmModal
        id="assignment-remove"
        title="Remover atribuição"
        description={toRemove ? `Remover a atribuição de ${toRemove.teacherName} na turma ${toRemove.sectionName}?` : ""}
        destructive
        confirmLabel="Remover"
        onConfirm={() => (toRemove ? unassign.mutateAsync({ sectionId: toRemove.sectionId, id: toRemove.id }) : Promise.resolve())}
      />
    </>
  );
}
