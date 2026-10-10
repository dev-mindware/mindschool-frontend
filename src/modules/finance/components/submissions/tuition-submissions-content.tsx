"use client";

import { useMemo, useState } from "react";
import { ButtonOnlyAction, DataList, DynamicMetricCard, TitleList, type Column } from "@/components";
import { useTuitionSubmissions } from "@/modules/finance/hooks/use-tuition-payments";
import type { ApiSubmission } from "@/modules/finance/services/tuition-payments-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { formatCurrency } from "@/utils/format-currency";
import { METHOD_LABEL, OPEN_SUBMISSION, SUBMISSION_STATUS, SubmissionBadge } from "./submission-status";
import { SUBMISSION_REVIEW_MODAL, SubmissionReviewModal } from "./submission-review-modal";

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));

/** Fila de comprovativos enviados pelas famílias: validar → o pagamento é registado e o encarregado recebe a confirmação por email. */
export function TuitionSubmissionsContent() {
  const { submissions, summary, isLoading, isError, refetch } = useTuitionSubmissions();
  const { openModal } = useModal();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => submissions.find((s) => s.id === selectedId) ?? null, [submissions, selectedId]);
  const open = (s: ApiSubmission) => { setSelectedId(s.id); openModal(SUBMISSION_REVIEW_MODAL); };

  const rejected = summary?.by_status["rejeitado"]?.count ?? 0;
  const approved = summary?.by_status["aprovado"]?.count ?? 0;

  const columns: Column<ApiSubmission>[] = [
    { key: "protocol", header: "Protocolo", render: (_, s) => (<div><span className="font-mono text-xs font-semibold text-primary">{s.protocol}</span><div className="text-[11px] text-muted-foreground">{s.created_at.slice(0, 10)}{s.waiting_hours !== null && ` · há ${s.waiting_hours} h`}</div></div>) },
    { key: "student", header: "Aluno", render: (_, s) => (<div><span className="font-medium">{s.student.full_name}</span><div className="text-[11px] text-muted-foreground">por {s.submitted_by.full_name}</div></div>) },
    { key: "items", header: "Facturas", render: (_, s) => <span className="text-xs">{s.items.length === 1 ? s.items[0]!.description : `${s.items.length} facturas`}</span> },
    { key: "total_amount", header: "Valor", render: (_, s) => <span className="font-semibold tabular-nums">{formatCurrency(Number(s.total_amount))}</span> },
    { key: "method", header: "Método", render: (_, s) => <span className="text-xs">{METHOD_LABEL[s.method]}</span> },
    { key: "paid_on", header: "Pago em", render: (_, s) => <span className="text-xs">{s.paid_on}</span> },
    { key: "status", header: "Estado", render: (_, s) => <SubmissionBadge status={s.status} /> },
    {
      key: "actions", header: "Acção",
      render: (_, s) => <ButtonOnlyAction data={s} actions={[{ label: OPEN_SUBMISSION.includes(s.status) ? "Analisar comprovativo" : "Ver detalhes", icon: "Eye", onClick: open }]} />,
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Comprovativos de Pagamento" suTitle="Pagamentos enviados pelos encarregados e alunos: confira no extracto bancário e valide." />

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={summary?.open ?? 0} subtitle="Por validar" icon="FileCheck" colors={(summary?.open ?? 0) > 0 ? "destructive" : "default"} description="Submetidos, em análise ou a aguardar novo ficheiro" />
        <DynamicMetricCard title={summary?.oldest_open_hours != null ? `${summary.oldest_open_hours} h` : "—"} subtitle="Mais antigo em espera" icon="Hourglass" description="Responda em 1 dia útil" />
        <DynamicMetricCard title={formatCurrency(Number(summary?.approved_30d.amount ?? 0))} subtitle="Confirmado em 30 dias" icon="Coins" description={`${summary?.approved_30d.count ?? 0} pagamentos validados`} />
        <DynamicMetricCard title={approved + rejected > 0 ? `${Math.round((approved / (approved + rejected)) * 100)}%` : "—"} subtitle="Taxa de aprovação" icon="CircleCheck" description={`${rejected} comprovativos rejeitados`} />
      </div>

      <DataList<ApiSubmission>
        prefix="comprovativos"
        rows={submissions}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        refetch={() => void refetch()}
        pageSize={10}
        searchPlaceholder="Pesquisar por protocolo, aluno, referência ou quem enviou"
        searchText={(s) => `${s.protocol} ${s.student.full_name} ${s.submitted_by.full_name} ${s.reference ?? ""} ${s.payer_name ?? ""}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: Object.entries(SUBMISSION_STATUS).map(([value, c]) => ({ value, label: c.label })), match: (s, v) => s.status === v },
          { key: "aberto", label: "Fila", icon: "Inbox", options: [{ value: "abertos", label: "Por tratar" }, { value: "tratados", label: "Já tratados" }], match: (s, v) => (v === "abertos" ? OPEN_SUBMISSION.includes(s.status) : !OPEN_SUBMISSION.includes(s.status)) },
          { key: "metodo", label: "Método", icon: "CreditCard", options: Object.entries(METHOD_LABEL).map(([value, label]) => ({ value, label })), match: (s, v) => s.method === v },
          { key: "banco", label: "Conta de destino", icon: "Landmark", options: uniq(submissions.map((s) => s.bank_account?.bank_name ?? "")).map((v) => ({ value: v, label: v })), match: (s, v) => s.bank_account?.bank_name === v },
          { key: "valor", label: "Valor", icon: "Coins", options: [{ value: "baixo", label: "Até 50 000 Kz" }, { value: "medio", label: "50 000 – 150 000 Kz" }, { value: "alto", label: "Acima de 150 000 Kz" }], match: (s, v) => { const a = Number(s.total_amount); return v === "baixo" ? a <= 50_000 : v === "medio" ? a > 50_000 && a <= 150_000 : a > 150_000; } },
          { key: "espera", label: "Espera", icon: "Clock", options: [{ value: "24", label: "Mais de 24 h" }, { value: "48", label: "Mais de 48 h" }], match: (s, v) => (s.waiting_hours ?? 0) > Number(v) },
        ]}
        dateFilters={[{ key: "enviado", label: "Envio", getDate: (s) => s.created_at }, { key: "pago", label: "Pagamento", getDate: (s) => s.paid_on }]}
        sorts={[
          { value: "data", label: "Data de envio", compare: (a, b) => a.created_at.localeCompare(b.created_at) },
          { value: "valor", label: "Valor", compare: (a, b) => Number(a.total_amount) - Number(b.total_amount) },
          { value: "aluno", label: "Aluno", compare: (a, b) => a.student.full_name.localeCompare(b.student.full_name, "pt") },
        ]}
        emptyTitle="Sem comprovativos"
        emptyDescription="Quando uma família submeter um comprovativo no portal, aparece aqui."
        emptyIcon="FileCheck"
      />

      <SubmissionReviewModal submission={selected} />
    </div>
  );
}
