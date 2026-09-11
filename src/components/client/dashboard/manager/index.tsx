"use client";

import { useManagerDashboard } from "@/hooks/reports/use-manager-dashboard";
import { DashboardSkeleton, EmptyState } from "@/components";
import {
    DashboardSummaryCards,
    DashboardRevenueChart,
    DashboardSalesPie,
    DashboardRecentSalesTable
} from "../index";

export function ManagerDashboardView() {
    const { dashboardData, isLoading, isError } = useManagerDashboard();

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
                description="Ainda não existem vendas nem movimentos registados nesta loja para gerar o painel."
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

            <div className="grid grid-cols-1 gap-6">
                <div data-tour="dashboard-recent-sales">
                    <DashboardRecentSalesTable data={dashboardData.recentSales} />
                </div>
            </div>
        </div>
    );
}
