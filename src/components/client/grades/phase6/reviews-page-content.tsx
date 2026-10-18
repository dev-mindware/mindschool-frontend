"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, DataList, EmptyState, FormModal, FormTextarea, Input, TitleList, type Column } from "@/components";
import { useGradeReviews } from "@/hooks/school/use-phase6";
import { REVIEW_STATUS_LABEL, type ApiReview, type ReviewStatus } from "@/services/phase6-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const TYPE: Record<string, string> = { avaliacao_continua: "Aval. contínua", avaliacao_sistematica: "Aval. sistemática", prova_periodica: "Prova periódica" };
const val = (g: ApiReview["grade"]) => (g ? (g.numeric_value ?? g.qualitative_value ?? g.status) : "—");


/** Reapreciação de notas: o professor da disciplina inicia a revisão; a Direcção decide (deferir cria nova versão da nota). */
export function GradeReviewsPageContent() {
  const { reviews, isLoading, forbidden, start, decide } = useGradeReviews(undefined);
  const { openModal, closeModal } = useModal();
  const [active, setActive] = useState<ApiReview | null>(null);
  const [note, setNote] = useState("");
  const [newValue, setNewValue] = useState("");

  if (forbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não tem acesso às reapreciações." />;

  const open = (r: ApiReview) => { setActive(r); setNote(""); setNewValue(""); openModal("review-detail"); };
  const actionable = active && ["pedido", "em_revisao"].includes(active.status);
  const run = (p: Promise<unknown>, ok: string) => p.then(() => { SucessMessage(ok); closeModal("review-detail"); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); });

  const columns: Column<ApiReview>[] = [
    { key: "student.full_name", header: "Aluno", render: (_, r) => <span className="font-medium">{r.student.full_name}</span> },
    { key: "assessment", header: "Avaliação", render: (_, r) => (<div className="flex flex-col"><span>{r.assessment.subject}</span><span className="text-xs text-muted-foreground">{TYPE[r.assessment.type] ?? r.assessment.type} · {r.assessment.date}</span></div>) },
    { key: "grade", header: "Nota", render: (_, r) => <span className="font-mono">{val(r.grade)}{r.new_grade ? ` → ${val(r.new_grade)}` : ""}</span> },
    { key: "created_at", header: "Pedido em", render: (_, r) => <span className="font-mono text-xs">{r.created_at.slice(0, 10)}</span> },
    { key: "status", header: "Estado", render: (_, r) => <Badge variant={r.status === "deferido" ? "default" : r.status === "indeferido" ? "destructive" : "outline"}>{REVIEW_STATUS_LABEL[r.status]}</Badge> },
    { key: "action", header: "Acção", render: (_, r) => <ButtonOnlyAction data={r} actions={[{ label: ["pedido", "em_revisao"].includes(r.status) ? "Rever / decidir" : "Ver detalhe", icon: "Eye", onClick: open }]} /> },
  ];

  const subjects = [...new Set(reviews.map((r) => r.assessment.subject))].sort();

  return (
    <div className="space-y-6">
      <TitleList title="Reapreciação de Notas" suTitle="Pedidos dos encarregados/alunos sobre notas de pautas fechadas: revisão pelo professor e decisão da Direcção." />

      <DataList<ApiReview>
        prefix="reapreciacoes"
        rows={reviews}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar por aluno ou disciplina"
        searchText={(r) => `${r.student.full_name} ${r.assessment.subject} ${r.reason}`}
        filters={[
          { key: "estado", label: "Estado", icon: "Tag", options: (Object.keys(REVIEW_STATUS_LABEL) as ReviewStatus[]).map((s) => ({ value: s, label: REVIEW_STATUS_LABEL[s] })), match: (r, v) => r.status === v },
          { key: "disciplina", label: "Disciplina", icon: "BookOpen", options: subjects.map((s) => ({ value: s, label: s })), match: (r, v) => r.assessment.subject === v },
          { key: "tipo", label: "Tipo de avaliação", icon: "ClipboardList", options: Object.entries(TYPE).map(([value, label]) => ({ value, label })), match: (r, v) => r.assessment.type === v },
        ]}
        dateFilters={[{ key: "pedido", label: "Pedido", getDate: (r) => r.created_at }]}
        sorts={[
          { value: "data", label: "Data do pedido", compare: (a, b) => a.created_at.localeCompare(b.created_at) },
          { value: "aluno", label: "Aluno", compare: (a, b) => a.student.full_name.localeCompare(b.student.full_name) },
          { value: "estado", label: "Estado", compare: (a, b) => a.status.localeCompare(b.status) },
        ]}
        emptyTitle="Sem pedidos"
        emptyDescription="Os pedidos de reapreciação aparecem aqui."
        emptyIcon="FileSearch"
      />

      <FormModal id="review-detail" title={active ? `${active.student.full_name} — ${active.assessment.subject}` : "Reapreciação"} description={active ? REVIEW_STATUS_LABEL[active.status] : undefined} size="lg" readOnly onSubmit={() => undefined}>
        {active && (
          <div className="sm:col-span-2 space-y-3 text-sm">
            <p><span className="text-muted-foreground">Nota actual:</span> <strong className="font-mono">{val(active.grade)}</strong> (v{active.grade?.version ?? "—"})</p>
            <p className="rounded-lg border p-2"><span className="text-muted-foreground">Motivo do pedido:</span> {active.reason}</p>
            {active.review_note && <p className="rounded-lg border p-2"><span className="text-muted-foreground">Revisão:</span> {active.review_note}</p>}
            {active.decision_note && <p className="rounded-lg border p-2"><span className="text-muted-foreground">Decisão:</span> {active.decision_note}</p>}
            {actionable && (
              <div className="grid gap-3 border-t pt-3 sm:grid-cols-2">
                <FormTextarea label="Parecer / fundamentação (mín. 10 caracteres para decidir)" value={note} onChange={setNote} />
                <Input label="Nota corrigida (0-20)" type="quantity" min={0} max={20} step={0.5} value={newValue} onChange={(e) => setNewValue(e.target.value)} />
                <ul className="list-disc space-y-1 pl-4 text-[11px] text-muted-foreground">
                  <li><strong>Deferir</strong> cria uma nova versão da nota (a anterior fica no histórico) e exige uma nota diferente da actual. Se a pauta estiver fechada, volta a guardar-se uma versão da pauta e a proposta de transição do aluno pode ter de ser revista.</li>
                  <li><strong>Indeferir</strong> mantém a nota. Nos dois casos a justificação (mín. 10 caracteres) fica registada.</li>
                </ul>
                <div className="flex flex-wrap items-end gap-2">
                  {active.status === "pedido" && <Button size="sm" variant="outline" disabled={start.isPending} onClick={() => run(start.mutateAsync({ id: active.id, note: note.trim() || undefined }), "Revisão iniciada.")}>Iniciar revisão</Button>}
                  <Button size="sm" disabled={note.trim().length < 10 || newValue === "" || Number(newValue) < 0 || Number(newValue) > 20 || decide.isPending} onClick={() => run(decide.mutateAsync({ id: active.id, decision: "deferido", note: note.trim(), numericValue: Number(newValue) }), "Pedido deferido: nova versão da nota criada.")}>Deferir</Button>
                  <Button size="sm" variant="destructive" disabled={note.trim().length < 10 || decide.isPending} onClick={() => run(decide.mutateAsync({ id: active.id, decision: "indeferido", note: note.trim() }), "Pedido indeferido.")}>Indeferir</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
}
