"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services";

export function usePosManagementDashboard() {
  return useQuery({
    queryKey: ["reports", "dashboard", "pos-management"],
    queryFn: async () => {
      const response = await reportsService.getPosManagementDashboard();
      return response.data;
    },
    gcTime: 300_000,
    retry: 1,
  });
}
