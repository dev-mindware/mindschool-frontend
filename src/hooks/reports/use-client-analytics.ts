"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ClientAnalyticsResponse } from "@/types";
import { excludeFinalConsumer } from "@/utils";

export function useClientAnalytics() {
  const [reportType, setReportType] = useState("top");
  const [limit, setLimit] = useState("10");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(2024, 0, 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(2026, 11, 31)
  );

  const { data, isLoading, isError, refetch } =
    useQuery<ClientAnalyticsResponse>({
      queryKey: ["client-analytics", reportType, limit, startDate, endDate],
      queryFn: async () => {
        const response = await api.get("/reports/client-analytics", {
          params: {
            type: reportType,
            limit: parseInt(limit),
            startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
            endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
          },
        });
        const report = response.data as ClientAnalyticsResponse;
        const clients = excludeFinalConsumer(report.clients);
        const excludedClients = report.clients.length - clients.length;

        return {
          ...report,
          clients,
          count: Math.max(0, report.count - excludedClients),
          summary: {
            ...report.summary,
            totalClients: Math.max(
              0,
              report.summary.totalClients - excludedClients,
            ),
          },
        };
      },
      gcTime: 300_000,
      retry: 1,
    });

  return {
    data,
    isLoading,
    isError,
    refetch,
    reportType,
    setReportType,
    limit,
    setLimit,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };
}
