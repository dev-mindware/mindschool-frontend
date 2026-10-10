"use client";
import { formatCurrencyCompact } from "@/utils";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, DataList, DynamicMetricCard, EmptyState, FormModal, FormSelect, FormTextarea, Input, Tabs, TabsContent, TabsList, TabsTrigger, TitleList, type Column } from "@/components";
import { PlatformEmails } from "./platform-emails";
import { platformService, type ApiDeadEvent, type ApiQueueOrder } from "@/services/platform-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const ok = (message: string) => () => { SucessMessage(message); };
const fail = (e: unknown): never => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };
const ATTENTION: Record<string, string> = {
  pending_payment_reviews: "Comprovativos por rever", fiscal_submissions_pending: "Submissões fiscais pendentes", fiscal_submissions_failed: "Submissões fiscais com erro",
  dead_letter_events: "Eventos em dead-letter", failed_report_jobs_24h: "Relatórios falhados (24 h)", past_due_or_grace_subscriptions: "Subscrições em atraso/graça",
};
const DECISIONS = [
  { value: "approved", label: "Aprovar pagamento" },
  { value: "replacement_required", label: "Pedir novo comprovativo" },
  { value: "rejected", label: "Rejeitar pagamento" },
];
const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));

/** Painel da plataforma (administração do sistema): visão geral, fila de revisão de comprovativos e outbox. */
export function PlatformPageContent() {
  const qc = useQueryClient();
  const { openModal } = useModal();
  const overview = useQuery({ queryKey: ["platform-overview"], queryFn: platformService.overview, staleTime: 30 * 1000, retry: false });
  const queue = useQuery({ queryKey: ["platform-queue"], queryFn: platformService.queue, staleTime: 15 * 1000, retry: false });
  const outbox = useQuery({ queryKey: ["platform-outbox"], queryFn: platformService.outbox, staleTime: 15 * 1000, retry: false });
  const dead = useQuery({ queryKey: ["platform-dead"], queryFn: platformService.deadLetters, staleTime: 15 * 1000, retry: false });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["platform-queue"] }); qc.invalidateQueries({ queryKey: ["platform-overview"] }); };
  const requeue = useMutation({ mutationFn: platformService.requeue, onSuccess: () => { qc.invalidateQueries({ queryKey: ["platform-dead"] }); qc.invalidateQueries({ queryKey: ["platform-outbox"] }); } });
  const sweep = useMutation({ mutationFn: platformService.sweep, onSuccess: refresh });
  const start = useMutation({ mutationFn: (id: string) => platformService.startReview(id), onSuccess: refresh });

  const [target, setTarget] = useState<ApiQueueOrder | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | "replacement_required">("approved");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const review = useMutation({
    mutationFn: () => platformService.review(target!.id, { decision, reason: reason.trim(), confirmedAmount: decision === "approved" ? amount : undefined, reference: reference.trim() || undefined }),
    onSuccess: refresh,
  });

  const openProof = (o: ApiQueueOrder) => platformService.proofBlob(o.id).then((b) => window.open(URL.createObjectURL(b), "_blank")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem comprovativo.")));
  const openReview = (o: ApiQueueOrder) => { setTarget(o); setDecision("approved"); setReason(""); setAmount(o.total_amount); setReference(""); openModal("platform-review"); };

  const o = overview.data;
  if (overview.isError) return <EmptyState icon="ShieldAlert" title="Área restrita" description="Esta área é só para a administração do sistema." />;

  const orders = queue.data ?? [];
  const orderColumns: Column<ApiQueueOrder>[] = [
    { key: "school", header: "Escola", render: (_, q) => (<div><p className="text-sm font-semibold">{q.school.name}</p><p className="text-xs text-muted-foreground">NIF {q.school.nif}</p></div>) },
    { key: "plan", header: "Plano", render: (_, q) => (<div><p className="text-sm">{q.plan.name}</p><p className="text-xs text-muted-foreground">{q.addon_codes.length ? `+ ${q.addon_codes.join(", ")}` : "Sem extras"} • {q.period_months} mês(es)</p></div>) },
    { key: "total_amount", header: "Valor", render: (_, q) => <span className="font-mono text-xs">{formatCurrencyCompact(q.total_amount)}</span> },
    { key: "waiting_hours", header: "Espera", render: (_, q) => <span className="text-xs">{q.waiting_hours ?? 0} h</span> },
    { key: "status", header: "Estado", render: (_, q) => <Badge variant="outline">{q.status}</Badge> },
    {
      key: "actions",
      header: "Acção",
      render: (_, q) => (
        <ButtonOnlyAction data={q} actions={[
          { label: "Ver comprovativo", icon: "Eye", onClick: openProof },
          ...(q.status === "payment_proof_submitted" ? [{ label: "Iniciar revisão", icon: "Play" as const, onClick: (x: ApiQueueOrder) => void start.mutateAsync(x.id).then(ok("Revisão iniciada.")).catch(fail) }] : []),
          ...(q.status === "under_review" ? [{ label: "Decidir", icon: "Stamp" as const, onClick: openReview }] : []),
        ]} />
      ),
    },
  ];

  const deadColumns: Column<ApiDeadEvent>[] = [
    { key: "type", header: "Evento", render: (_, d) => <span className="font-medium">{d.type}</span> },
    { key: "attempts", header: "Tentativas", render: (_, d) => <span className="font-mono text-xs">{d.attempts}</span> },
    { key: "last_error", header: "Último erro", render: (_, d) => <span className="line-clamp-2 text-xs text-rose-600">{d.last_error}</span> },
    { key: "occurred_at", header: "Ocorreu em", render: (_, d) => <span className="text-xs">{d.occurred_at.slice(0, 16).replace("T", " ")}</span> },
    { key: "actions", header: "Acção", render: (_, d) => <ButtonOnlyAction data={d} actions={[{ label: "Reenfileirar", icon: "RotateCcw", onClick: (x) => void requeue.mutateAsync(x.id).then(ok("Evento reenfileirado.")).catch(fail) }]} /> },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Painel da Plataforma" suTitle="Subscrições, revisão de pagamentos e saúde das filas.">
        <Button size="sm" variant="outline" className="text-xs" disabled={sweep.isPending} onClick={() => void sweep.mutateAsync().then(ok("Ciclo de vida das subscrições executado.")).catch(fail)}>Executar ciclo de subscrições</Button>
      </TitleList>

      {o && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
          <DynamicMetricCard title={formatCurrencyCompact(o.mrr)} subtitle="Receita Mensal (MRR)" description={`ARR ${formatCurrencyCompact(o.arr)}`} icon="Wallet" />
          {Object.entries(o.schools_by_subscription_status).slice(0, 3).map(([k, v]) => <DynamicMetricCard key={k} title={`${v}`} subtitle={`Escolas: ${k}`} description="Por estado de subscrição" icon="Building2" />)}
        </div>
      )}
      {o && (
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(o.needs_attention).map(([k, v]) => <Badge key={k} variant={v > 0 ? "warning" : "outline"}>{ATTENTION[k] ?? k}: {v}</Badge>)}
        </div>
      )}

      <Tabs defaultValue="QUEUE" className="space-y-4">
        <TabsList><TabsTrigger value="QUEUE" className="text-xs">Comprovativos ({orders.length})</TabsTrigger><TabsTrigger value="OUTBOX" className="text-xs">Outbox</TabsTrigger><TabsTrigger value="EMAILS" className="text-xs">Emails</TabsTrigger></TabsList>
        <TabsContent value="QUEUE">
          <DataList<ApiQueueOrder>
            prefix="fila"
            rows={orders}
            columns={orderColumns}
            isLoading={queue.isLoading}
            pageSize={10}
            searchPlaceholder="Pesquisar por escola, NIF ou plano"
            searchText={(q) => `${q.school.name} ${q.school.nif} ${q.plan.name}`}
            filters={[
              { key: "estado", label: "Estado", icon: "ListFilter", options: uniq(orders.map((q) => q.status)).map((v) => ({ value: v, label: v })), match: (q, v) => q.status === v },
              { key: "plano", label: "Plano", icon: "Package", options: uniq(orders.map((q) => q.plan.name)).map((v) => ({ value: v, label: v })), match: (q, v) => q.plan.name === v },
              { key: "periodo", label: "Período", icon: "CalendarRange", options: uniq(orders.map((q) => String(q.period_months))).map((v) => ({ value: v, label: `${v} mês(es)` })), match: (q, v) => String(q.period_months) === v },
              { key: "tipo", label: "Tipo", icon: "Tag", options: uniq(orders.map((q) => q.kind)).map((v) => ({ value: v, label: v })), match: (q, v) => q.kind === v },
            ]}
            dateFilters={[{ key: "criado", label: "Criado", getDate: (q) => q.created_at }]}
            sorts={[{ value: "espera", label: "Tempo de espera", compare: (a, b) => (a.waiting_hours ?? 0) - (b.waiting_hours ?? 0) }, { value: "valor", label: "Valor", compare: (a, b) => Number(a.total_amount) - Number(b.total_amount) }]}
            emptyTitle="Sem comprovativos por rever"
            emptyDescription="A fila está vazia."
            emptyIcon="CheckCheck"
          />
        </TabsContent>
        <TabsContent value="EMAILS"><PlatformEmails /></TabsContent>
        <TabsContent value="OUTBOX" className="space-y-3">
          {outbox.data && <p className="text-xs">Pendentes <strong>{outbox.data.pending}</strong> • processados <strong>{outbox.data.processed}</strong> • dead-letter <strong>{outbox.data.dead_letter}</strong></p>}
          <DataList<ApiDeadEvent>
            prefix="dead"
            rows={dead.data ?? []}
            columns={deadColumns}
            isLoading={dead.isLoading}
            pageSize={10}
            searchPlaceholder="Pesquisar por tipo ou erro"
            searchText={(d) => `${d.type} ${d.last_error ?? ""}`}
            filters={[{ key: "tipo", label: "Tipo", icon: "ListFilter", options: uniq((dead.data ?? []).map((d) => d.type)).map((v) => ({ value: v, label: v })), match: (d, v) => d.type === v }]}
            dateFilters={[{ key: "data", label: "Ocorrência", getDate: (d) => d.occurred_at }]}
            sorts={[{ value: "data", label: "Data", compare: (a, b) => a.occurred_at.localeCompare(b.occurred_at) }, { value: "tentativas", label: "Tentativas", compare: (a, b) => a.attempts - b.attempts }]}
            emptyTitle="Sem eventos em dead-letter"
            emptyDescription="Todos os eventos foram processados."
            emptyIcon="CheckCheck"
          />
        </TabsContent>
      </Tabs>

      <FormModal id="platform-review" title="Decidir pagamento" description={target ? `${target.school.name} — ${target.plan.name} — ${formatCurrencyCompact(target.total_amount)}` : undefined} submitLabel="Registar decisão" isLoading={review.isPending} disabled={reason.trim().length < 5}
        onSubmit={() => review.mutateAsync().then(ok("Decisão registada.")).catch(fail)}>
        <div className="sm:col-span-2"><FormSelect label="Decisão" value={decision} onValueChange={(v) => setDecision(v as typeof decision)} options={DECISIONS} /></div>
        {decision === "approved" && <Input label="Valor confirmado" value={amount} onChange={(e) => setAmount(e.target.value)} />}
        <Input label="Referência bancária" value={reference} onChange={(e) => setReference(e.target.value)} />
        <div className="sm:col-span-2"><FormTextarea label="Fundamentação (mín. 5 caracteres) *" value={reason} onChange={setReason} rows={3} /></div>
      </FormModal>
    </div>
  );
}
