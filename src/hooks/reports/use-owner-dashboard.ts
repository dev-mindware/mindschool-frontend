"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports-service";
import type { OwnerDashboardData } from "@/types";

export function useOwnerDashboard() {
  const { data, isLoading, isError, refetch } = useQuery<OwnerDashboardData>({
    queryKey: ["owner-dashboard"],
    queryFn: async () => {
      const response = await reportsService.getOwnerDashboard();
      return response.data;
    },
    gcTime: 300_000, // 5 minutes
    retry: 1,
  });

  return {
    dashboardData: data,
    isLoading,
    isError,
    refetch,
  };
}
