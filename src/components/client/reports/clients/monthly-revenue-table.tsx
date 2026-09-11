"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/utils";
import { EmptyState } from "@/components/common";

interface MonthlyTrend {
    month: string;
    revenue: number;
    invoices: number;
}

interface MonthlyRevenueTableProps {
    monthlyTrend: MonthlyTrend[];
}

export function MonthlyRevenueTable({ monthlyTrend }: MonthlyRevenueTableProps) {
    const formatMonth = (monthString: string) => {
        const [year, month] = monthString.split("-");
        // Using AO locale for consistency
        return new Intl.DateTimeFormat("pt-AO", {
            month: "long",
            year: "numeric",
        }).format(new Date(parseInt(year), parseInt(month) - 1));
    };

    return (
        <Card className="border-none shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="text-lg font-semibold">Receita Mensal</CardTitle>
                    <CardDescription>Histórico de desempenho recente</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {monthlyTrend.length === 0 || monthlyTrend.every(t => t.revenue === 0) ? (
                    <EmptyState
                        icon="CalendarDays"
                        title="Sem histórico mensal"
                        description="Não foi registada nenhuma transacção nos últimos meses."
                        className="py-12"
                    />
                ) : (
                    <div className="rounded-xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-bold text-foreground">Mês Referência</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">Receita</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">Facturas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlyTrend.map((trend, index) => (
                                    <TableRow
                                        key={index}
                                        className={cn(
                                            "transition-colors",
                                            trend.revenue > 0 ? "bg-primary/[0.02]" : "opacity-60"
                                        )}
                                    >
                                        <TableCell className="font-medium capitalize">{formatMonth(trend.month)}</TableCell>
                                        <TableCell className="text-right font-black text-primary">
                                            {trend.revenue > 0 ? formatCurrency(trend.revenue) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {trend.invoices > 0 ? trend.invoices : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
