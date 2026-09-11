import { DynamicMetricCard } from "@/components";
import type { DashboardSummary } from "@/types";

interface DashboardSummaryCardsProps {
    summary: DashboardSummary;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
    const stats = [
        {
            subtitle: "Produtos Vendidos",
            title: summary.productsSold.total?.toString() || "0",
            icon: "ShoppingCart",
            description: summary.productsSold.insight,
        },
        {
            subtitle: "Serviços Prestados",
            title: summary.servicesRendered.total?.toString() || "0",
            icon: "TrendingUp",
            description: summary.servicesRendered.insight,
        },
        {
            subtitle: "Total de Vendas",
            title: new Intl.NumberFormat("pt-AO", {
                style: "currency",
                currency: "AOA",
            }).format(summary.totalSales.amount || 0).replace("AOA", "Kz"),
            icon: "ShoppingBasket",
            description: summary.totalSales.insight,
        },
        {
            subtitle: "Total Geral",
            title: new Intl.NumberFormat("pt-AO", {
                style: "currency",
                currency: "AOA",
            }).format(summary.overallTotal.amount || 0).replace("AOA", "Kz"),
            icon: "DollarSign",
            description: summary.overallTotal.insight,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {stats.map((stat, i) => (
                <DynamicMetricCard key={i} {...(stat as any)} />
            ))}
        </div>
    );
}
