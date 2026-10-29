"use client";
import { formatIsoDay } from "@/utils/format-date";
import { formatCurrencyCompact, formatDate } from "@/utils";

import { useState } from "react";
import Link from "next/link";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, FileUpload, FormModal, HelpHint, Icon, Input, PROOF_ACCEPT_PDF_PNG, Progress, StatusLegend, TitleList, type Column } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useSubscription } from "@/hooks/school/use-subscription";
import type { ApiOrder } from "@/services/subscription-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const ORDER_LABEL: Record<string, string> = {
  pending_payment: "A aguardar pagamento", payment_proof_submitted: "Comprovativo enviado", under_review: "Em análise", proof_replacement_required: "Comprovativo a substituir",
  approved: "Aprovada", rejected: "Rejeitada", cancelled: "Cancelada",
};
const STATUS_LABEL: Record<string, string> = { trial: "Período de teste", active: "Ativa", past_due: "Pagamento em atraso", grace: "Em tolerância", suspended: "Suspensa", cancelled: "Cancelada", expired: "Expirada" };
const QUOTA_NAME: Record<string, string> = {
  students: "Alunos", users: "Utilizadores internos", teachers: "Professores", sections: "Turmas",
  exports_month: "Exportações este mês", academic_years_active: "Anos letivos ativos", storage_mb: "Armazenamento",
};
const QUOTA_NOTE: Record<string, string> = {
  users: "Conta só quem tem papel interno (direcção, secretaria, financeiro, professor). Encarregados e alunos não contam.",
  exports_month: "Cada ficheiro exportado (PDF, Excel…) conta uma. O contador recomeça todos os meses.",
  storage_mb: "Fotos, documentos de candidaturas e ficheiros guardados. Ao atingir o limite, novos envios são recusados.",
};
/** Armazenamento vem em MB; mostra-se em GB quando é grande. */
const fmtQuotaValue = (key: string, v: number) => (key === "storage_mb" && v >= 1024 ? `${(v / 1024).toFixed(v % 1024 === 0 ? 0 : 1)} GB` : key === "storage_mb" ? `${v} MB` : String(v));
const OPEN = ["pending_payment", "payment_proof_submitted", "proof_replacement_required"];
const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };

/** Subscrição da escola: resumo do plano, quotas, ordens e comprovativos de pagamento (análise manual). */
export function SubscriptionManager() {
  const { catalog, current, orders, isLoading, submitProof, cancelOrder, cancelSubscription } = useSubscription();
  const { openModal } = useModal();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reason, setReason] = useState("");

  const sub = current?.subscription;
  const quotas = (current?.quotas ?? []).filter((q) => q.limit !== null);

  const columns: Column<ApiOrder>[] = [
    { key: "created_at", header: "Data", render: (_, o) => <span className="font-mono text-xs">{formatDate(o.created_at)}</span> },
    { key: "plan", header: "Plano", render: (_, o) => (<div className="flex flex-col"><span className="font-medium">{o.plan.name}</span><span className="text-xs text-muted-foreground">{o.addon_codes.length ? `+ ${o.addon_codes.join(", ")} • ` : ""}{o.period_months} mês(es)</span></div>) },
    { key: "total_amount", header: "Total", render: (_, o) => <span className="font-mono text-xs">{formatCurrencyCompact(o.total_amount)}</span> },
    {
      key: "status",
      header: "Estado",
      render: (_, o) => (
        <Badge variant={o.status === "approved" ? "success" : o.status === "rejected" ? "destructive" : "outline"}>
          {ORDER_LABEL[o.status] ?? o.status}
        </Badge>
      ),
    },
    { key: "proofs", header: "Comprovativo", render: (_, o) => (o.proofs.length ? <span className="text-xs">{o.proofs.find((p) => p.is_current)?.file_name ?? "—"}</span> : "—") },
    {
      key: "action", header: "Ação",
      render: (_, o) => OPEN.includes(o.status) ? (
        <ButtonOnlyAction data={o} actions={[
          { label: "Enviar comprovativo", icon: "Upload", onClick: (x) => { setOrder(x); setFile(null); openModal("sub-proof"); } },
          { label: "Cancelar ordem", icon: "X", variant: "destructive", onClick: (x) => { setOrder(x); openModal("sub-cancel-order"); } },
        ]} />
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Subscrição" suTitle="Plano da escola, quotas e pagamento por comprovativo (análise manual pela equipa).">
        <Button asChild size="sm" className="gap-2"><Link href="/plans"><Icon name="Wallet" className="size-4" />Ver planos</Link></Button>
      </TitleList>

      {sub && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
          <DynamicMetricCard title={sub.plan.name} subtitle="Plano atual" icon="Crown" description={sub.message} />
          <DynamicMetricCard title={STATUS_LABEL[sub.status] ?? sub.status} subtitle="Estado" icon="CircleDot" colors={["suspended", "expired", "cancelled", "past_due"].includes(sub.status) ? "destructive" : "default"} description={sub.pending_plan ? `Mudança para ${sub.pending_plan.name} em ${sub.pending_plan.effective_at}` : undefined} />
          <DynamicMetricCard title={sub.trial_ends_at ? formatIsoDay(sub.trial_ends_at) : formatIsoDay(sub.period_end)} subtitle={sub.trial_ends_at ? "Teste até" : "Pago até"} icon="CalendarClock" description={sub.cancel_at_period_end ? "Cancelamento agendado" : undefined} />
          <DynamicMetricCard title={current?.addons.length ?? 0} subtitle="Add-ons ativos" icon="Puzzle" description={current?.addons.map((a) => a.name).join(", ") || "Nenhum"} />
        </div>
      )}

      <StatusLegend
        title="O que acontece se o pagamento atrasar"
        items={[
          { label: "Pagamento em atraso", description: "Até 3 dias depois do fim do período pago. Tudo continua a funcionar." },
          { label: "Em tolerância", description: "Do 4.º ao 7.º dia. Pode consultar, editar e exportar, mas não criar registos novos (alunos, matrículas…)." },
          { label: "Suspensa", description: "Até 30 dias depois do fim do período. Só consulta e exportação; nada se cria nem se edita. Os dados mantêm-se." },
          { label: "Expirada / Cancelada", description: "Mesmo regime da suspensão. Ao regularizar a subscrição a escola volta a funcionar por inteiro." },
        ]}
      />

      {quotas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Consumo das quotas</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotas.map((q) => {
              const pct = Math.min(100, Math.round((q.used / (q.limit ?? 1)) * 100));
              return (
                <div key={q.key} className="space-y-2 rounded-xs border p-4">
                  <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1 font-medium">{QUOTA_NAME[q.key] ?? q.unit}<HelpHint term="quota" /></span><span className={q.state !== "OK" ? "text-amber-700" : "text-muted-foreground"}>{fmtQuotaValue(q.key, q.used)} / {q.limit === null ? "sem limite" : fmtQuotaValue(q.key, q.limit)}</span></div>
                  <Progress value={pct} />
                  {QUOTA_NOTE[q.key] && <p className="text-[11px] text-muted-foreground">{QUOTA_NOTE[q.key]}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Ordens e comprovativos</h3>
          {sub && !sub.cancel_at_period_end && sub.status === "active" && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setReason(""); openModal("sub-cancel"); }}>Cancelar subscrição</Button>}
        </div>
        <DataList<ApiOrder>
          prefix="ordens"
          rows={orders}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Pesquisar por plano"
          searchText={(o) => `${o.plan.name} ${o.addon_codes.join(" ")}`}
          filters={[
            { key: "estado", label: "Estado", icon: "Tag", options: Object.entries(ORDER_LABEL).map(([value, label]) => ({ value, label })), match: (o, v) => o.status === v },
            { key: "periodo", label: "Período", icon: "CalendarRange", options: [{ value: "1", label: "Mensal" }, { value: "3", label: "Trimestral" }, { value: "6", label: "Semestral" }, { value: "12", label: "Anual" }], match: (o, v) => String(o.period_months) === v },
            { key: "plano", label: "Plano", icon: "Crown", options: (catalog?.plans ?? []).map((p) => ({ value: p.code, label: p.name })), match: (o, v) => o.plan.code === v },
          ]}
          dateFilters={[{ key: "data", label: "Criada", getDate: (o) => o.created_at }]}
          sorts={[{ value: "data", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }, { value: "total", label: "Total", compare: (a, b) => Number(a.total_amount) - Number(b.total_amount) }]}
          emptyTitle="Ainda não há ordens"
          emptyDescription="Escolha um plano para criar a primeira ordem."
          emptyIcon="Receipt"
        />
      </div>

      <FormModal id="sub-proof" title="Enviar comprovativo" description={`${catalog?.payment_instructions ?? ""}`.trim() || "O comprovativo (PDF ou PNG, até 10 MB) é analisado pela equipa; o plano só é ativado após a aprovação."} submitLabel="Enviar" isLoading={submitProof.isPending} disabled={!file} onSubmit={() => (order && file ? submitProof.mutateAsync({ orderId: order.id, file }).then(() => SucessMessage("Comprovativo enviado para análise.")).catch(fail) : undefined)}>
        <FileUpload value={file} onChange={setFile} accept={PROOF_ACCEPT_PDF_PNG} label="Ficheiro do comprovativo (PDF ou PNG) *" />
      </FormModal>

      <ConfirmModal id="sub-cancel-order" destructive title="Cancelar ordem" description="A ordem deixa de ser analisada. Pode criar outra quando quiser." confirmLabel="Cancelar ordem" isLoading={cancelOrder.isPending} onConfirm={() => (order ? cancelOrder.mutateAsync(order.id).then(() => SucessMessage("Ordem cancelada.")).catch(fail) : undefined)} />

      <FormModal id="sub-cancel" title="Cancelar subscrição" description="Mantém-se ativa até ao fim do período pago. Indique o motivo (mínimo 5 caracteres)." submitLabel="Agendar cancelamento" isLoading={cancelSubscription.isPending} disabled={reason.trim().length < 5} onSubmit={() => cancelSubscription.mutateAsync(reason.trim()).then(() => SucessMessage("Cancelamento agendado para o fim do período.")).catch(fail)}>
        <div className="sm:col-span-2"><Input label="Motivo *" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      </FormModal>
    </div>
  );
}
