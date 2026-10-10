"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Outcome, transitionsService } from "@/services/transitions-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Propostas de progressao (fim de ano) de uma turma e confirmacao humana da decisao. */
export function useTransitions(sectionId?: string) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["transitions", schoolId, sectionId];
  const query = useQuery({ queryKey: key, queryFn: () => transitionsService.rows(sectionId!), enabled: Boolean(schoolId && sectionId), staleTime: 30 * 1000 });
  const confirm = useMutation({
    mutationFn: (v: { enrollmentId: string; outcome: Outcome; justification: string }) => transitionsService.confirm(v.enrollmentId, v.outcome, v.justification),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  return { students: query.data ?? [], isLoading: query.isLoading, confirm };
}
