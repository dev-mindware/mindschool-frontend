"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    Icon,
    type ChartConfig,
} from "@/components";
import { formatAxisCurrency, formatCurrency } from "@/utils/format-currency";
import type { DashboardFinancialEvolution } from "@/types";

interface OverviewFinancialChartProps {
    evolution: DashboardFinancialEvolution;
}

const chartConfig = {
    revenue: { label: "Receita", color: "var(--primary)" },
    expenses: { label: "Despesas", color: "var(--destructive)" },
    profit: { label: "Lucro", color: "#22c55e" },
} satisfies ChartConfig;

const RANGE_LABEL: Record<string, string> = {
    last_6_months: "Últimos 6 meses",
    last_12_months: "Últimos 12 meses",
};

export function OverviewFinancialChart({
    evolution,
}: OverviewFinancialChartProps) {
    const series = Object.keys(chartConfig) as (keyof typeof chartConfig)[];

    return (
        <Card className="flex h-full flex-col gap-0 py-4">
            <CardHeader className="flex flex-row items-start justify-between gap-2 px-4 pb-3">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Icon name="ChartLine" className="size-4" />
                        </span>
                        {evolution.label}
                    </CardTitle>
                    <CardDescription>
                        {RANGE_LABEL[evolution.range] ?? "Evolução do período"}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex-1 px-2 pt-2 sm:px-4">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[280px] w-full"
                >
                    <AreaChart
                        data={evolution.series}
                        margin={{ top: 14, right: 12, left: -4, bottom: 0 }}
                    >
                        <defs>
                            {series.map((key) => (
                                <linearGradient
                                    key={key}
                                    id={`fill-${key}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={`var(--color-${key})`}
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={`var(--color-${key})`}
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                            ))}
                        </defs>

                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={65}
                            tickMargin={4}
                            tickFormatter={(value: number) => formatAxisCurrency(value)}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value, name) => (
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <span className="text-muted-foreground">
                                                {chartConfig[name as keyof typeof chartConfig]?.label ??
                                                    name}
                                            </span>
                                            <span className="font-medium tabular-nums text-foreground">
                                                {formatCurrency(Number(value))}
                                            </span>
                                        </div>
                                    )}
                                />
                            }
                        />

                        {series.map((key) => (
                            <Area
                                key={key}
                                dataKey={key}
                                type="natural"
                                fill={`url(#fill-${key})`}
                                stroke={`var(--color-${key})`}
                                strokeWidth={2}
                            />
                        ))}

                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
