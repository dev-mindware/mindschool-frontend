import { DynamicMetricCard } from "@/components";
import { formatCurrency } from "@/utils/format-currency";
import type { DashboardSummaryCards, DashboardPeriodType } from "@/types";
import { icons } from "lucide-react";

interface OverviewSummaryCardsProps {
    summary: DashboardSummaryCards;
    period: DashboardPeriodType;
}

const COMPARISON_LABEL: Record<DashboardPeriodType, string> = {
    month: "vs. mês anterior",
    quarter: "vs. trimestre anterior",
    year: "vs. ano anterior",
};

export function OverviewSummaryCards({
    summary,
    period,
}: OverviewSummaryCardsProps) {
    const comparison = COMPARISON_LABEL[period];

    const cards: {
        key: string;
        subtitle: string;
        title: string;
        icon: keyof typeof icons;
        percent: number;
    }[] = [
            {
                key: "revenue",
                subtitle: summary.revenue.label,
                title: formatCurrency(summary.revenue.value, summary.revenue.currency),
                icon: "Coins",
                percent: summary.revenue.variationPercent,
            },
            {
                key: "sales",
                subtitle: summary.sales.label,
                title: summary.sales.value.toLocaleString("pt-PT"),
                icon: "ShoppingCart",
                percent: summary.sales.variationPercent,
            },
            {
                key: "clients",
                subtitle: summary.clients.label,
                title: summary.clients.value.toLocaleString("pt-PT"),
                icon: "Users",
                percent: summary.clients.variationPercent,
            },
            {
                key: "stock",
                subtitle: summary.stock.label,
                title: `${summary.stock.value.toLocaleString("pt-PT")} itens`,
                icon: "Package",
                percent: summary.stock.variationPercent,
            },
        ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 @5xl/main:grid-cols-4">
            {cards.map(({ key, percent, ...card }) => (
                <DynamicMetricCard
                    key={key}
                    {...card}
                    trend={{ percent, label: comparison }}
                />
            ))}
        </div>
    );
}
