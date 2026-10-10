"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { DataList, type Column } from "@/components";
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
import { TuitionPaymentModal } from "./tuition-payment-modal";

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
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<StudentTuitionFee | null>(null);
  const { allFees, summary, isLoading, counts } = useTuition();

  const { sendWhatsAppReminder } = useTuitionBilling();

  function handleOpenReceipt(fee: StudentTuitionFee) {
    tuitionService.openReceipt(fee.id).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível abrir o recibo.")));
  }

  const columns: Column<StudentTuitionFee>[] = [
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
                  tooltipMessage="Apenas operadores de tesouraria e direção podem liquidar propinas."
                >
                  <Button
                    size="sm"
                    onClick={() => setSelectedFeeForPayment(item)}
                    className="h-8 px-3 text-xs gap-1.5 font-semibold"
                  >
                    <Icon name="CreditCard" className="w-3.5 h-3.5" />
                    Liquidar
                  </Button>
                </FeatureGate>
                <FeatureGate
                  permission="invoice:write"
                  fallback="disabled"
                  tooltipMessage="Apenas operadores de tesouraria podem enviar lembretes de cobrança."
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendWhatsAppReminder(item)}
                    title="Enviar lembrete pelo WhatsApp"
                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    <Icon name="MessageSquare" className="w-3.5 h-3.5" />
                  </Button>
                </FeatureGate>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenReceipt(item)}
                className="h-8 px-3 text-xs gap-1.5"
              >
                <Icon name="FileText" className="w-3.5 h-3.5 text-muted-foreground" />
                Ver Recibo
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
          suTitle="Controlo de liquidações escolares: registo de pagamentos e recibos internos"
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
          description="Aproveitamento financeiro do ano"
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

      <DataList<StudentTuitionFee>
        prefix="propinas"
        rows={allFees}
        columns={columns}
        isLoading={isLoading}
        pageSize={12}
        searchPlaceholder="Pesquisar por aluno, n.º de processo, encarregado ou recibo"
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

      {/* Modal de Pagamento Integrado */}
      <TuitionPaymentModal
        isOpen={!!selectedFeeForPayment}
        onClose={() => setSelectedFeeForPayment(null)}
        fee={selectedFeeForPayment}
      />
    </div>
  );
}
