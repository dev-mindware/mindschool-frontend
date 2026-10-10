"use client";

import React, { useState } from "react";
import { Can, DataList, type Column } from "@/components";
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
  isLoading?: boolean;
}

export function SubjectsList({ subjects, isLoading }: SubjectsListProps) {
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
<Can permission="subject:write">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleEdit(item)}
            >
              <Icon name="Pencil" className="h-4 w-4" />
              Editar Disciplina
            </DropdownMenuItem>
</Can>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataList<Subject>
        prefix="disciplinas"
        rows={subjects}
        columns={columns}
        isLoading={isLoading}
        pageSize={10}
        searchPlaceholder="Pesquisar por nome, código ou descrição"
        searchText={(s) => `${s.name} ${s.code} ${s.description ?? ""}`}
        filters={[
          { key: "ciclo", label: "Ciclo", icon: "Layers", options: [{ value: "PRIMARY", label: "Primário" }, { value: "LOWER_SECONDARY", label: "Iº Ciclo" }, { value: "UPPER_SECONDARY", label: "IIº Ciclo / Médio" }], match: (s, v) => s.cycle === v },
          { key: "tipo", label: "Tipo", icon: "Star", options: [{ value: "nuclear", label: "Nuclear" }, { value: "geral", label: "Geral" }], match: (s, v) => (v === "nuclear" ? Boolean(s.isCore) : !s.isCore) },
          { key: "carga", label: "Carga semanal", icon: "Clock", options: [{ value: "baixa", label: "Até 2 h" }, { value: "media", label: "3 a 4 h" }, { value: "alta", label: "5 h ou mais" }], match: (s, v) => (v === "baixa" ? s.weeklyHours <= 2 : v === "media" ? s.weeklyHours >= 3 && s.weeklyHours <= 4 : s.weeklyHours >= 5) },
          { key: "estado", label: "Estado", icon: "ToggleLeft", options: [{ value: "on", label: "Activas" }, { value: "off", label: "Inactivas" }], match: (s, v) => (v === "on" ? s.isActive : !s.isActive) },
        ]}
        sorts={[
          { value: "nome", label: "Nome", compare: (a, b) => a.name.localeCompare(b.name, "pt") },
          { value: "codigo", label: "Código", compare: (a, b) => a.code.localeCompare(b.code) },
          { value: "carga", label: "Carga semanal", compare: (a, b) => a.weeklyHours - b.weeklyHours },
        ]}
        emptyTitle="Nenhuma disciplina encontrada"
        emptyDescription="Ajuste os filtros ou cadastre uma disciplina."
        emptyIcon="BookOpen"
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
