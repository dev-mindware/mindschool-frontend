"use client";

import {
    Icon,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components";
import {
    DASHBOARD_PERIODS,
    useDashboardPeriod,
} from "@/hooks/reports/use-dashboard-overview";
import type { DashboardPeriodType } from "@/types";

/**
 * Selector de período do dashboard. Lê e escreve directamente no search param,
 * por isso pode ser montado no cabeçalho da página, longe dos gráficos.
 */
export function OverviewPeriodSelect() {
    const { period, setPeriod } = useDashboardPeriod();

    return (
        <Select
            value={period}
            onValueChange={(next) => setPeriod(next as DashboardPeriodType)}
        >
            <SelectTrigger
                className="w-[170px] shrink-0"
                aria-label="Período do dashboard"
            >
                <Icon name="Calendar" className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent align="end">
                {DASHBOARD_PERIODS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
