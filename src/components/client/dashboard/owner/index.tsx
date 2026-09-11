"use client";

import { useOwnerDashboard } from "@/hooks/reports/use-owner-dashboard";
import { DashboardSkeleton, EmptyState, FeatureGate } from "@/components";
import {
    DashboardSummaryCards,
    DashboardRevenueChart,
    DashboardSalesPie,
    StoresBreakdownTable,
    DashboardRecentSalesTable
} from "../index";

export function OwnerDashboardView() {
    const { dashboardData, isLoading, isError } = useOwnerDashboard();

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">Erro ao carregar dados do dashboard.</p>
            </div>
        );
    }

    const isEmpty = !dashboardData ||
        (dashboardData.summary.totalSales.total === 0 &&
            dashboardData.recentSales.length === 0);

    if (isEmpty) {
        return (
            <EmptyState
                title="Dashboard sem dados"
                description="Ainda não existem vendas nem movimentos registados para gerar o painel."
                icon="TrendingUp"
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div data-tour="dashboard-summary">
                <DashboardSummaryCards summary={dashboardData.summary} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2" data-tour="dashboard-revenue">
                    <DashboardRevenueChart data={dashboardData.revenueEvolution} />
                </div>
                <div data-tour="dashboard-distribution">
                    <DashboardSalesPie data={dashboardData.salesDistribution} />
                </div>
            </div>

            <FeatureGate minPlan="Pro" fallback="hidden">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <StoresBreakdownTable data={dashboardData.storesBreakdown} />
                <div data-tour="dashboard-recent-sales">
                    <DashboardRecentSalesTable data={dashboardData.recentSales} />
                </div>
            </div>
            </FeatureGate>
        </div>
    );
}
