import { formatCurrencyCompact } from "@/utils/format-currency";
import { OverviewSectionCard } from "./overview-section-card";
import { OverviewLegendRow } from "./overview-legend-row";
import type { DashboardStockOverview } from "@/types";

interface OverviewStockCardProps {
    stock: DashboardStockOverview;
}

export function OverviewStockCard({ stock }: OverviewStockCardProps) {
    const rows = [
        {
            key: "normal",
            label: "Stock normal",
            value: stock.normalStockItems,
            dot: "bg-green-600 dark:bg-green-500",
        },
        {
            key: "low",
            label: "Stock baixo",
            value: stock.lowStockItems,
            dot: "bg-amber-500",
        },
        {
            key: "out",
            label: "Esgotados",
            value: stock.outOfStockItems,
            dot: "bg-destructive",
        },
    ];

    return (
        <OverviewSectionCard title="Stock" icon="Package" href="/management/stock">
            <p className="text-sm text-muted-foreground">Valor do stock</p>
            <p className="text-2xl font-bold tracking-tight">
                {formatCurrencyCompact(stock.stockValue, stock.currency)}
            </p>

            <ul className="mt-4 space-y-2.5">
                {rows.map((row) => (
                    <OverviewLegendRow
                        key={row.key}
                        dotClassName={row.dot}
                        label={row.label}
                        value={row.value.toLocaleString("pt-PT")}
                    />
                ))}
            </ul>
        </OverviewSectionCard>
    );
}
