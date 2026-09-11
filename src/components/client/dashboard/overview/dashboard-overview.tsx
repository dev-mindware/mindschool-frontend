"use client";

import {
    DashboardSkeleton,
    EmptyState,
    FeatureGate,
    RequestError,
} from "@/components";
import { useDashboardOverview } from "@/hooks/reports/use-dashboard-overview";
import { StoresBreakdownTable } from "../stores-breakdown-table";
import { OverviewSummaryCards } from "./overview-summary-cards";
import { OverviewFinancialChart } from "./overview-financial-chart";
import { OverviewSalesDonut } from "./overview-sales-donut";
import { OverviewClientsCard } from "./overview-clients-card";
import { OverviewReceivablesCard } from "./overview-receivables-card";
import { OverviewStockCard } from "./overview-stock-card";
import { OverviewRecentActivity } from "./overview-recent-activity";
import { OverviewMonthlyGoal } from "./overview-monthly-goal";

/**
 * Visão Geral do dashboard. Serve OWNER (consolidado) e gerente (âmbito da
 * loja) a partir do mesmo payload — o âmbito é resolvido em
 * `useDashboardOverview`. A tabela de lojas só aparece no consolidado.
 */
export function DashboardOverview() {
    const { overview, period, isLoading, isError, refetch } =
        useDashboardOverview();

    if (isLoading) return <DashboardSkeleton />;

    if (isError) {
        return (
            <RequestError
                refetch={refetch}
                message="Erro ao carregar os dados do dashboard."
            />
        );
    }

    if (!overview) {
        return (
            <EmptyState
                title="Dashboard sem dados"
                description="Ainda não existem vendas nem movimentos registados para gerar o painel."
                icon="TrendingUp"
            />
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <div data-tour="dashboard-summary">
                <OverviewSummaryCards
                    summary={overview.summaryCards}
                    period={period}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2" data-tour="dashboard-revenue">
                    <OverviewFinancialChart evolution={overview.financialEvolution} />
                </div>
                <div data-tour="dashboard-distribution">
                    <OverviewSalesDonut distribution={overview.salesDistribution} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                <OverviewClientsCard clients={overview.clientsOverview} />
                <OverviewReceivablesCard receivables={overview.accountsReceivable} />
                <OverviewStockCard stock={overview.stockOverview} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2" data-tour="dashboard-recent-sales">
                    <OverviewRecentActivity activity={overview.recentActivity} />
                </div>
                <OverviewMonthlyGoal goal={overview.monthlyGoal} />
            </div>

            {overview.storesBreakdown && overview.storesBreakdown.length > 0 && (
                <FeatureGate minPlan="Pro" fallback="hidden">
                    <StoresBreakdownTable data={overview.storesBreakdown} />
                </FeatureGate>
            )}
        </div>
    );
}
