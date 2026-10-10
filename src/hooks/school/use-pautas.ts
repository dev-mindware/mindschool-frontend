"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gradesService } from "@/services/grades-service";
import { pautasService } from "@/services/pautas-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { AssessmentTerm } from "@/types/grade";

/** Pautas consolidadas de todas as turmas num trimestre + fecho/reabertura (Direccao Pedagogica). */
export function usePautas(term: AssessmentTerm, sectionIds: string[]) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pautas", schoolId, term, sectionIds.join(",")],
    queryFn: async () => {
      const terms = await gradesService.terms();
      const rows = await Promise.all(sectionIds.map((id) => pautasService.consolidated(id, term, terms).catch(() => null)));
      return rows.filter((r): r is NonNullable<typeof r> => r !== null);
    },
    enabled: Boolean(schoolId) && sectionIds.length > 0,
    staleTime: 15 * 1000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["pautas", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["grade-sheet", schoolId] });
  };
  const close = useMutation({
    mutationFn: (v: { sectionId: string; term: AssessmentTerm; notes?: string }) => pautasService.close(v.sectionId, v.term, v.notes),
    onSuccess: invalidate,
  });
  const reopen = useMutation({
    mutationFn: (v: { sectionId: string; term: AssessmentTerm; reason: string }) => pautasService.reopen(v.sectionId, v.term, v.reason),
    onSuccess: invalidate,
  });

  return { pautas: query.data ?? [], isLoading: query.isLoading, close, reopen };
}
