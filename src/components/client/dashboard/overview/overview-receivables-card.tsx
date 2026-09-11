import { cn } from "@/lib/utils";
import { formatCurrencyCompact } from "@/utils/format-currency";
import { OverviewSectionCard } from "./overview-section-card";
import { OverviewLegendRow } from "./overview-legend-row";
import type {
    DashboardAccountsReceivable,
    ReceivableBucketKey,
} from "@/types";

interface OverviewReceivablesCardProps {
    receivables: DashboardAccountsReceivable;
}

const BUCKET_DOT: Record<ReceivableBucketKey, string> = {
    overdue: "bg-destructive",
    due_7_days: "bg-amber-500",
    due_30_days: "bg-green-600 dark:bg-green-500",
};

export function OverviewReceivablesCard({
    receivables,
}: OverviewReceivablesCardProps) {
    const { total, currency, buckets } = receivables;

    return (
        <OverviewSectionCard
            title="Contas a Receber"
            icon="CreditCard"
            href="/documents"
        >
            <p className="text-2xl font-bold tracking-tight">
                {formatCurrencyCompact(total, currency)}
            </p>
            {total === 0 && (
                <p className="mt-0.5 text-xs font-medium text-green-600 dark:text-green-500">
                    Tudo regularizado
                </p>
            )}

            {/* A barra usa os montantes, não as percentagens: assim nunca passa
                dos 100% por causa de arredondamentos vindos da API. */}
            <div className="mt-3 flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
                {buckets.map((bucket) => (
                    <span
                        key={bucket.key}
                        className={cn("h-full", BUCKET_DOT[bucket.key])}
                        style={{ flexGrow: bucket.amount || 0, flexBasis: 0 }}
                    />
                ))}
            </div>

            <ul className="mt-4 space-y-2.5">
                {buckets.map((bucket) => (
                    <OverviewLegendRow
                        key={bucket.key}
                        dotClassName={BUCKET_DOT[bucket.key]}
                        label={bucket.label}
                        value={formatCurrencyCompact(bucket.amount, currency)}
                        hint={`${bucket.percentage}%`}
                    />
                ))}
            </ul>
        </OverviewSectionCard>
    );
}
