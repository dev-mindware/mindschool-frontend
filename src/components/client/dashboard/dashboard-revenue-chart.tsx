"use client";

import { ChartAreaInteractive } from "@/components/custom/chart-area-interactive";
import type { RevenueEvolution } from "@/types";

interface DashboardRevenueChartProps {
    data: RevenueEvolution[];
}

export function DashboardRevenueChart({ data }: DashboardRevenueChartProps) {
    return (
        <ChartAreaInteractive
            data={data}
            title="Evolução da facturação"
            description="Visualização global do desempenho mensal"
            dataKey="revenue"
        />
    );
}
