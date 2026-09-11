"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports-service";
import type { ManagerDashboardData } from "@/types";
import { useAuth } from "../auth/use-auth";
import { currentStoreStore } from "@/stores";

export function useManagerDashboard() {
  const { user } = useAuth();
  const { currentStore } = currentStoreStore();
  const storeId = currentStore?.id || user?.store?.id;

  const { data, isLoading, isError, refetch } = useQuery<ManagerDashboardData>({
    queryKey: ["manager-dashboard", storeId],
    queryFn: async () => {
      const response = await reportsService.getManagerDashboard(
        storeId as string
      );
      return response.data;
    },
    enabled: !!storeId,
    gcTime: 300_000,
    retry: 1,
  });

  return {
    dashboardData: data,
    isLoading: isLoading || (!!user && !storeId),
    isError,
    refetch,
  };
}
