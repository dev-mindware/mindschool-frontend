"use client";

import { useQuery } from "@tanstack/react-query";
import { sectionsService } from "@/services/sections-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Turmas da escola ativa (API). */
export function useSections() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return useQuery({
    queryKey: ["sections", schoolId],
    queryFn: () => sectionsService.list(),
    enabled: Boolean(schoolId),
    staleTime: 5 * 60 * 1000,
  });
}
