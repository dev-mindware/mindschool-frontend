"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart, Legend, Tooltip, ResponsiveContainer } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils";
import { SalesDataPoint, SalesPeriod } from "@/types/reports";
import { EmptyState } from "@/components/common";

interface SalesAreaChartProps {
    data: SalesDataPoint[];
    period: SalesPeriod;
}

export function SalesAreaChart({ data, period }: SalesAreaChartProps) {
    const formatXAxis = (dateString: string) => {
        const date = new Date(dateString);

        switch (period) {
            case "weekly":
                return new Intl.DateTimeFormat("pt-PT", {
                    day: "2-digit",
                    month: "short",
                }).format(date);
            case "monthly":
                return new Intl.DateTimeFormat("pt-PT", {
                    month: "short",
                    year: "numeric",
                }).format(date);
            case "quarterly":
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                return `Q${quarter} ${date.getFullYear()}`;
            default:
                return dateString;
        }
    };

    const formatTooltipDate = (dateString: string) => {
        const date = new Date(dateString);

        switch (period) {
            case "weekly":
                return new Intl.DateTimeFormat("pt-PT", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                }).format(date);
            case "monthly":
                return new Intl.DateTimeFormat("pt-PT", {
                    month: "long",
                    year: "numeric",
                }).format(date);
            case "quarterly":
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                return `${quarter}º Trimestre de ${date.getFullYear()}`;
            default:
                return dateString;
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;

        return (
            <div className="bg-background border rounded-lg shadow-lg p-4 space-y-2">
                <p className="font-semibold text-sm">{formatTooltipDate(label)}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Receita Total:</span>
                        <span className="text-sm font-bold text-primary">
                            {formatCurrency(data.totalRevenue)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Transacções:</span>
                        <span className="text-sm font-semibold">
                            {data.transactionCount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Ticket Médio:</span>
                        <span className="text-sm font-medium">
                            {formatCurrency(data.averageTicket)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Evolução de Vendas</CardTitle>
                <CardDescription>
                    Receita total e número de transacções por período
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center">
                    {data.length === 0 ? (
                        <EmptyState
                            icon="ChartArea"
                            title="Sem dados de evolução"
                            description="Ainda não existe histórico de vendas suficiente para gerar o gráfico neste período."
                        />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatXAxis}
                                    className="text-xs"
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                    className="text-xs"
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    className="text-xs"
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: "20px" }}
                                    formatter={(value) => {
                                        if (value === "totalRevenue") return "Receita Total";
                                        if (value === "transactionCount") return "N.º de transacções";
                                        return value;
                                    }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="totalRevenue"
                                    stroke="var(--chart-1)"
                                    fill="url(#colorRevenue)"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="transactionCount"
                                    stroke="var(--chart-2)"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
