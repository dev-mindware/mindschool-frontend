"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { icons } from "lucide-react";
import { Icon } from "@/components";
import { parseRawDate } from "@/utils/format-date";
import { formatCurrencyCompact } from "@/utils/format-currency";
import { OverviewSectionCard } from "./overview-section-card";
import type { DashboardActivity, DashboardActivityType } from "@/types";

interface OverviewRecentActivityProps {
    activity: DashboardActivity[];
}

const ACTIVITY_ICON: Record<DashboardActivityType, keyof typeof icons> = {
    invoice_created: "FileText",
    payment_received: "CreditCard",
    product_added: "Package",
    client_added: "UserPlus",
    stock_adjusted: "Boxes",
};

function timeAgo(date: string) {
    try {
        return formatDistanceToNow(parseRawDate(date), {
            addSuffix: true,
            locale: ptBR,
        });
    } catch {
        return "recentemente";
    }
}

export function OverviewRecentActivity({
    activity,
}: OverviewRecentActivityProps) {
    return (
        <OverviewSectionCard
            title="Actividade Recente"
            icon="Clock"
            href="/notifications"
            actionLabel="Ver todas"
        >
            {activity.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                    Sem actividade registada neste período.
                </p>
            ) : (
                <ul className="divide-y divide-border">
                    {activity.slice(0, 5).map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <Icon
                                    name={ACTIVITY_ICON[item.type] ?? "Activity"}
                                    className="size-4"
                                />
                            </span>

                            <p className="min-w-0 flex-1 truncate text-sm">{item.title}</p>

                            {item.amount !== null && (
                                <span className="shrink-0 text-sm font-semibold tabular-nums">
                                    {formatCurrencyCompact(item.amount, item.currency ?? undefined)}
                                </span>
                            )}

                            <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                                {timeAgo(item.createdAt)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </OverviewSectionCard>
    );
}
