"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** BI & Analytics da escola activa: tendências por ano lectivo e assiduidade por mês (só agregados). */
export function useAnalytics(years = 5) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const q = useQuery({ queryKey: ["analytics-trends", schoolId, years], queryFn: () => analyticsService.trends(years), enabled: Boolean(schoolId), staleTime: 60 * 1000, retry: false });
  return { trends: q.data, isLoading: q.isLoading, error: q.error };
}
