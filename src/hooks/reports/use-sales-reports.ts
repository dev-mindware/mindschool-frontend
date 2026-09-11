"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { SalesReportData, SalesPeriod } from "@/types/reports";

export function useSalesReports() {
  const [period, setPeriod] = useState<SalesPeriod>("monthly");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(2024, 0, 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const { data, isLoading, isError, refetch } = useQuery<SalesReportData>({
    queryKey: ["sales-reports", period, startDate, endDate],
    queryFn: async () => {
      const response = await api.get("/reports/sales", {
        params: {
          period,
          startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        },
      });
      return response.data;
    },
    gcTime: 300_000, // 5 minutes
    retry: 1,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
    period,
    setPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };
}
