"use client";
import { formatIsoDay } from "@/utils/format-date";
import { financeKeys } from "@/modules/finance/query-keys";

import { useQuery } from "@tanstack/react-query";
import { Badge, StatusBadge, StatusLegend, DataList, DynamicMetricCard, Icon, TitleList, Tabs, TabsContent, TabsList, TabsTrigger, type Column } from "@/components";
import { FiscalDocumentsContent } from "@/modules/finance/components/fiscal-documents-content";
import { FISCAL_STATUS } from "@/modules/finance/services/settlement-service";
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

/** Cobranças da escola em modo de leitura (o que a família deve e o que já pagou); a fatura-recibo de cada pagamento está no separador «Faturas». */
function ChargesList() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: financeKeys.invoices(schoolId), queryFn: tuitionService.invoices, enabled: Boolean(schoolId), staleTime: 30 * 1000, retry: false });
  const live = data.filter((i) => i.status !== "anulada");
  const pendingFiscal = live.filter((i) => i.status === "paga" && i.fiscal.status !== "certificada").length;

  const columns: Column<ApiInvoice>[] = [
    { key: "student", header: "Aluno", render: (_, i) => (<div><span className="font-medium">{i.student.full_name}</span><div className="font-mono text-[11px] text-muted-foreground">Ref. {i.payment_reference}</div></div>) },
    { key: "type", header: "Tipo", render: (_, i) => <span className="text-xs">{TYPE[i.type]}</span> },
    { key: "due_date", header: "Vencimento", render: (_, i) => <span className="text-xs">{formatIsoDay(i.due_date)}</span> },
    { key: "total_due", header: "Total", render: (_, i) => <span className="tabular-nums">{formatCurrency(Number(i.total_due))}</span> },
    { key: "balance", header: "Em dívida", render: (_, i) => <span className={`font-semibold tabular-nums ${i.is_overdue ? "text-destructive" : ""}`}>{formatCurrency(Number(i.balance))}</span> },
    { key: "status", header: "Estado", render: (_, i) => <StatusBadge status={i.status} map={STATUS} /> },
    { key: "fiscal", header: "Fiscal", render: (_, i) => (<div><Badge variant={(FISCAL_STATUS[i.fiscal.status as keyof typeof FISCAL_STATUS] ?? FISCAL_STATUS.sem_submissao).variant} className="font-normal">{(FISCAL_STATUS[i.fiscal.status as keyof typeof FISCAL_STATUS] ?? FISCAL_STATUS.sem_submissao).label}</Badge>{i.fiscal.certificate_number && <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{i.fiscal.certificate_number}</div>}{i.fiscal.corrected && (<div className="mt-1 max-w-52 text-[11px] text-amber-700" title="A cobrança não muda sozinha: reveja-a se for preciso.">{i.fiscal.correction_notice ?? "Fatura corrigida/anulada no MindGest"}{i.fiscal.credit_notes?.[0]?.number ? ` (NC ${i.fiscal.credit_notes[0].number})` : ""}</div>)}</div>) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
        <Icon name="Link" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>Uma <strong>cobrança</strong> não é um documento fiscal: a <strong>fatura-recibo</strong> é emitida no <strong>MindGest</strong> quando a cobrança é paga («Marcar como pago» em Propinas). A coluna «Fiscal» mostra o estado dessa fatura; o detalhe está no separador «Faturas».</p>
      </div>

      <StatusLegend
        title="O que significam os estados e as colunas"
        items={[
          { label: "Por pagar", description: "Emitida e dentro do prazo." },
          { label: "Parcialmente paga", description: "Já recebeu pagamentos, mas ainda falta valor. «Total» é o valor da fatura (menos desconto, mais multa na própria fatura); «Em dívida» é o que falta pagar." },
          { label: "Vencida", description: "Passou o vencimento com valor em dívida. Passado o prazo de tolerância, o sistema cria a multa de mora como uma fatura à parte (tipo «Multa de mora»), ligada a esta." },
          { label: "Paga", description: "Totalmente liquidada. O comprovativo de pagamento é um documento interno, sem valor fiscal; o documento fiscal é a fatura-recibo emitida no MindGest (separador «Faturas»)." },
          { label: "Anulada", description: "Anulada (por exemplo, ao anular a matrícula). Nunca se apaga: fica no histórico. Não se anula a partir desta lista." },
          { label: "Ref. MS…", description: "Referência de pagamento da fatura: é o código que o encarregado indica ao pagar." },
          { label: "Fiscal", description: "Estado da fatura-recibo do pagamento: «Certificada» (com n.º fiscal), «A aguardar MindGest», «Escola não ligada» ou «Falta o imposto» (esperam e seguem sozinhas), «Rejeitada» ou «Erro». «Sem fatura»: a cobrança ainda não foi paga." },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={live.length} subtitle="Faturas" icon="Receipt" description="Sem as anuladas" />
        <DynamicMetricCard title={live.filter((i) => i.status === "paga").length} subtitle="Liquidadas" icon="CircleCheck" description="Totalmente pagas" />
        <DynamicMetricCard title={live.filter((i) => i.is_overdue && i.status !== "paga").length} subtitle="Vencidas" icon="TriangleAlert" colors="destructive" description="Por cobrar" />
        <DynamicMetricCard title={pendingFiscal} subtitle="Pagas sem fatura certificada" icon="ShieldAlert" description="Fatura-recibo em espera, em curso ou com erro" />
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
          { key: "fiscal", label: "Estado fiscal", icon: "ShieldCheck", options: Object.entries(FISCAL_STATUS).map(([value, c]) => ({ value, label: c.label })), match: (i, v) => i.fiscal.status === v },
          { key: "vencida", label: "Vencimento", icon: "Clock", options: [{ value: "vencida", label: "Vencidas" }, { value: "emdia", label: "Em dia" }], match: (i, v) => (v === "vencida" ? i.is_overdue : !i.is_overdue) },
        ]}
        dateFilters={[{ key: "vencimento", label: "Vencimento", getDate: (i) => i.due_date }]}
        sorts={[
          { value: "vencimento", label: "Vencimento", compare: (a, b) => a.due_date.localeCompare(b.due_date) },
          { value: "valor", label: "Valor", compare: (a, b) => Number(a.total_due) - Number(b.total_due) },
          { value: "divida", label: "Em dívida", compare: (a, b) => Number(a.balance) - Number(b.balance) },
        ]}
        emptyTitle="Sem faturas"
        emptyDescription="As faturas são geradas na matrícula e mensalmente, segundo a política de propinas."
        emptyIcon="Receipt"
      />
    </div>
  );
}

/** Página «Faturas»: as faturas-recibo fiscais (MindGest) e, ao lado, as cobranças que lhes dão origem. */
export function TuitionInvoicesContent() {
  return (
    <div className="space-y-6">
      <TitleList title="Faturas" suTitle="Faturas-recibo emitidas no MindGest ao marcar as propinas como pagas, e as cobranças da escola. Estornos e notas de crédito fazem-se só no MindGest." />
      <Tabs defaultValue="facturas" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="facturas" className="text-xs">Faturas</TabsTrigger>
          <TabsTrigger value="cobrancas" className="text-xs">Cobranças</TabsTrigger>
        </TabsList>
        <TabsContent value="facturas"><FiscalDocumentsContent /></TabsContent>
        <TabsContent value="cobrancas"><ChargesList /></TabsContent>
      </Tabs>
    </div>
  );
}
