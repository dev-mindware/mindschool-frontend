"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonsService } from "@/services/lessons-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

const forbidden = (e: unknown) => (e as { response?: { status?: number } } | null)?.response?.status === 403;
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Aulas (ocorrencias do horario publicado), registo de realizacao e sumarios. */
export function useLessons(scope: "mine" | "all" = "mine") {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const on = Boolean(schoolId);
  const from = iso(new Date(Date.now() - 14 * 86_400_000));
  const to = iso(new Date(Date.now() + 14 * 86_400_000));
  const opts = { staleTime: 20 * 1000, retry: (n: number, e: unknown) => !forbidden(e) && n < 2 };

  const lessons = useQuery({ queryKey: ["lessons", schoolId, scope, from], queryFn: () => (scope === "mine" ? lessonsService.mine(from, to) : lessonsService.all(from, to)), enabled: on, ...opts });
  const missing = useQuery({ queryKey: ["summaries-missing", schoolId], queryFn: lessonsService.missingSummaries, enabled: on, ...opts });
  const stats = useQuery({ queryKey: ["lessons-stats", schoolId], queryFn: lessonsService.stats, enabled: on, ...opts });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["lessons", schoolId] });
    qc.invalidateQueries({ queryKey: ["summaries-missing", schoolId] });
    qc.invalidateQueries({ queryKey: ["lessons-stats", schoolId] });
  };
  const record = useMutation({ mutationFn: (v: { id: string; status: "realizada" | "nao_realizada"; reason?: string }) => lessonsService.record(v.id, v.status, v.reason), onSuccess: refresh });
  const cancel = useMutation({ mutationFn: (v: { id: string; reason: string }) => lessonsService.cancel(v.id, v.reason), onSuccess: refresh });
  const substitute = useMutation({ mutationFn: (v: { id: string; teacherId: string; reason: string }) => lessonsService.substitute(v.id, v.teacherId, v.reason), onSuccess: refresh });
  const reschedule = useMutation({ mutationFn: (v: { id: string; date: string; startMinute: number; endMinute: number }) => lessonsService.reschedule(v.id, v), onSuccess: refresh });
  const generate = useMutation({ mutationFn: () => lessonsService.generate(from, to), onSuccess: refresh });
  return {
    lessons: lessons.data ?? [], isLoading: lessons.isLoading, forbidden: forbidden(lessons.error), missing: missing.data ?? [], stats: stats.data ?? [], record, cancel, substitute, reschedule, generate, refresh,
  };
}

export function useLessonSummary(lessonId: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const key = ["lesson-summary", schoolId, lessonId];
  const q = useQuery({ queryKey: key, queryFn: () => lessonsService.summary(lessonId!), enabled: Boolean(schoolId && lessonId) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["summaries-missing", schoolId] });
  };
  const save = useMutation({ mutationFn: (v: { content: string; objectives?: string; homework?: string; submit: boolean }) => lessonsService.saveSummary(lessonId!, v), onSuccess: refresh });
  const review = useMutation({ mutationFn: (v: { summaryId: string; decision: "validado" | "devolvido"; note?: string }) => lessonsService.reviewSummary(v.summaryId, v.decision, v.note), onSuccess: refresh });
  return { summary: q.data, isLoading: q.isLoading, save, review };
}
