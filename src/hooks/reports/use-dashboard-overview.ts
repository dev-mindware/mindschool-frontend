"use client";

import { useQueryState } from "nuqs";
import type { DashboardPeriodType } from "@/types";

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
 * Período ativo do dashboard, guardado no URL (`?period=`).
 * O selector fica no cabeçalho da página, fora da árvore que consome os dados: partilham o mesmo search param.
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
