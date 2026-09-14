"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { reportsService } from "@/services/reports-service";
import { useAuth } from "../auth/use-auth";
import { useMultiSchoolStore } from "@/stores";
import type { DashboardOverview, DashboardPeriodType } from "@/types";

export const DASHBOARD_PERIODS: {
  value: DashboardPeriodType;
  label: string;
}[] = [
  { value: "month", label: "Este mês" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este ano" },
];

const isPeriod = (value: string): value is DashboardPeriodType =>
  DASHBOARD_PERIODS.some((option) => option.value === value);

/**
 * Período activo do dashboard, guardado no URL (`?period=`).
 *
 * Vive à parte de `useDashboardOverview` porque o selector fica no cabeçalho
 * da página, fora da árvore que consome os dados — partilham o mesmo search
 * param, por isso não há estado duplicado nem query extra.
 */
export function useDashboardPeriod() {
  const [rawPeriod, setPeriod] = useQueryState("period", {
    defaultValue: "month",
    shallow: true,
  });

  return {
    period: (isPeriod(rawPeriod) ? rawPeriod : "month") as DashboardPeriodType,
    setPeriod,
  };
}

const MOCK_SCHOOL_DASHBOARD_OVERVIEW: DashboardOverview = {
  title: "Painel de Gestão Escolar - MindSchool",
  period: {
    type: "month",
    label: "Este mês",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
  },
  summaryCards: {
    revenue: {
      label: "Arrecadação de Propinas",
      value: 18450000,
      variationPercent: 12.4,
      currency: "Kz",
    },
    sales: {
      label: "Matrículas Activas",
      value: 1240,
      variationPercent: 8.5,
    },
    clients: {
      label: "Encarregados de Educação",
      value: 980,
      variationPercent: 5.2,
    },
    stock: {
      label: "Alunos em Risco de Abandono",
      value: 14,
      variationPercent: -18.2,
    },
  },
  financialEvolution: {
    label: "Evolução da Arrecadação",
    range: "Últimos 6 meses",
    series: [
      { month: "Abr", revenue: 14200000, expenses: 8500000, profit: 5700000 },
      { month: "Mai", revenue: 15600000, expenses: 9100000, profit: 6500000 },
      { month: "Jun", revenue: 16800000, expenses: 8800000, profit: 8000000 },
      { month: "Jul", revenue: 16100000, expenses: 8900000, profit: 7200000 },
      { month: "Ago", revenue: 17300000, expenses: 9400000, profit: 7900000 },
      { month: "Set", revenue: 18450000, expenses: 9200000, profit: 9250000 },
    ],
  },
  salesDistribution: {
    label: "Distribuição por Categoria",
    totalSales: 18450000,
    products: {
      count: 940,
      percentage: 82,
      amount: 15129000,
      currency: "Kz",
    },
    services: {
      count: 300,
      percentage: 18,
      amount: 3321000,
      currency: "Kz",
    },
  },
  clientsOverview: {
    totalClients: 1240,
    newClientsThisMonth: 45,
    newClientsVariationPercent: 12.5,
    recurringClientsPercentage: 96.3,
    clientsWithDebt: 68,
    clientsWithDebtVariationPercent: -15.0,
  },
  accountsReceivable: {
    total: 3450000,
    currency: "Kz",
    buckets: [
      { key: "overdue", label: "Vencidas (> 30 dias)", amount: 1200000, percentage: 34.8 },
      { key: "due_7_days", label: "Vence em 7 dias", amount: 1450000, percentage: 42.0 },
      { key: "due_30_days", label: "Vence este mês", amount: 800000, percentage: 23.2 },
    ],
  },
  stockOverview: {
    stockValue: 1240,
    currency: "Alunos",
    normalStockItems: 1180,
    lowStockItems: 46,
    outOfStockItems: 14,
  },
  recentActivity: [
    {
      id: "act-1",
      type: "payment_received",
      title: "Propina Setembro - Pedro Gaspar (10ª A)",
      amount: 25000,
      currency: "Kz",
      createdAt: new Date().toISOString(),
      reference: "REC-2026-0891",
    },
    {
      id: "act-2",
      type: "invoice_created",
      title: "Declaração com Notas - Joana Domingos",
      amount: 5000,
      currency: "Kz",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      reference: "DOC-2026-0142",
    },
    {
      id: "act-3",
      type: "client_added",
      title: "Nova Matrícula Confirmada - Manuel Silva (7ª B)",
      amount: null,
      currency: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      reference: "MAT-2026-1240",
    },
  ],
  monthlyGoal: {
    target: 20000000,
    current: 18450000,
    percentage: 92.25,
    remaining: 1550000,
    currency: "Kz",
  },
  storesBreakdown: [
    {
      storeId: "store-1",
      storeName: "Campus Central (Sede)",
      totalSales: 12500000,
      productsSold: 850,
      servicesRendered: 180,
    },
    {
      storeId: "store-2",
      storeName: "Campus Talatona",
      totalSales: 5950000,
      productsSold: 390,
      servicesRendered: 120,
    },
  ],
};

export function useDashboardOverview() {
  const { user } = useAuth();
  const { selectedUnitId } = useMultiSchoolStore();
  const { period, setPeriod } = useDashboardPeriod();
  const isBypass = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

  // OWNER vê o consolidado da empresa; os restantes vêem o âmbito da sua escola.
  const isOwner = user?.role === "OWNER";
  const storeId = isOwner ? undefined : selectedUnitId || user?.store?.id;

  const { data, isLoading, isError, refetch } = useQuery<DashboardOverview>({
    queryKey: ["dashboard-overview", period, storeId ?? "global"],
    queryFn: async () => {
      const response = await reportsService.getDashboardOverview({
        period,
        storeId,
      });
      return response.data;
    },
    enabled: !isBypass && (isOwner || !!storeId),
    staleTime: 10_000,
    gcTime: 300_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    overview: isBypass ? MOCK_SCHOOL_DASHBOARD_OVERVIEW : (data || (isError ? MOCK_SCHOOL_DASHBOARD_OVERVIEW : undefined)),
    period,
    setPeriod,
    isLoading: isBypass ? false : (isLoading || (!!user && !isOwner && !storeId)),
    isError: isBypass ? false : isError,
    refetch,
  };
}
