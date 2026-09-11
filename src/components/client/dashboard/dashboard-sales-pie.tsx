"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components";
import type { SalesDistribution } from "@/types";

interface DashboardSalesPieProps {
    data: SalesDistribution[];
}

const COLORS = ["var(--primary)", "var(--primary-300)", "var(--primary-700)", "var(--primary-400)"];

export function DashboardSalesPie({ data }: DashboardSalesPieProps) {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>Distribuição de Vendas</CardTitle>
                <CardDescription>Produtos vs Serviços</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="category"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(value).replace("AOA", "Kz")}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
