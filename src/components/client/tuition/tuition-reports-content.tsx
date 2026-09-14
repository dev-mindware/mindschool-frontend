"use client";

import React, { useMemo } from "react";
import { TitleList } from "@/components/common/title-list";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { GenericTable, Column } from "@/components/common/generic-table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { useTuition } from "@/hooks/school/use-tuition";
import { formatCurrency } from "@/utils/format-currency";
import { toast } from "sonner";

interface MonthlyReportRow {
  id: string;
  month: number;
  monthLabel: string;
  expected: number;
  collected: number;
  count: number;
}

export function TuitionReportsContent() {
  const { allFees, summary } = useTuition();

  const feesByMonth: MonthlyReportRow[] = useMemo(() => {
    const map = new Map<number, MonthlyReportRow>();

    allFees.forEach((fee) => {
      const entry = map.get(fee.month) || {
        id: String(fee.month),
        month: fee.month,
        monthLabel: fee.monthLabel,
        expected: 0,
        collected: 0,
        count: 0,
      };

      entry.expected += fee.totalAmount;
      if (fee.status === "PAID") {
        entry.collected += fee.totalAmount;
      }
      entry.count += 1;

      map.set(fee.month, entry);
    });

    return Array.from(map.values()).sort((a, b) => a.month - b.month);
  }, [allFees]);

  function handleExportReport() {
    toast.success("Balancete financeiro escolar exportado com sucesso (Excel / PDF)!");
  }

  const columns: Column<MonthlyReportRow>[] = [
    {
      key: "monthLabel",
      header: "Mês de Competência",
      render: (_, item) => (
        <span className="font-semibold text-foreground text-xs">{item.monthLabel}</span>
      ),
    },
    {
      key: "count",
      header: "Alunos com Propina",
      render: (_, item) => (
        <span className="text-xs text-muted-foreground">{item.count} estudantes</span>
      ),
    },
    {
      key: "expected",
      header: "Montante Previsto",
      render: (_, item) => (
        <span className="font-medium text-foreground text-xs">{formatCurrency(item.expected)}</span>
      ),
    },
    {
      key: "collected",
      header: "Montante Arrecadado",
      render: (_, item) => (
        <span className="font-bold text-emerald-600 text-xs">{formatCurrency(item.collected)}</span>
      ),
    },
    {
      key: "rate",
      header: "Taxa de Cobrança",
      render: (_, item) => {
        const rate = item.expected > 0 ? Math.round((item.collected / item.expected) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  rate >= 90 ? "bg-emerald-500" : rate >= 70 ? "bg-amber-500" : "bg-destructive"
                }`}
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className="font-semibold text-xs text-foreground">{rate}%</span>
          </div>
        );
      },
    },
    {
      key: "balance",
      header: "Saldo Pendente",
      className: "text-right",
      render: (_, item) => {
        const balance = item.expected - item.collected;
        return (
          <span className="font-semibold text-xs text-muted-foreground">
            {balance > 0 ? formatCurrency(balance) : "—"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Relatório Financeiro & Balancete"
          suTitle="Visão consolidada de receitas de propinas, taxa de cobrança e inadimplência"
        />
        <Button
          onClick={handleExportReport}
          variant="outline"
          className="h-10 px-4 text-xs font-semibold gap-2"
        >
          <Icon name="Download" className="w-4 h-4 text-muted-foreground" />
          Exportar Balancete (PDF / Excel)
        </Button>
      </div>

      {/* Cartões de Indicadores Chave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={formatCurrency(summary.totalCollectedAmount)}
          subtitle="Receita Arrecadada"
          description="Total liquidado no ano lectivo"
          icon="TrendingUp"
        />
        <DynamicMetricCard
          title={formatCurrency(summary.totalExpectedAmount)}
          subtitle="Receita Prevista"
          description="100% da capacidade lectiva"
          icon="Coins"
        />
        <DynamicMetricCard
          title={`${summary.totalExpectedAmount > 0 ? Math.round((summary.totalCollectedAmount / summary.totalExpectedAmount) * 100) : 0}%`}
          subtitle="Eficiência de Cobrança"
          description="Índice de liquidez da instituição"
          icon="CircleCheck"
        />
        <DynamicMetricCard
          title={formatCurrency(summary.totalOverdueAmount)}
          subtitle="Inadimplência Ativa"
          description="Mensalidades em mora"
          icon="CircleAlert"
        />
      </div>

      {/* Tabela de Balancete com GenericTable */}
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-sm">Demonstrativo Mensal de Propinas</h4>
          <span className="text-xs text-muted-foreground font-mono">Ano Lectivo 2025/2026</span>
        </div>

        <GenericTable<MonthlyReportRow>
          page={1}
          data={feesByMonth}
          columns={columns}
          total={feesByMonth.length}
          totalPages={1}
          setPage={() => {}}
          goToNextPage={() => {}}
          goToPreviousPage={() => {}}
          emptyMessage="Nenhum dado mensal registado"
        />
      </div>
    </div>
  );
}
