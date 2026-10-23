"use client";

import { useEntitled } from "@/hooks/common/use-entitled";
import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { DataList, StatusLegend, type Column } from "@/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/common/icon";
import { FeatureGate } from "@/components/common";
import { ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
import { tuitionService } from "@/modules/finance/services/tuition-service";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { useTuitionBilling } from "@/modules/finance/hooks/use-tuition-billing";
import { StudentTuitionFee } from "@/modules/finance/types";
import { formatCurrency } from "@/utils/format-currency";
import { SettlementSheet } from "./settlement-sheet";

const MONTHS = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export function TuitionPaymentsContent() {
  // Propinas escolhidas para «Marcar como pago» (uma liquidação, uma factura-recibo; têm de ser do mesmo aluno).
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [settling, setSettling] = useState<StudentTuitionFee[]>([]);
  const { allFees, summary, isLoading, counts } = useTuition();

  const { sendReminders } = useTuitionBilling();
  // Cobrança por e-mail é do Enterprise (ou add-on): no Essencial o botão nem aparece (a API responderia 402).
  const canRemind = useEntitled({ feature: "email_collections" });

  function handleOpenReceipt(fee: StudentTuitionFee) {
    tuitionService.openReceipt(fee.id).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível abrir o recibo.")));
  }

  const toggle = (id: string) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const chosen = allFees.filter((f) => selected.has(f.id) && f.status !== "PAID" && f.status !== "EXEMPT");
  const chosenStudents = new Set(chosen.map((f) => f.studentId)).size;

  const columns: Column<StudentTuitionFee>[] = [
    {
      key: "select",
      header: "",
      render: (_, item) =>
        item.status === "PAID" || item.status === "EXEMPT" ? null : (
          <input
            type="checkbox"
            aria-label={`Seleccionar ${item.studentName} ${item.monthLabel}`}
            checked={selected.has(item.id)}
            onChange={() => toggle(item.id)}
            className="size-4 cursor-pointer accent-primary"
          />
        ),
    },
    {
      key: "studentNumber",
      header: "N.º Processo",
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {item.studentNumber}
        </span>
      ),
    },
    {
      key: "studentName",
      header: "Estudante",
      render: (_, item) => (
        <div>
          <p className="font-semibold text-foreground text-xs">{item.studentName}</p>
          <p className="text-[11px] text-muted-foreground">Enc: {item.guardianName}</p>
        </div>
      ),
    },
    {
      key: "classSection",
      header: "Turma",
      render: (_, item) => <span className="text-xs text-muted-foreground">{item.classSection}</span>,
    },
    {
      key: "monthLabel",
      header: "Competência",
      render: (_, item) => (
        <span className="font-medium text-foreground text-xs">
          {item.monthLabel} / {item.year}
        </span>
      ),
    },
    {
      key: "baseAmount",
      header: "Valor Base",
      render: (_, item) => <span className="text-xs text-muted-foreground">{formatCurrency(item.baseAmount)}</span>,
    },
    {
      key: "penaltyAmount",
      header: "Multa / Desconto",
      render: (_, item) => (
        <span className="text-xs">
          {item.penaltyAmount > 0 ? (
            <span className="text-destructive font-medium">+{formatCurrency(item.penaltyAmount)}</span>
          ) : item.discountAmount > 0 ? (
            <span className="text-emerald-600 font-medium">-{formatCurrency(item.discountAmount)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
    },
    {
      key: "totalAmount",
      header: "Total",
      render: (_, item) => (
        <span className="font-bold text-foreground text-xs">{formatCurrency(item.totalAmount)}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => {
        if (item.status === "PAID") {
          return (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 font-medium text-[10px]">
              <Icon name="Check" className="w-3 h-3 mr-1" />
              Liquidada
            </Badge>
          );
        }
        if (item.status === "PENDING") {
          return (
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 font-medium text-[10px]">
              <Icon name="Clock" className="w-3 h-3 mr-1" />
              Pendente
            </Badge>
          );
        }
        if (item.status === "OVERDUE") {
          return (
            <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive font-medium text-[10px]">
              <Icon name="CircleAlert" className="w-3 h-3 mr-1" />
              Em Atraso
            </Badge>
          );
        }
        return <Badge variant="secondary" className="text-[10px]">{item.status}</Badge>;
      },
    },
    {
      key: "action",
      header: "Acções",
      className: "text-right",
      render: (_, item) => {
        const isPaid = item.status === "PAID";
        return (
          <div className="flex items-center justify-end gap-1.5">
            {!isPaid ? (
              <>
                <FeatureGate
                  permission="payment:write"
                  fallback="disabled"
                  tooltipMessage="Apenas a secretaria, a tesouraria e a direcção podem marcar propinas como pagas."
                >
                  <Button
                    size="sm"
                    onClick={() => setSettling([item])}
                    className="h-8 px-3 text-xs gap-1.5 font-semibold"
                  >
                    <Icon name="CreditCard" className="w-3.5 h-3.5" />
                    Marcar como pago
                  </Button>
                </FeatureGate>
                {canRemind && (
                  <FeatureGate
                    permission="invoice:write"
                    fallback="disabled"
                    tooltipMessage="Apenas operadores de tesouraria podem enviar lembretes de cobrança."
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void sendReminders([item]).catch(() => undefined)}
                      title="Enviar lembrete por e-mail ao encarregado"
                      className="h-8 w-8 p-0 text-primary hover:text-primary/90"
                    >
                      <Icon name="Mail" className="w-3.5 h-3.5" />
                    </Button>
                  </FeatureGate>
                )}
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenReceipt(item)}
                className="h-8 px-3 text-xs gap-1.5"
              >
                <Icon name="FileText" className="w-3.5 h-3.5 text-muted-foreground" />
                Ver comprovativo
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Gestão de Propinas & Mensalidades"
          suTitle="Marque as propinas como pagas: regista o pagamento e pede ao MindGest a factura-recibo (o documento fiscal). O comprovativo interno não tem valor fiscal."
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 px-3 py-1 font-semibold text-xs gap-1.5">
            <Icon name="ShieldCheck" className="w-3.5 h-3.5 text-emerald-600" />
            Facturação via MindGest
          </Badge>
        </div>
      </div>

      {/* Cartões de Métricas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={formatCurrency(summary.totalCollectedAmount)}
          subtitle="Arrecadação Confirmada"
          description={`${counts.paid} mensalidades liquidadas`}
          icon="TrendingUp"
        />
        <DynamicMetricCard
          title={`${summary.totalExpectedAmount > 0 ? Math.round((summary.totalCollectedAmount / summary.totalExpectedAmount) * 100) : 0}%`}
          subtitle="Taxa de Cobrança"
          description="Cobrado ÷ previsto nas propinas desta lista. Só conta o que está totalmente pago; pagamentos parciais ainda não entram"
          icon="CircleCheck"
        />
        <DynamicMetricCard
          title={counts.overdue.toString()}
          subtitle="Mensalidades Vencidas"
          description="Aguardam cobrança ativa"
          icon="CircleAlert"
        />
        <DynamicMetricCard
          title={formatCurrency(summary.totalPendingAmount)}
          subtitle="Previsão a Receber"
          description={`${counts.pending} mensalidades a vencer`}
          icon="Clock"
        />
      </div>

      <StatusLegend
        title="Estados, multas e liquidação"
        items={[
          { label: "Pendente", description: "Dentro do prazo ou com pagamento parcial: ainda há valor por pagar." },
          { label: "Em Atraso", description: "Passou o vencimento. Depois da tolerância cria-se a multa de mora (e, se a escola o definir, um agravamento por cada mês completo), que aparece na coluna «Multa» e soma ao total." },
          { label: "Liquidada", description: "Propina e multas totalmente pagas." },
          { label: "Marcar como pago", description: "Regista o pagamento do saldo total (propina e multas por pagar; não há pagamento parcial) e pede ao MindGest a factura-recibo, que é o documento fiscal. Seleccione várias propinas do mesmo aluno para as pagar num só acto, com uma só factura. Se a escola não estiver ligada ao MindGest, o pagamento fica registado e a factura segue quando for ligada." },
          { label: "Ver comprovativo", description: "Comprovativo interno do pagamento, sem valor fiscal. A factura-recibo está em Facturas." },
        ]}
      />

      {chosen.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
          <span>
            <strong>{chosen.length}</strong> {chosen.length === 1 ? "propina seleccionada" : "propinas seleccionadas"} · {formatCurrency(chosen.reduce((a, f) => a + f.totalAmount, 0))}
            {chosenStudents > 1 && <span className="ml-2 text-destructive">De alunos diferentes: deixe só um aluno.</span>}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Limpar</Button>
            <FeatureGate permission="payment:write" fallback="disabled" tooltipMessage="Apenas a secretaria, a tesouraria e a direcção podem marcar propinas como pagas.">
              <Button size="sm" disabled={chosenStudents !== 1} onClick={() => setSettling(chosen)} className="gap-1.5 font-semibold">
                <Icon name="CreditCard" className="size-3.5" /> Marcar como pago
              </Button>
            </FeatureGate>
          </div>
        </div>
      )}

      <DataList<StudentTuitionFee>
        prefix="propinas"
        rows={allFees}
        columns={columns}
        isLoading={isLoading}
        pageSize={12}
        searchPlaceholder="Pesquisar por aluno, n.º de processo, encarregado ou comprovativo"
        searchText={(f) => `${f.studentName} ${f.studentNumber} ${f.guardianName} ${f.guardianPhone} ${f.receiptNumber ?? ""}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: [{ value: "PAID", label: "Liquidada" }, { value: "PENDING", label: "Pendente" }, { value: "OVERDUE", label: "Em atraso" }, { value: "EXEMPT", label: "Isento (bolsa)" }], match: (f, v) => f.status === v },
          { key: "mes", label: "Mês", icon: "CalendarDays", options: MONTHS.map((m) => ({ value: m.value, label: m.label })), match: (f, v) => f.month === Number(v) },
          { key: "ano", label: "Ano", icon: "CalendarRange", options: [...new Set(allFees.map((f) => String(f.year)))].sort().map((y) => ({ value: y, label: y })), match: (f, v) => String(f.year) === v },
          { key: "turma", label: "Turma", icon: "Users", options: [...new Set(allFees.map((f) => f.classSection).filter(Boolean))].sort().map((v) => ({ value: v, label: v })), match: (f, v) => f.classSection === v },
          { key: "metodo", label: "Método", icon: "CreditCard", options: [{ value: "MULTICAIXA", label: "Multicaixa" }, { value: "TRANSFER", label: "Transferência" }, { value: "CASH", label: "Numerário" }, { value: "EXPRESS", label: "Express" }], match: (f, v) => f.paymentMethod === v },
          { key: "multa", label: "Multa / desconto", icon: "Percent", options: [{ value: "multa", label: "Com multa" }, { value: "desconto", label: "Com desconto" }], match: (f, v) => (v === "multa" ? f.penaltyAmount > 0 : f.discountAmount > 0) },
        ]}
        dateFilters={[{ key: "vencimento", label: "Vencimento", getDate: (f) => f.dueDate }]}
        sorts={[
          { value: "vencimento", label: "Vencimento", compare: (a, b) => a.dueDate.localeCompare(b.dueDate) },
          { value: "aluno", label: "Aluno", compare: (a, b) => a.studentName.localeCompare(b.studentName, "pt") },
          { value: "total", label: "Valor total", compare: (a, b) => a.totalAmount - b.totalAmount },
        ]}
        emptyTitle="Nenhuma mensalidade encontrada"
        emptyDescription="Ajuste os filtros para ver outras mensalidades."
        emptyIcon="Wallet"
      />

      {settling.length > 0 && (
        <SettlementSheet isOpen onClose={() => { setSettling([]); setSelected(new Set()); }} fees={settling} />
      )}
    </div>
  );
}
