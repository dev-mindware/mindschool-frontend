"use client";

import { useState } from "react";
import { Button, ConfirmModal, DataList, Icon, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, type Column } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCan } from "@/hooks/auth/use-can";
import { useTeachingPlans } from "@/hooks/school/use-planning";
import type { PlanKind, PlanStatus, TeachingPlan } from "@/services/planning-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { formatIsoDay } from "@/utils";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { DosificacaoEditor } from "./dosificacao-editor";
import { LessonPlanEditor } from "./lesson-plan-editor";
import { PlanView } from "./plan-view";

const STATUS: Record<PlanStatus, { label: string; variant: "secondary" | "info" | "success" | "warning" }> = {
  rascunho: { label: "Rascunho", variant: "secondary" },
  submetido: { label: "Submetido", variant: "info" },
  aprovado: { label: "Aprovado", variant: "success" },
  devolvido: { label: "Devolvido", variant: "warning" },
};

type Editing = { kind: PlanKind; plan?: TeachingPlan } | null;

/** Planeamento pedagógico (separador de Aulas e Sumários): dosificação trimestral e planos de aula, com aprovação da Direção Pedagógica. */
export function PlanningPanel() {
  const { can } = useCan();
  const canWrite = can("teaching_plan:write");
  const canReview = can("teaching_plan:review");
  const [editing, setEditing] = useState<Editing>(null);
  const [viewing, setViewing] = useState<TeachingPlan | null>(null);

  return (
    <div className="space-y-6">

      <Tabs defaultValue="dosificacao" className="space-y-2">
        <TabsList>
          <TabsTrigger value="dosificacao" className="gap-1.5"><Icon name="CalendarRange" className="size-4" />Dosificação trimestral</TabsTrigger>
          <TabsTrigger value="plano_aula" className="gap-1.5"><Icon name="NotebookPen" className="size-4" />Planos de aula</TabsTrigger>
        </TabsList>
        {(["dosificacao", "plano_aula"] as const).map((kind) => (
          <TabsContent key={kind} value={kind}>
            <PlanList kind={kind} canWrite={canWrite} canReview={canReview} onNew={() => setEditing({ kind })} onEdit={(plan) => setEditing({ kind, plan })} onView={setViewing} />
          </TabsContent>
        ))}
      </Tabs>

      {editing?.kind === "dosificacao" && <DosificacaoEditor key={editing.plan?.id ?? "new"} plan={editing.plan} onClose={() => setEditing(null)} />}
      {editing?.kind === "plano_aula" && <LessonPlanEditor key={editing.plan?.id ?? "new"} plan={editing.plan} onClose={() => setEditing(null)} />}
      {viewing && <ViewSheet plan={viewing} canReview={canReview} onClose={() => setViewing(null)} />}
    </div>
  );
}

function PlanList({ kind, canWrite, canReview, onNew, onEdit, onView }: { kind: PlanKind; canWrite: boolean; canReview: boolean; onNew: () => void; onEdit: (p: TeachingPlan) => void; onView: (p: TeachingPlan) => void }) {
  const { plans, isLoading, isError, submit, remove } = useTeachingPlans({ kind });
  const { openModal } = useModal();
  const [toDelete, setToDelete] = useState<TeachingPlan | null>(null);
  const deleteId = `plan-delete-${kind}`;
  const noun = kind === "dosificacao" ? "dosificação" : "plano de aula";
  const nounPlural = kind === "dosificacao" ? "dosificações" : "planos de aula";

  const submitPlan = async (p: TeachingPlan) => {
    try {
      await submit.mutateAsync(p.id);
      SucessMessage("Submetido à Direção Pedagógica.");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível submeter."));
    }
  };

  const columns: Column<TeachingPlan>[] = [
    {
      key: "title",
      header: "Plano",
      className: "min-w-[220px]",
      render: (_, p) => (
        <div>
          <p className="text-sm font-medium">{p.title}</p>
          {p.status === "devolvido" && p.review_note && <p className="text-xs text-warning">Observação da Direção: {p.review_note}</p>}
        </div>
      ),
    },
    { key: "subject", header: "Disciplina e turma", render: (_, p) => <span className="text-sm">{p.subject.name} · {p.section.name}</span> },
    { key: "teacher", header: "Professor", render: (_, p) => <span className="text-sm text-muted-foreground">{p.teacher.full_name}</span> },
    ...(kind === "plano_aula" ? [{ key: "lesson_date", header: "Data", render: (_: unknown, p: TeachingPlan) => <span className="text-sm">{p.lesson_date ? formatIsoDay(p.lesson_date) : "—"}</span> }] : []),
    { key: "status", header: "Estado", render: (_, p) => <Badge variant={STATUS[p.status].variant}>{STATUS[p.status].label}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (_, p) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(p)}>{canReview && p.status === "submetido" ? "Rever" : "Ver"}</Button>
          {canWrite && (p.status === "rascunho" || p.status === "devolvido") && (
            <>
              <Button variant="outline" size="sm" onClick={() => onEdit(p)}>Editar</Button>
              <Button size="sm" disabled={submit.isPending} onClick={() => submitPlan(p)}>Submeter</Button>
            </>
          )}
          {canWrite && p.status === "rascunho" && (
            <Button variant="ghost" size="icon" title="Eliminar rascunho" onClick={() => { setToDelete(p); openModal(deleteId); }}><Icon name="Trash2" className="size-4" /></Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <DataList<TeachingPlan>
        prefix={`planos-${kind}`}
        rows={plans}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Pesquisar plano, disciplina ou professor"
        searchText={(p) => `${p.title} ${p.subject.name} ${p.section.name} ${p.teacher.full_name}`}
        filters={[{ key: "estado", label: "Estado", icon: "CircleDot", options: (Object.keys(STATUS) as PlanStatus[]).map((v) => ({ value: v, label: STATUS[v].label })), match: (p, v) => p.status === v }]}
        sorts={[{ value: "atualizado", label: "Atualização", compare: (a, b) => a.updated_at.localeCompare(b.updated_at) }]}
        toolbar={canWrite ? <Button size="sm" className="gap-2" onClick={onNew}><Icon name="Plus" className="size-4" />{kind === "dosificacao" ? "Nova dosificação" : "Novo plano de aula"}</Button> : undefined}
        emptyTitle={canWrite ? `Ainda não tem nenhuma ${noun}` : `Não há ${nounPlural} à espera de revisão`}
        emptyDescription={canWrite ? "Crie a primeira: a IA propõe um rascunho e você revê." : "Quando um professor submeter, aparece aqui."}
        emptyIcon="ClipboardPenLine"
      />

      <ConfirmModal
        id={deleteId}
        title="Eliminar rascunho"
        description={toDelete ? `Eliminar «${toDelete.title}»?` : ""}
        destructive
        confirmLabel="Eliminar"
        effects={["O rascunho é apagado e não pode ser recuperado.", "Só se eliminam rascunhos: o que já foi submetido fica no histórico."]}
        onConfirm={() => (toDelete ? remove.mutateAsync(toDelete.id).then(() => { SucessMessage("Rascunho eliminado."); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível eliminar o rascunho.")); throw e; }) : Promise.resolve())}
      />
    </div>
  );
}

function ViewSheet({ plan, canReview, onClose }: { plan: TeachingPlan; canReview: boolean; onClose: () => void }) {
  const { review } = useTeachingPlans();
  const [note, setNote] = useState("");
  const reviewing = canReview && plan.status === "submetido";

  const decide = async (decision: "aprovado" | "devolvido") => {
    if (decision === "devolvido" && note.trim().length < 5) return ErrorMessage("Explique ao professor o que falta (mínimo 5 caracteres).");
    try {
      await review.mutateAsync({ id: plan.id, decision, note: note.trim() || undefined });
      SucessMessage(decision === "aprovado" ? "Plano aprovado." : "Plano devolvido ao professor.");
      onClose();
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível registar a decisão."));
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-4xl">
        <SheetHeader className="p-0">
          <SheetTitle>{plan.title}</SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {plan.subject.name} · {plan.section.name} · {plan.teacher.full_name}
              <Badge variant={STATUS[plan.status].variant}>{STATUS[plan.status].label}</Badge>
            </div>
          </SheetDescription>
        </SheetHeader>
        <PlanView plan={plan} />
        {plan.review_note && <p className="text-sm"><strong>Observação da Direção:</strong> {plan.review_note}</p>}
        {reviewing && (
          <>
            <Textarea label="Observação (obrigatória se devolver)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            <SheetFooter className="flex-row justify-end gap-2 p-0">
              <Button variant="outline" onClick={() => decide("devolvido")} disabled={review.isPending}>Devolver ao professor</Button>
              <Button onClick={() => decide("aprovado")} disabled={review.isPending}>Aprovar</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
