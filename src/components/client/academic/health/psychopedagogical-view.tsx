"use client";

import { useState } from "react";
import { Can, Badge, Button, ButtonOnlyAction, DataList, EmptyState, Icon, type Column } from "@/components";
import { useHealth } from "@/hooks/school/use-health";
import { CASE_CATEGORY_LABEL, CASE_STATUS_LABEL, type ApiCase } from "@/services/health-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { PsychopedagogicalPlanCard } from "./psychopedagogical-plan-card";
import { NewPsychopedagogicalPlanModal } from "./new-psychopedagogical-plan-modal";

/** Acompanhamento psicopedagógico (confidencial): casos, sessões e encerramento. */
export function PsychopedagogicalView() {
  const { cases, nameOf, casesLoading, casesForbidden } = useHealth();
  const { openModal } = useModal();
  const [openId, setOpenId] = useState<string | null>(null);

  if (casesForbidden) return <EmptyState icon="Lock" title="Acesso confidencial" description="O acompanhamento psicopedagógico é confidencial e o seu perfil não tem acesso." />;

  const columns: Column<ApiCase>[] = [
    { key: "student_id", header: "Aluno", render: (_, c) => <span className="font-medium">{nameOf.get(c.student_id) ?? "Aluno"}</span> },
    { key: "category", header: "Categoria", render: (_, c) => CASE_CATEGORY_LABEL[c.category] },
    { key: "summary", header: "Resumo", render: (_, c) => <span className="line-clamp-1 max-w-xs text-muted-foreground">{c.summary}</span> },
    { key: "opened_at", header: "Aberto em", render: (_, c) => <span className="font-mono text-xs">{c.opened_at.slice(0, 10)}</span> },
    { key: "status", header: "Estado", render: (_, c) => <Badge variant={c.status === "encerrado" ? "secondary" : "outline"}>{CASE_STATUS_LABEL[c.status]}</Badge> },
    { key: "action", header: "Acção", render: (_, c) => <ButtonOnlyAction data={c} actions={[{ label: "Abrir caso", icon: "Eye", onClick: (x) => { setOpenId(x.id); openModal("health-case"); } }]} /> },
  ];

  return (
    <div className="space-y-2">
      <div className="mt-6 flex justify-end"><Can permission="psycho:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("health-new-case")}><Icon name="Plus" className="size-4" />Abrir caso</Button></Can></div>
      <DataList<ApiCase>
        prefix="casos"
        rows={cases}
        columns={columns}
        isLoading={casesLoading}
        searchPlaceholder="Pesquisar por aluno ou resumo"
        searchText={(c) => `${nameOf.get(c.student_id) ?? ""} ${c.summary}`}
        filters={[
          { key: "categoria", label: "Categoria", icon: "Tag", options: Object.entries(CASE_CATEGORY_LABEL).map(([value, label]) => ({ value, label })), match: (c, v) => c.category === v },
          { key: "estado", label: "Estado", icon: "CircleDot", options: Object.entries(CASE_STATUS_LABEL).map(([value, label]) => ({ value, label })), match: (c, v) => c.status === v },
        ]}
        dateFilters={[{ key: "aberto", label: "Aberto", getDate: (c) => c.opened_at }]}
        sorts={[{ value: "data", label: "Data de abertura", compare: (a, b) => a.opened_at.localeCompare(b.opened_at) }, { value: "aluno", label: "Aluno", compare: (a, b) => (nameOf.get(a.student_id) ?? "").localeCompare(nameOf.get(b.student_id) ?? "") }]}
        emptyTitle="Sem casos em acompanhamento"
        emptyIcon="BrainCircuit"
      />
      <NewPsychopedagogicalPlanModal />
      <PsychopedagogicalPlanCard caseId={openId} />
    </div>
  );
}
