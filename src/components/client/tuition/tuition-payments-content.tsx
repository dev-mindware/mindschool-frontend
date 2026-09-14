"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { GenericTable, Column } from "@/components/common/generic-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/common/icon";
import { FeatureGate } from "@/components/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTuition } from "@/hooks/school/use-tuition";
import { useTuitionBilling } from "@/hooks/school/use-tuition-billing";
import { useModal } from "@/stores/modal/use-modal-store";
import { StudentTuitionFee, TuitionStatus } from "@/types/tuition";
import { formatCurrency } from "@/utils/format-currency";
import { TuitionPaymentModal } from "./tuition-payment-modal";

const MONTHS = [
  { value: "ALL", label: "Todos os Meses" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TuitionStatus | "ALL">("ALL");
  const [monthFilter, setMonthFilter] = useState<number | "ALL">("ALL");
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<StudentTuitionFee | null>(null);

  const {
    fees,
    summary,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    counts,
  } = useTuition(searchQuery, statusFilter, monthFilter);

  const { sendWhatsAppReminder } = useTuitionBilling();
  const { openModal } = useModal();

  function handleOpenReceipt(fee: StudentTuitionFee) {
    if (fee.receiptId) {
      openModal("document-success", {
        id: fee.receiptId,
        type: "invoice-receipt",
        format: "thermal",
      });
    } else {
      openModal("details-invoice");
    }
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
                  roles={["FINANCIAL", "DIRECTOR_GENERAL", "OWNER", "MANAGER", "CASHIER"]}
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
                  roles={["FINANCIAL", "DIRECTOR_GENERAL", "OWNER", "MANAGER"]}
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
          suTitle="Controlo de liquidações escolares e emissão síncrona de Factura-Recibo AGT"
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 px-3 py-1 font-semibold text-xs gap-1.5">
            <Icon name="ShieldCheck" className="w-3.5 h-3.5 text-emerald-600" />
            Certificação AGT Activa
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

      {/* Barra de Pesquisa e Filtros */}
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="relative flex-1">
          <Icon
            name="Search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por aluno, n.º de processo, encarregado ou recibo..."
            className="pl-10 h-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as any)}
          >
            <SelectTrigger className="w-[150px] h-10 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Estados</SelectItem>
              <SelectItem value="PAID">Liquidada (Paga)</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="OVERDUE">Em Atraso (Vencida)</SelectItem>
              <SelectItem value="EXEMPT">Isento (Bolsa)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={monthFilter.toString()}
            onValueChange={(val) => setMonthFilter(val === "ALL" ? "ALL" : Number(val))}
          >
            <SelectTrigger className="w-[150px] h-10 text-xs">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela Padrão GenericTable */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden p-1">
        <GenericTable<StudentTuitionFee>
          page={currentPage}
          data={fees}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setCurrentPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhuma mensalidade encontrada"
        />
      </div>

      {/* Modal de Pagamento Integrado */}
      <TuitionPaymentModal
        isOpen={!!selectedFeeForPayment}
        onClose={() => setSelectedFeeForPayment(null)}
        fee={selectedFeeForPayment}
      />
    </div>
  );
}
