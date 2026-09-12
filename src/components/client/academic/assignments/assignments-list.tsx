"use client";

import React from "react";
import { GenericTable, Column } from "@/components/common/generic-table";
import { TeacherAssignment } from "@/types";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import { useSchoolDataStore } from "@/stores/school/school-data-store";

interface AssignmentsListProps {
  assignments: TeacherAssignment[];
  total: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function AssignmentsList({
  assignments,
  total,
  totalPages,
  currentPage,
  setCurrentPage,
  goToNextPage,
  goToPreviousPage,
}: AssignmentsListProps) {
  const { removeAssignment } = useSchoolDataStore();

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
      header: "Ano Lectivo",
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
          title="Remover atribuição"
          onClick={() => {
            if (confirm(`Remover a atribuição do ${item.teacherName} na turma ${item.sectionName}?`)) {
              removeAssignment(item.id);
            }
          }}
        >
          <Icon name="Trash2" className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <GenericTable
      columns={columns}
      data={assignments}
      total={total}
      page={currentPage}
      totalPages={totalPages}
      setPage={setCurrentPage}
      goToNextPage={goToNextPage}
      goToPreviousPage={goToPreviousPage}
      emptyMessage="Nenhuma distribuição docente registada."
    />
  );
}
