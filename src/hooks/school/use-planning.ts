"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { planningService, type PlanKind, type PlanStatus } from "@/services/planning-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Dosificações e planos de aula da escola ativa (o professor vê os seus; a direção, os submetidos). */
export function useTeachingPlans(filter: { kind?: PlanKind; status?: PlanStatus } = {}) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["teaching-plans", schoolId] });

  const query = useQuery({
    queryKey: ["teaching-plans", schoolId, filter.kind, filter.status],
    queryFn: () => planningService.list(filter),
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
  });

  return {
    plans: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    create: useMutation({ mutationFn: planningService.create, onSuccess: invalidate }),
    update: useMutation({ mutationFn: (v: { id: string; title?: string; lessonDate?: string | null; content?: unknown }) => planningService.update(v.id, v), onSuccess: invalidate }),
    submit: useMutation({ mutationFn: (id: string) => planningService.submit(id), onSuccess: invalidate }),
    review: useMutation({ mutationFn: (v: { id: string; decision: "aprovado" | "devolvido"; note?: string }) => planningService.review(v.id, v.decision, v.note), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => planningService.remove(id), onSuccess: invalidate }),
  };
}
