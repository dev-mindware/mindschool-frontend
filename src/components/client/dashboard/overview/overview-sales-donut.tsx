"use client";

import { Cell, Label, Pie, PieChart } from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    Icon,
    type ChartConfig,
} from "@/components";
import { formatCurrencyCompact } from "@/utils/format-currency";
import { OverviewLegendRow } from "./overview-legend-row";
import type { DashboardSalesDistribution } from "@/types";

interface OverviewSalesDonutProps {
    distribution: DashboardSalesDistribution;
}

const chartConfig = {
    count: { label: "Vendas" },
    products: { label: "Produtos", color: "var(--primary)" },
    services: { label: "Serviços", color: "var(--primary-300)" },
} satisfies ChartConfig;

export function OverviewSalesDonut({ distribution }: OverviewSalesDonutProps) {
    // `fill` só resolve dentro do ChartContainer (é lá que o ChartStyle injecta
    // os `--color-*`); a legenda vive fora, por isso usa classes do tema.
    const slices = [
        {
            key: "products",
            label: "Produtos",
            fill: "var(--color-products)",
            dotClassName: "bg-primary",
            ...distribution.products,
        },
        {
            key: "services",
            label: "Serviços",
            fill: "var(--color-services)",
            dotClassName: "bg-primary-300",
            ...distribution.services,
        },
    ];

    return (
        <Card className="flex h-full flex-col gap-0 py-4">
            <CardHeader className="px-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon name="ChartPie" className="size-4" />
                    </span>
                    {distribution.label}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-center px-4">
                <ChartContainer config={chartConfig} className="mx-auto h-[190px] w-full">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, _name, item) => (
                                        <div className="flex w-full flex-col gap-0.5">
                                            <span className="font-medium text-foreground">
                                                {item?.payload?.label}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {Number(value)} vendas ·{" "}
                                                {formatCurrencyCompact(item?.payload?.amount ?? 0)}
                                            </span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Pie
                            data={
                                distribution.totalSales === 0
                                    ? [{ key: "empty", label: "Sem dados", count: 1, fill: "var(--muted)" }]
                                    : slices
                            }
                            dataKey="count"
                            nameKey="label"
                            innerRadius={62}
                            outerRadius={88}
                            paddingAngle={distribution.totalSales === 0 ? 0 : 3}
                            strokeWidth={0}
                        >
                            {distribution.totalSales === 0 ? (
                                <Cell key="empty" fill="currentColor" className="text-muted/40" />
                            ) : (
                                slices.map((slice) => (
                                    <Cell key={slice.key} fill={slice.fill} />
                                ))
                            )}
                            <Label
                                content={({ viewBox }) => {
                                    if (!viewBox || !("cx" in viewBox)) return null;
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-2xl font-bold"
                                            >
                                                {distribution.totalSales}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy ?? 0) + 20}
                                                className="fill-muted-foreground text-xs"
                                            >
                                                Vendas
                                            </tspan>
                                        </text>
                                    );
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>

                <ul className="mt-3 space-y-2">
                    {slices.map((slice) => (
                        <OverviewLegendRow
                            key={slice.key}
                            dotClassName={slice.dotClassName}
                            label={slice.label}
                            value={`${slice.percentage}%`}
                            hint={slice.count}
                        />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
