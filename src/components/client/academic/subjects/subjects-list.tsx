"use client";

import React, { useState } from "react";
import { GenericTable, Column } from "@/components/common/generic-table";
import { Subject } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubjectModal } from "./subject-modal";

interface SubjectsListProps {
  subjects: Subject[];
  total: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function SubjectsList({
  subjects,
  total,
  totalPages,
  currentPage,
  setCurrentPage,
  goToNextPage,
  goToPreviousPage,
}: SubjectsListProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditModalOpen(true);
  };

  const columns: Column<Subject>[] = [
    {
      key: "code",
      header: "Código",
      render: (_, item) => (
        <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-muted">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nome da Disciplina",
      render: (_, item) => (
        <span className="font-medium text-foreground">{item.name}</span>
      ),
    },
    {
      key: "cycle",
      header: "Ciclo de Ensino",
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
      key: "weeklyHours",
      header: "Carga Horária Semanal",
      render: (_, item) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted px-2.5 py-1 rounded-full text-foreground">
          <Icon name="Clock" className="w-3.5 h-3.5 text-muted-foreground" />
          {item.weeklyHours}h / semana
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (_, item) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            item.isActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-zinc-500/10 text-zinc-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              item.isActive ? "bg-emerald-500" : "bg-zinc-400"
            }`}
          />
          {item.isActive ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    {
      key: "id",
      header: "Ações",
      render: (_, item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon name="EllipsisVertical" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleEdit(item)}
            >
              <Icon name="Pencil" className="h-4 w-4" />
              Editar Disciplina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <GenericTable
        columns={columns}
        data={subjects}
        total={total}
        page={currentPage}
        totalPages={totalPages}
        setPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyMessage="Nenhuma disciplina cadastrada."
      />

      <SubjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubject(null);
        }}
        subjectToEdit={selectedSubject}
      />
    </>
  );
}
