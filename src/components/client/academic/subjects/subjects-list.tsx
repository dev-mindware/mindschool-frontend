"use client";

import React, { useState } from "react";
import { Can, ConfirmModal, DataList, type Column } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { useSubjects } from "@/hooks/school/use-academic";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
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
  const [toDelete, setToDelete] = useState<Subject | null>(null);
  const { openModal } = useModal();
  const { remove } = useSubjects();

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
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{item.name}</span>
          {item.isCore && (
            <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
              <Icon name="Star" className="w-2.5 h-2.5 fill-current" />
              Nuclear
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "gradingScale",
      header: "Regime de Avaliação",
      render: (_, item) => {
        const scaleMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
          quantitativa: { label: "Quantitativa (0–20)", variant: "default" },
          qualitativa: { label: "Qualitativa", variant: "secondary" },
          mista: { label: "Mista", variant: "outline" },
        };
        const conf = (item.gradingScale && scaleMap[item.gradingScale]) || scaleMap.quantitativa;
        return (
          <Badge variant={conf.variant} className="text-xs">
            {conf.label}
          </Badge>
        );
      },
    },
    {
      key: "weeklyHours",
      header: "Carga Horária",
      render: (_, item) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/60 px-2.5 py-1 rounded-full text-muted-foreground">
          <Icon name="Clock" className="w-3.5 h-3.5" />
          {item.weeklyHours > 0 ? `${item.weeklyHours}h / semana` : "Definida por turma"}
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
          {item.isActive ? "Ativa" : "Inativa"}
        </span>
      ),
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
<Can permission="subject:write">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleEdit(item)}
            >
              <Icon name="Pencil" className="h-4 w-4" />
              Editar Disciplina
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={() => { setToDelete(item); openModal("subject-delete"); }}
            >
              <Icon name="Trash2" className="h-4 w-4" />
              Apagar Disciplina
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
          { key: "regime", label: "Regime", icon: "GraduationCap", options: [{ value: "quantitativa", label: "Quantitativa (0–20)" }, { value: "qualitativa", label: "Qualitativa" }, { value: "mista", label: "Mista" }], match: (s, v) => (s.gradingScale ?? "quantitativa") === v },
          { key: "tipo", label: "Tipo", icon: "Star", options: [{ value: "nuclear", label: "Nuclear" }, { value: "geral", label: "Geral" }], match: (s, v) => (v === "nuclear" ? Boolean(s.isCore) : !s.isCore) },
          { key: "estado", label: "Estado", icon: "ToggleLeft", options: [{ value: "on", label: "Ativas" }, { value: "off", label: "Inativas" }], match: (s, v) => (v === "on" ? s.isActive : !s.isActive) },
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

      <ConfirmModal
        id="subject-delete"
        title="Apagar disciplina"
        description={toDelete ? `Apagar a disciplina «${toDelete.name}»?` : ""}
        confirmLabel="Apagar disciplina"
        destructive
        irreversible
        isLoading={remove.isPending}
        effects={[
          "Só se apaga uma disciplina que não está atribuída a nenhuma turma.",
          "Se estiver em uso, o sistema recusa e diz em quantas turmas está.",
        ]}
        onConfirm={() =>
          toDelete
            ? remove.mutateAsync(toDelete.id).then(() => { SucessMessage("Disciplina apagada."); setToDelete(null); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível apagar a disciplina.")); throw e; })
            : undefined
        }
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
