"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { reportsService } from "@/services/reports-service";
import { useAuth } from "../auth/use-auth";
import { currentStoreStore } from "@/stores";
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

export function useDashboardOverview() {
  const { user } = useAuth();
  const { currentStore } = currentStoreStore();
  const { period, setPeriod } = useDashboardPeriod();

  // OWNER vê o consolidado da empresa; os restantes vêem o âmbito da sua loja.
  const isOwner = user?.role === "OWNER";
  const storeId = isOwner ? undefined : currentStore?.id || user?.store?.id;

  const { data, isLoading, isError, refetch } = useQuery<DashboardOverview>({
    queryKey: ["dashboard-overview", period, storeId ?? "global"],
    queryFn: async () => {
      const response = await reportsService.getDashboardOverview({
        period,
        storeId,
      });
      return response.data;
    },
    enabled: isOwner || !!storeId,
    staleTime: 10_000,
    gcTime: 300_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    overview: data,
    period,
    setPeriod,
    isLoading: isLoading || (!!user && !isOwner && !storeId),
    isError,
    refetch,
  };
}
