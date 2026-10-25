"use client";
import { familyKeys } from "@/modules/family/query-keys";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorMessage } from "@/utils/messages";
import { Badge, ButtonOnlyAction, DataList, DynamicMetricCard, EmptyState, FormSelect, SimpleTable, Tabs, TabsContent, TabsList, TabsTrigger, type Column } from "@/components";
import { PortalPayments } from "@/modules/family/components/portal-payments";
import { METHOD_LABEL } from "@/modules/finance/components/submissions/submission-status";
import { usePortal } from "@/modules/family/hooks/use-portal";
import { portalService, type PortalInvoice, type PortalPayment } from "@/modules/family/services/portal-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";
import type { FamilyContext } from "./family-shell";

const TYPE: Record<string, string> = { propina_mensal: "Propina", matricula: "Matrícula", servico_extra: "Serviço / documento", multa: "Multa de mora" };
const INVOICE_STATUS: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" | "secondary" }> = {
  paga: { label: "Paga", variant: "success" }, parcialmente_paga: { label: "Parcialmente paga", variant: "warning" }, emitida: { label: "Por pagar", variant: "info" }, vencida: { label: "Vencida", variant: "destructive" },
};
const month = (iso: string) => new Date(`${iso}-01T00:00:00Z`).toLocaleDateString("pt-AO", { month: "long", timeZone: "UTC" });
const openPdf = (p: Promise<Blob>) => p.then((b) => { window.open(URL.createObjectURL(b), "_blank"); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível abrir o recibo.")));

/** Financeiro da família: por pagar (com comprovativo), pagamentos e recibos, facturas e extracto anual. */
export function FamilyFinance({ studentId, ward }: FamilyContext) {
  const live = usePortal(studentId, ["invoices", "payments"]);
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(String(thisYear));
  const statement = useQuery({ queryKey: familyKeys.statement(studentId, year), queryFn: () => portalService.statement(studentId, Number(year)), enabled: Boolean(studentId), retry: false });

  if (live.invoicesForbidden) return <EmptyState icon="Lock" title="Sem autorização" description="Não tem autorização para consultar o financeiro deste educando." />;

  const paymentColumns: Column<PortalPayment>[] = [
    { key: "paid_at", header: "Data", render: (_, p) => <span className="font-mono text-xs">{p.paid_at.slice(0, 10)}</span> },
    { key: "invoice_type", header: "Referente a", render: (_, p) => (<div><span className="font-medium">{TYPE[p.invoice_type] ?? p.invoice_type}</span><p className="text-xs text-muted-foreground">Vencimento {p.invoice_due_date}</p></div>) },
    { key: "amount", header: "Valor", render: (_, p) => <span className="font-semibold tabular-nums">{formatCurrency(p.amount)}</span> },
    { key: "method", header: "Método", render: (_, p) => <span className="text-xs">{METHOD_LABEL[p.method as keyof typeof METHOD_LABEL] ?? p.method.replaceAll("_", " ")}</span> },
    { key: "reference", header: "Referência", render: (_, p) => <span className="font-mono text-[11px] text-muted-foreground">{p.reference ?? "—"}</span> },
    { key: "actions", header: "Comprovativo", render: (_, p) => <ButtonOnlyAction data={p} actions={[{ label: "Descarregar comprovativo interno (sem valor fiscal)", icon: "FileDown", onClick: (x) => void openPdf(portalService.receiptPdf(studentId, x.id)) }]} /> },
  ];

  const invoiceColumns: Column<PortalInvoice>[] = [
    { key: "due_date", header: "Vencimento", render: (_, i) => <span className="font-mono text-xs">{i.due_date}</span> },
    { key: "type", header: "Tipo", render: (_, i) => TYPE[i.type] ?? i.type },
    { key: "total_due", header: "Total", render: (_, i) => formatCurrency(i.total_due) },
    { key: "paid_amount", header: "Pago", render: (_, i) => formatCurrency(i.paid_amount) },
    { key: "balance", header: "Em dívida", render: (_, i) => <span className={`font-semibold ${i.is_overdue ? "text-destructive" : ""}`}>{formatCurrency(i.balance)}</span> },
    {
      key: "status", header: "Estado",
      render: (_, i) => { const s = INVOICE_STATUS[i.is_overdue && i.status !== "paga" ? "vencida" : i.status] ?? { label: i.status, variant: "secondary" as const }; return <Badge variant={s.variant} className="font-normal">{s.label}</Badge>; },
    },
  ];

  const settled = live.invoices.filter((i) => i.status === "paga");
  const st = statement.data;

  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList className="flex h-auto flex-wrap">
        <TabsTrigger value="pending" className="text-xs">Por pagar</TabsTrigger>
        <TabsTrigger value="payments" className="text-xs">Pagamentos e comprovativos</TabsTrigger>
        <TabsTrigger value="invoices" className="text-xs">Faturas</TabsTrigger>
        <TabsTrigger value="statement" className="text-xs">Extracto anual</TabsTrigger>
      </TabsList>

      <TabsContent value="pending"><PortalPayments studentId={studentId} studentName={ward.student.full_name} /></TabsContent>

      <TabsContent value="payments" className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
          <DynamicMetricCard title={live.payments.length} subtitle="Pagamentos" icon="Receipt" description="Registados na escola" />
          <DynamicMetricCard title={formatCurrency(live.payments.reduce((a, p) => a + Number(p.amount), 0))} subtitle="Total pago" icon="Wallet" description="Soma de todos os pagamentos" />
          <DynamicMetricCard title={settled.length} subtitle="Faturas liquidadas" icon="CircleCheck" description="Totalmente pagas" />
          <DynamicMetricCard title={live.payments[0] ? live.payments[0].paid_at.slice(0, 10) : "—"} subtitle="Último pagamento" icon="CalendarCheck" description={live.payments[0] ? formatCurrency(live.payments[0].amount) : "Sem pagamentos"} />
        </div>
        <DataList<PortalPayment>
          prefix="pagamentos" rows={live.payments} columns={paymentColumns} isLoading={live.paymentsLoading} pageSize={10}
          searchPlaceholder="Pesquisar referência" searchText={(p) => `${p.reference ?? ""} ${TYPE[p.invoice_type] ?? p.invoice_type}`}
          filters={[
            { key: "tipo", label: "Tipo", icon: "Tag", options: Object.entries(TYPE).map(([value, label]) => ({ value, label })), match: (p, v) => p.invoice_type === v },
            { key: "metodo", label: "Método", icon: "CreditCard", options: [...new Set(live.payments.map((p) => p.method))].map((value) => ({ value, label: METHOD_LABEL[value as keyof typeof METHOD_LABEL] ?? value.replaceAll("_", " ") })), match: (p, v) => p.method === v },
          ]}
          dateFilters={[{ key: "pago", label: "Data de pagamento", getDate: (p) => p.paid_at }]}
          sorts={[{ value: "data", label: "Data", compare: (a, b) => a.paid_at.localeCompare(b.paid_at) }, { value: "valor", label: "Valor", compare: (a, b) => Number(a.amount) - Number(b.amount) }]}
          emptyTitle="Sem pagamentos" emptyDescription="Os pagamentos confirmados pela escola aparecem aqui, com o comprovativo interno de pagamento. Esse comprovativo não tem valor fiscal: a fatura-recibo (documento fiscal) é emitida pela escola; se precisar dela, peça à secretaria." emptyIcon="Receipt"
        />
      </TabsContent>

      <TabsContent value="invoices">
        <DataList<PortalInvoice>
          prefix="facturas" rows={live.invoices} columns={invoiceColumns} pageSize={10}
          searchPlaceholder="Pesquisar fatura" searchText={(i) => `${TYPE[i.type] ?? i.type} ${i.status} ${i.due_date}`}
          filters={[
            { key: "estado", label: "Estado", icon: "ListFilter", options: [{ value: "paga", label: "Liquidadas" }, { value: "aberta", label: "Por pagar" }], match: (i, v) => (v === "paga" ? i.status === "paga" : i.status !== "paga") },
            { key: "vencida", label: "Vencimento", icon: "Clock", options: [{ value: "vencida", label: "Vencidas" }, { value: "emdia", label: "Em dia" }], match: (i, v) => (v === "vencida" ? i.is_overdue : !i.is_overdue) },
            { key: "tipo", label: "Tipo", icon: "Tag", options: Object.entries(TYPE).map(([value, label]) => ({ value, label })), match: (i, v) => i.type === v },
          ]}
          dateFilters={[{ key: "vencimento", label: "Vencimento", getDate: (i) => i.due_date }]}
          sorts={[{ value: "vencimento", label: "Vencimento", compare: (a, b) => a.due_date.localeCompare(b.due_date) }, { value: "divida", label: "Em dívida", compare: (a, b) => Number(a.balance) - Number(b.balance) }]}
          emptyTitle="Sem faturas" emptyDescription="Não há faturas para este educando." emptyIcon="Wallet"
        />
      </TabsContent>

      <TabsContent value="statement" className="space-y-4">
        <div className="w-40"><FormSelect label="Ano" value={year} onValueChange={setYear} options={[thisYear, thisYear - 1, thisYear - 2].map((y) => ({ value: String(y), label: String(y) }))} /></div>
        {!st ? <p className="text-sm text-muted-foreground">{statement.isLoading ? "A carregar…" : "Sem dados para este ano."}</p> : (
          <>
            <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
              <DynamicMetricCard title={formatCurrency(st.billed)} subtitle="Faturado" icon="FileText" description={`${st.invoices} facturas em ${st.year}`} />
              <DynamicMetricCard title={formatCurrency(st.paid)} subtitle="Pago" icon="CircleCheck" description="Recebido pela escola" />
              <DynamicMetricCard title={formatCurrency(st.outstanding)} subtitle="Em dívida" icon="TriangleAlert" colors={Number(st.outstanding) > 0 ? "destructive" : "default"} description="Por liquidar" />
              <DynamicMetricCard title={formatCurrency(st.late_fees)} subtitle="Multas de mora" icon="Clock" description="Incluídas no faturado" />
            </div>
            {st.months.length === 0 ? <EmptyState icon="FileText" title="Sem movimentos" description={`Não há faturas com vencimento em ${st.year}.`} /> : (
              <SimpleTable
                rows={st.months}
                rowKey={(m) => m.month}
                columns={[
                  { header: "Mês", className: "capitalize", render: (m) => month(m.month) },
                  { header: "Faturado", align: "right", className: "tabular-nums", render: (m) => formatCurrency(m.billed) },
                  { header: "Pago", align: "right", className: "tabular-nums", render: (m) => formatCurrency(m.paid) },
                  { header: "Em dívida", align: "right", className: "font-semibold tabular-nums", render: (m) => <span className={Number(m.outstanding) > 0 ? "text-destructive" : ""}>{formatCurrency(m.outstanding)}</span> },
                ]}
              />
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
