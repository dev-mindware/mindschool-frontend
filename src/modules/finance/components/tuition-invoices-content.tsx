"use client";
import { financeKeys } from "@/modules/finance/query-keys";

import { useQuery } from "@tanstack/react-query";
import { Badge, StatusBadge, StatusLegend, DataList, DynamicMetricCard, Icon, TitleList, type Column } from "@/components";
import { tuitionService, type ApiInvoice } from "@/modules/finance/services/tuition-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { formatCurrency } from "@/utils/format-currency";

const STATUS: Record<ApiInvoice["status"], { label: string; variant: "success" | "warning" | "destructive" | "info" | "secondary" }> = {
  paga: { label: "Paga", variant: "success" },
  parcialmente_paga: { label: "Parcialmente paga", variant: "warning" },
  emitida: { label: "Por pagar", variant: "info" },
  vencida: { label: "Vencida", variant: "destructive" },
  anulada: { label: "Anulada", variant: "secondary" },
};
const TYPE: Record<ApiInvoice["type"], string> = { propina_mensal: "Propina", matricula: "Matrícula", servico_extra: "Serviço", multa: "Multa de mora" };
const FISCAL: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  certificada: { label: "Certificada", variant: "success" },
  pendente_fiscal: { label: "A aguardar MindGest", variant: "warning" },
  erro: { label: "Erro fiscal", variant: "destructive" },
  sem_submissao: { label: "Sem submissão", variant: "secondary" },
};

/** Facturas da escola em modo de leitura: a facturação é tratada no MindGest (ligação futura); aqui só se acompanha o estado. */
export function TuitionInvoicesContent() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: financeKeys.invoices(schoolId), queryFn: tuitionService.invoices, enabled: Boolean(schoolId), staleTime: 30 * 1000, retry: false });
  const live = data.filter((i) => i.status !== "anulada");
  const pendingFiscal = live.filter((i) => i.fiscal.status !== "certificada").length;

  const columns: Column<ApiInvoice>[] = [
    { key: "student", header: "Aluno", render: (_, i) => (<div><span className="font-medium">{i.student.full_name}</span><div className="font-mono text-[11px] text-muted-foreground">Ref. {i.payment_reference}</div></div>) },
    { key: "type", header: "Tipo", render: (_, i) => <span className="text-xs">{TYPE[i.type]}</span> },
    { key: "due_date", header: "Vencimento", render: (_, i) => <span className="text-xs">{i.due_date}</span> },
    { key: "total_due", header: "Total", render: (_, i) => <span className="tabular-nums">{formatCurrency(Number(i.total_due))}</span> },
    { key: "balance", header: "Em dívida", render: (_, i) => <span className={`font-semibold tabular-nums ${i.is_overdue ? "text-destructive" : ""}`}>{formatCurrency(Number(i.balance))}</span> },
    { key: "status", header: "Estado", render: (_, i) => <StatusBadge status={i.status} map={STATUS} /> },
    { key: "fiscal", header: "Fiscal", render: (_, i) => (<div><Badge variant={(FISCAL[i.fiscal.status] ?? FISCAL["sem_submissao"]!).variant} className="font-normal">{(FISCAL[i.fiscal.status] ?? FISCAL["sem_submissao"]!).label}</Badge>{i.fiscal.certificate_number && <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{i.fiscal.certificate_number}</div>}</div>) },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Facturas" suTitle="Acompanhamento das facturas das propinas e taxas. A emissão e a certificação fiscal são feitas no MindGest." />

      <div className="flex gap-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
        <Icon name="Link" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>A facturação da escola é tratada no <strong>MindGest</strong>. Quando a ligação estiver activa, as facturas passam a ser certificadas automaticamente e o estado fiscal aparece aqui.</p>
      </div>

      <StatusLegend
        title="O que significam os estados e as colunas"
        items={[
          { label: "Por pagar", description: "Emitida e dentro do prazo." },
          { label: "Parcialmente paga", description: "Já recebeu pagamentos, mas ainda falta valor. «Total» é o valor da factura (menos desconto, mais multa na própria factura); «Em dívida» é o que falta pagar." },
          { label: "Vencida", description: "Passou o vencimento com valor em dívida. Passado o prazo de tolerância, o sistema cria a multa de mora como uma factura à parte (tipo «Multa de mora»), ligada a esta." },
          { label: "Paga", description: "Totalmente liquidada. O comprovativo de pagamento é um documento interno, sem valor fiscal." },
          { label: "Anulada", description: "Anulada (por exemplo, ao anular a matrícula). Nunca se apaga: fica no histórico. Não se anula a partir desta lista." },
          { label: "Ref. MS…", description: "Referência de pagamento da factura: é o código que o encarregado indica ao pagar." },
          { label: "Fiscal", description: "«Certificada»: aceite pela certificação fiscal e com n.º fiscal. «A aguardar MindGest»: enviada, à espera da certificação. «Erro fiscal»: a certificação falhou e pode ser reprocessada. «Sem submissão»: ainda não foi enviada." },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={live.length} subtitle="Facturas" icon="Receipt" description="Sem as anuladas" />
        <DynamicMetricCard title={live.filter((i) => i.status === "paga").length} subtitle="Liquidadas" icon="CircleCheck" description="Totalmente pagas" />
        <DynamicMetricCard title={live.filter((i) => i.is_overdue && i.status !== "paga").length} subtitle="Vencidas" icon="TriangleAlert" colors="destructive" description="Por cobrar" />
        <DynamicMetricCard title={pendingFiscal} subtitle="Sem certificação fiscal" icon="ShieldAlert" description="Em espera, com erro ou ainda não enviadas" />
      </div>

      <DataList<ApiInvoice>
        prefix="facturas"
        rows={data}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        refetch={() => void refetch()}
        pageSize={12}
        searchPlaceholder="Pesquisar aluno, referência ou n.º de certificado"
        searchText={(i) => `${i.student.full_name} ${i.payment_reference} ${i.fiscal.certificate_number ?? ""}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: Object.entries(STATUS).map(([value, c]) => ({ value, label: c.label })), match: (i, v) => i.status === v },
          { key: "tipo", label: "Tipo", icon: "Tag", options: Object.entries(TYPE).map(([value, label]) => ({ value, label })), match: (i, v) => i.type === v },
          { key: "fiscal", label: "Estado fiscal", icon: "ShieldCheck", options: Object.entries(FISCAL).map(([value, c]) => ({ value, label: c.label })), match: (i, v) => i.fiscal.status === v },
          { key: "vencida", label: "Vencimento", icon: "Clock", options: [{ value: "vencida", label: "Vencidas" }, { value: "emdia", label: "Em dia" }], match: (i, v) => (v === "vencida" ? i.is_overdue : !i.is_overdue) },
        ]}
        dateFilters={[{ key: "vencimento", label: "Vencimento", getDate: (i) => i.due_date }]}
        sorts={[
          { value: "vencimento", label: "Vencimento", compare: (a, b) => a.due_date.localeCompare(b.due_date) },
          { value: "valor", label: "Valor", compare: (a, b) => Number(a.total_due) - Number(b.total_due) },
          { value: "divida", label: "Em dívida", compare: (a, b) => Number(a.balance) - Number(b.balance) },
        ]}
        emptyTitle="Sem facturas"
        emptyDescription="As facturas são geradas na matrícula e mensalmente, segundo a política de propinas."
        emptyIcon="Receipt"
      />
    </div>
  );
}
