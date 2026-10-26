"use client";

import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ChartContainer, ChartTooltip, ChartTooltipContent, DataList, type ChartConfig, type Column } from "@/components";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { formatCurrency } from "@/utils/format-currency";
import { formatAxisCurrency } from "@/utils/format-currency";

interface MonthlyReportRow {
  id: string;
  month: number;
  monthLabel: string;
  expected: number;
  collected: number;
  count: number;
}

export function TuitionReportsContent() {
  const { allFees } = useTuition();
  const { calendar } = useSchoolSettingsStore();
  // ordem do ano letivo (Setembro → Julho), não Janeiro → Dezembro
  const startMonth = Number((calendar.yearStartDate ?? "").slice(5, 7)) || 9;
  const yearOrder = (m: number) => (m - startMonth + 12) % 12;

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

    return Array.from(map.values()).sort((a, b) => yearOrder(a.month) - yearOrder(b.month));
  }, [allFees, startMonth]);

  function handleExportReport() {
    const rows = [["Mês", "Alunos com propina", "Previsto (Kz)", "Arrecadado (Kz)", "Saldo (Kz)"], ...feesByMonth.map((r) => [r.monthLabel, String(r.count), String(r.expected), String(r.collected), String(r.expected - r.collected)])];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "balancete-propinas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const chartConfig = { expected: { label: "Previsto", color: "color-mix(in oklab, var(--primary) 35%, transparent)" }, collected: { label: "Arrecadado", color: "var(--primary)" } } satisfies ChartConfig;

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Balancete mensal de propinas</h3>
          <p className="text-xs text-muted-foreground">Previsto vs arrecadado por mês de competência</p>
        </div>
        <Button onClick={handleExportReport} variant="outline" size="sm" className="gap-2"><Icon name="Download" className="size-4" />Exportar balancete (CSV)</Button>
      </div>

      <Card className="gap-0 py-4">
        <CardHeader className="px-4 pb-3">
          <CardTitle className="text-sm">Previsto vs arrecadado por mês</CardTitle>
          <CardDescription>Receita de propinas por mês de competência</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={feesByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => formatAxisCurrency(v)} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="expected" fill="var(--color-expected)" radius={4} />
              <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <DataList<MonthlyReportRow>
        prefix="balancete"
        rows={feesByMonth}
        columns={columns}
        pageSize={12}
        searchPlaceholder="Pesquisar mês"
        searchText={(r) => r.monthLabel}
        filters={[
          { key: "taxa", label: "Taxa de cobrança", icon: "Gauge", options: [{ value: "alta", label: "≥ 90%" }, { value: "media", label: "70 – 89%" }, { value: "baixa", label: "< 70%" }], match: (r, v) => { const t = r.expected > 0 ? (r.collected / r.expected) * 100 : 0; return v === "alta" ? t >= 90 : v === "media" ? t >= 70 && t < 90 : t < 70; } },
          { key: "saldo", label: "Saldo", icon: "Coins", options: [{ value: "pendente", label: "Com saldo pendente" }, { value: "liquidado", label: "Totalmente liquidado" }], match: (r, v) => (v === "pendente" ? r.expected - r.collected > 0 : r.expected - r.collected <= 0) },
        ]}
        sorts={[
          { value: "mes", label: "Mês", compare: (a, b) => yearOrder(a.month) - yearOrder(b.month) },
          { value: "previsto", label: "Previsto", compare: (a, b) => a.expected - b.expected },
          { value: "arrecadado", label: "Arrecadado", compare: (a, b) => a.collected - b.collected },
        ]}
        emptyTitle="Nenhum dado mensal registado"
        emptyDescription="Ainda não existem mensalidades geradas."
        emptyIcon="ChartBar"
      />
    </div>
  );
}
