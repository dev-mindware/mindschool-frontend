"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import { TuitionFinancialKpi } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TuitionRevenueChartProps {
  financial?: TuitionFinancialKpi;
}

export function TuitionRevenueChart({ financial }: TuitionRevenueChartProps) {
  if (!financial) return null;

  const chartData = (financial.monthlyEvolution || []).map((m) => ({
    name: m.month,
    Previsto: m.expected / 1000000,
    Arrecadado: m.collected / 1000000,
  }));

  const formatKz = (val: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace("AOA", "Kz");
  };

  return (
    <Card className="border shadow-none bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Icon name="Banknote" className="w-5 h-5 text-primary" />
              Evolução de Cobrança de Propinas (Kz)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Arrecadação prevista vs realizada (valores em Milhões de Kz)
            </p>
          </div>
          <Link href="/tuition/collections">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary/90">
              Tesouraria <Icon name="ArrowRight" className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs text-emerald-800 font-medium block">Arrecadado em {financial.monthName}</span>
            <span className="text-lg font-bold text-emerald-600 block mt-0.5">
              {formatKz(financial.collectedRevenueAoa)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {financial.collectionRatePercent}% da meta cumprida
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border">
            <span className="text-xs text-muted-foreground font-medium block">Total Previsto Mensal</span>
            <span className="text-lg font-bold text-foreground block mt-0.5">
              {formatKz(financial.expectedRevenueAoa)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {financial.certifiedInvoicesCount} faturas validadas AGT
            </span>
          </div>

          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <span className="text-xs text-rose-800 font-medium block">Em Atraso (&gt; 30 dias)</span>
            <span className="text-lg font-bold text-rose-600 block mt-0.5">
              {formatKz(financial.overdueTotalAoa)}
            </span>
            <span className="text-[10px] text-rose-700 font-medium">
              {financial.overdueStudentsCount} alunos com mensalidade pendente
            </span>
          </div>
        </div>

        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}M`}
                className="text-xs"
              />
              <Tooltip
                formatter={(value: any) => [`${Number(value).toFixed(1)} Milhões Kz`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar dataKey="Previsto" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="Arrecadado" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
