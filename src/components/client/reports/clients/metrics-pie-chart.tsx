"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartPie } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/utils";
import { ClientAnalyticsResponse } from "@/types";
import { EmptyState } from "@/components/common";

interface MetricsPieChartProps {
    summary: ClientAnalyticsResponse["summary"];
}

const COLORS = ["var(--primary)", "var(--primary-300)", "var(--primary-700)", "var(--primary-400)"];

export function MetricsPieChart({ summary }: MetricsPieChartProps) {
    const pieChartData = [
        { name: "Receita Total", value: summary.totalRevenue },
        { name: "Ticket Médio", value: summary.averageTicket },
    ];

    return (
        <Card className="flex flex-col h-full border-none shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <ChartPie className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="text-lg font-semibold">Distribuição de Métricas</CardTitle>
                    <CardDescription>Visão proporcional do período</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                {summary.totalRevenue === 0 && summary.totalClients === 0 ? (
                    <EmptyState
                        icon="ChartPie"
                        title="Sem dados para exibir"
                        description="Não foram encontradas métricas para o período seleccionado."
                        className="py-12"
                    />
                ) : (
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "8px",
                                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                                    }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
