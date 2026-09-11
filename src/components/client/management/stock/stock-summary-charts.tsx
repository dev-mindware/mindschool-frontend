"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Skeleton,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  EmptyState,
  RequestError,
} from "@/components";
import { StockSummarySkeleton, DynamicMetricCard } from "@/components";
import { useStockSummary } from "@/hooks/stock";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { icons } from "lucide-react";

export function StockSummaryCharts() {
  const { summary, isLoading, isError, refetch } = useStockSummary();

  if (isError) {
    return (
      <RequestError
        refetch={refetch}
        message="Erro ao carregar o resumo do stock"
      />
    );
  }

  if (isLoading) {
    return <StockSummarySkeleton />;
  }

  if (!summary) {
    return (
      <EmptyState
        title="Resumo Indisponível"
        description="Não existem dados de stock suficientes para gerar um resumo."
        icon="ChartColumn"
      />
    );
  }

  const chartData = [
    {
      name: "Adequado",
      value: summary.adequateStockCount,
      fill: "var(--primary)",
    },
    {
      name: "Baixo",
      value: summary.lowStockCount,
      fill: "var(--chart-2)",
    },
    {
      name: "Esgotado",
      value: summary.outOfStockCount,
      fill: "var(--destructive)",
    },
  ];

  const chartConfig = {
    value: { label: "Quantidade" },
  };

  const stats: {
    title: string;
    value: number;
    icon: keyof typeof icons;
    description: string;
  }[] = [
      {
        title: "Total de Itens",
        value: summary.totalItems,
        icon: "Package",
        description: "Tipos de produtos cadastrados",
      },
      {
        title: "Unidades Totais",
        value: summary.totalUnits,
        icon: "Boxes",
        description: "Soma de todas as quantidades",
      },
      {
        title: "Disponível",
        value: summary.totalAvailable,
        icon: "CircleCheck",
        description: "Pronto para venda",
      },
      {
        title: "Reservado",
        value: summary.totalReserved,
        icon: "Lock",
        description: "Em pedidos ou reservas",
      },
    ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, idx) => (
          <DynamicMetricCard
            key={idx}
            title={stat.value}
            subtitle={stat.title}
            description={stat.description}
            icon={stat.icon}
            variant={"default"}
            className="flex-1"
          />
        ))}
      </div>

      {/* Chart Area */}
      {isLoading ? (
        <Card className="border-muted-foreground/10 shadow-none" data-tour="stock-chart">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-2 flex flex-col items-end">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-muted-foreground/10 shadow-none overflow-hidden" data-tour="stock-chart">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">
                Níveis de Inventário
              </CardTitle>
              <CardDescription>
                Distribuição actual do stock por categoria
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/10" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  className="text-[12px] font-medium fill-muted-foreground"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  className="text-[12px] font-medium fill-muted-foreground"
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value) => (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Quantidade:</span>
                          <span className="font-semibold text-foreground">{value} itens</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
