"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, DataList, DynamicMetricCard, FeatureGate, Icon, StatusLegend, type Column } from "@/components";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { financeKeys } from "@/modules/finance/query-keys";
import { FISCAL_STATUS, settlementService, type ApiFiscalDocumentRow, type FiscalDocumentStatus } from "@/modules/finance/services/settlement-service";

const TYPE: Record<string, string> = { propina_mensal: "Propina", matricula: "Matrícula", servico_extra: "Serviço", multa: "Multa de mora" };
const METHOD: Record<string, string> = { multicaixa_express: "Multicaixa Express", transferencia_bancaria: "Transferência", numerario: "Numerário", emis_gpo: "TPA" };
/** AAAA-MM-DD -> DD/MM/AAAA. */
const formatDate = (iso: string): string => iso.split("-").reverse().join("/");
const STATES = Object.keys(FISCAL_STATUS).filter((s) => s !== "sem_submissao") as FiscalDocumentStatus[];

/**
 * Facturas-recibo emitidas no MindGest, uma por liquidação. Só leitura: estornos e notas de crédito fazem-se no MindGest
 * (as que existirem aparecem ligadas à factura de origem). O PDF vem por intermédio da API.
 */
export function FiscalDocumentsContent() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: financeKeys.documents(schoolId),
    queryFn: settlementService.documents,
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
    retry: false,
  });

  const reprocess = useMutation({
    mutationFn: (id: string) => settlementService.reprocess(id),
    onSuccess: (d) => {
      SucessMessage(d.status === "pendente_fiscal" ? "Reenviada ao MindGest." : "Continua em espera: veja o motivo na lista.");
      void queryClient.invalidateQueries({ queryKey: financeKeys.documents(schoolId) });
    },
    onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível reprocessar.")),
    onSettled: () => setBusy(null),
  });

  async function openPdf(id: string) {
    setBusy(id);
    try {
      window.open(URL.createObjectURL(await settlementService.pdfBlob(id)), "_blank");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível abrir o PDF."));
    } finally {
      setBusy(null);
    }
  }

  const count = (s: FiscalDocumentStatus[]) => data.filter((d) => s.includes(d.status)).length;

  const columns: Column<ApiFiscalDocumentRow>[] = [
    {
      key: "number", header: "Factura-recibo",
      render: (_, d) => (
        <div>
          <span className="font-mono text-xs font-semibold">{d.number ?? "—"}</span>
          <div className="text-[11px] text-muted-foreground">{d.series ? `Série ${d.series}` : "Sem número ainda"}</div>
        </div>
      ),
    },
    {
      key: "student", header: "Aluno",
      render: (_, d) => (
        <div>
          <span className="text-xs font-medium">{d.student?.full_name ?? "—"}</span>
          <div className="text-[11px] text-muted-foreground">Cliente: {d.customer ? `${d.customer.name}${d.customer.nif ? ` · NIF ${d.customer.nif}` : " · consumidor final"}` : "—"}</div>
        </div>
      ),
    },
    {
      key: "invoices", header: "Cobranças pagas",
      render: (_, d) => (
        <ul className="space-y-0.5 text-[11px] text-muted-foreground">
          {d.invoices.map((i) => (
            <li key={i.id}>{i.description ?? TYPE[i.type] ?? i.type} · {i.due_date} · {formatCurrency(Number(i.amount))}</li>
          ))}
          {d.method && <li className="text-foreground/70">{METHOD[d.method] ?? d.method}{d.paid_at ? ` · ${d.paid_at.slice(0, 10)}` : ""}</li>}
        </ul>
      ),
    },
    { key: "total", header: "Total", render: (_, d) => <span className="font-semibold tabular-nums text-xs">{formatCurrency(Number(d.total))}</span> },
    {
      key: "status", header: "Estado",
      render: (_, d) => {
        const st = FISCAL_STATUS[d.status];
        return (
          <div className="max-w-64 space-y-1">
            <Badge variant={st.variant} className="font-normal" title={st.hint}>{st.label}</Badge>
            {d.error && <p className="text-[11px] text-destructive">{d.error.message}</p>}
            {(d.status === "sem_ligacao" || d.status === "sem_catalogo" || d.status === "pausada") && <p className="text-[11px] text-muted-foreground">{st.hint}</p>}
            {d.corrected && <p className="text-[11px] font-medium text-amber-700">{d.correction_notice ?? "Factura corrigida/anulada no MindGest"}: a cobrança não mudou, reveja-a se for preciso.</p>}
            {d.status === "pendente_fiscal" && d.attempts > 1 && <p className="text-[11px] text-muted-foreground">{d.attempts} tentativas; a repetir sozinha.</p>}
            {d.legal_deadline && d.status !== "certificada" && (
              <p className={`flex items-center gap-1 text-[11px] ${d.deadline_passed ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                <Icon name={d.deadline_passed ? "TriangleAlert" : "Clock"} className="size-3" />
                {d.deadline_passed ? `Prazo legal ultrapassado (${formatDate(d.legal_deadline)})` : `Emitir até ${formatDate(d.legal_deadline)} (prazo legal)`}
              </p>
            )}
            {d.status === "certificada" && d.deadline_passed && d.legal_deadline && (
              <p className="text-[11px] text-amber-700">Emitida depois do prazo legal ({formatDate(d.legal_deadline)}).</p>
            )}
            {d.credit_notes.map((n) => (
              <p key={n.id} className="flex items-center gap-1 text-[11px] text-amber-700">
                <Icon name="TriangleAlert" className="size-3" /> Corrigida/anulada no MindGest: nota de crédito {n.number ?? ""}
              </p>
            ))}
          </div>
        );
      },
    },
    {
      key: "actions", header: "Acções", className: "text-right",
      render: (_, d) => (
        <div className="flex items-center justify-end gap-1.5">
          {d.pdf_available && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" disabled={busy === d.id} onClick={() => void openPdf(d.id)}>
              <Icon name={busy === d.id ? "Loader2" : "FileText"} className={busy === d.id ? "size-3.5 animate-spin" : "size-3.5"} /> PDF
            </Button>
          )}
          {(d.status === "erro" || d.status === "sem_ligacao" || d.status === "sem_catalogo" || d.status === "pausada") && (
            <FeatureGate permission="fiscal:reprocess" fallback="hidden">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" disabled={reprocess.isPending}
                onClick={() => { setBusy(d.id); reprocess.mutate(d.id); }}>
                <Icon name="RefreshCw" className="size-3.5" /> Reprocessar
              </Button>
            </FeatureGate>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="space-y-1">
          <p><strong>Cobrança</strong> é o que a família deve (propina, matrícula, multa). <strong>Pagamento</strong> é o dinheiro recebido: regista-se ao «Marcar como pago». <strong>Factura</strong> é a factura-recibo, o documento fiscal, emitida no <strong>MindGest</strong> por cada acto de pagamento (pode incluir várias cobranças).</p>
          <p>Estornos e notas de crédito fazem-se <strong>só no MindGest</strong>, pelo proprietário ou gestor. Aqui só se vê o resultado.</p>
        </div>
      </div>

      <StatusLegend
        title="O que significam os estados"
        items={[
          { label: FISCAL_STATUS.certificada.label, description: FISCAL_STATUS.certificada.hint },
          { label: FISCAL_STATUS.pendente_fiscal.label, description: FISCAL_STATUS.pendente_fiscal.hint },
          { label: FISCAL_STATUS.sem_ligacao.label, description: FISCAL_STATUS.sem_ligacao.hint, next: "o titular liga a escola em Definições › Integrações › MindGest; a factura segue sozinha." },
          { label: FISCAL_STATUS.sem_catalogo.label, description: FISCAL_STATUS.sem_catalogo.hint, next: "defina o imposto dos serviços no MindGest (Plugins › MindSchool › Serviços)." },
          { label: FISCAL_STATUS.pausada.label, description: FISCAL_STATUS.pausada.hint, next: "o titular reactiva em Definições › Integrações › MindGest; a factura segue sozinha." },
          { label: FISCAL_STATUS.rejeitada.label, description: FISCAL_STATUS.rejeitada.hint },
          { label: FISCAL_STATUS.erro.label, description: FISCAL_STATUS.erro.hint, next: "«Reprocessar» (titular ou financeiro)." },
          { label: "Prazo legal", description: "A factura-recibo deve ser emitida até ao 5.º dia útil seguinte ao pagamento (Decreto Presidencial 71/25, art. 8.º); a emissão tardia pode ter multa de 0,2% do valor. O titular e o financeiro são avisados ao 3.º dia útil. O prazo conta só sábados e domingos como não úteis (feriados não são descontados, por prudência)." },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={data.length} subtitle="Facturas-recibo" icon="Receipt" description="Uma por acto de pagamento" />
        <DynamicMetricCard title={count(["certificada"])} subtitle="Certificadas" icon="ShieldCheck" description="Com número fiscal" />
        <DynamicMetricCard title={count(["pendente_fiscal", "sem_ligacao", "sem_catalogo", "pausada"])} subtitle="Em curso ou em espera" icon="Clock" description="Seguem sozinhas" />
        <DynamicMetricCard title={count(["erro", "rejeitada"])} subtitle="Precisam de atenção" icon="ShieldAlert" colors="destructive" description="Erro ou rejeitadas" />
      </div>

      <DataList<ApiFiscalDocumentRow>
        prefix="fdoc"
        rows={data}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        refetch={() => void refetch()}
        pageSize={10}
        searchPlaceholder="Pesquisar aluno, cliente, NIF ou n.º da factura"
        searchText={(d) => `${d.student?.full_name ?? ""} ${d.customer?.name ?? ""} ${d.customer?.nif ?? ""} ${d.number ?? ""}`}
        filters={[{ key: "estado", label: "Estado", icon: "ListFilter", options: STATES.map((value) => ({ value, label: FISCAL_STATUS[value].label })), match: (d, v) => d.status === v }]}
        dateFilters={[{ key: "data", label: "Data", getDate: (d) => d.created_at.slice(0, 10) }]}
        sorts={[
          { value: "recentes", label: "Mais recentes", compare: (a, b) => b.created_at.localeCompare(a.created_at) },
          { value: "valor", label: "Valor", compare: (a, b) => Number(a.total) - Number(b.total) },
        ]}
        emptyTitle="Ainda não há facturas"
        emptyDescription="A factura-recibo nasce quando se marca uma propina como paga (Propinas › Marcar como pago)."
        emptyIcon="Receipt"
      />
    </div>
  );
}
