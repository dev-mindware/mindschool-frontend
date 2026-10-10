"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { healthService, type CaseCategory, type HealthRecordInput } from "@/services/health-service";
import { studentsService } from "@/services/students-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

const forbidden = (e: unknown) => (e as { response?: { status?: number } } | null)?.response?.status === 403;

/** Enfermaria (atendimentos) e acompanhamento psicopedagogico. Cada area tem a sua permissao: um 403 vira `*Forbidden`. */
export function useHealth() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();

  const visitsQ = useQuery({ queryKey: ["health-visits", schoolId], queryFn: healthService.visits, enabled: Boolean(schoolId), staleTime: 15 * 1000, retry: (n, e) => !forbidden(e) && n < 2 });
  const casesQ = useQuery({ queryKey: ["psycho-cases", schoolId], queryFn: healthService.cases, enabled: Boolean(schoolId), staleTime: 15 * 1000, retry: (n, e) => !forbidden(e) && n < 2 });
  const { data: students = [] } = useQuery({ queryKey: ["students", schoolId], queryFn: () => studentsService.list(), enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const nameOf = useMemo(() => new Map(students.map((s) => [s.id, s.fullName])), [students]);

  const refreshVisits = () => queryClient.invalidateQueries({ queryKey: ["health-visits", schoolId] });
  const refreshCases = () => queryClient.invalidateQueries({ queryKey: ["psycho-cases", schoolId] });

  const addVisit = useMutation({
    mutationFn: (v: { studentId: string; reason: string; treatment?: string; guardianNotified: boolean }) => healthService.addVisit(v.studentId, v),
    onSuccess: refreshVisits,
  });
  const openCase = useMutation({ mutationFn: (v: { studentId: string; category: CaseCategory; summary: string }) => healthService.openCase(v.studentId, v), onSuccess: refreshCases });

  const visits = visitsQ.data ?? [];
  const cases = casesQ.data ?? [];
  return {
    visits, cases, students, nameOf, addVisit, openCase,
    visitsLoading: visitsQ.isLoading, casesLoading: casesQ.isLoading,
    visitsForbidden: forbidden(visitsQ.error), casesForbidden: forbidden(casesQ.error),
    metrics: {
      visits: visits.length,
      today: visits.filter((v) => v.visited_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
      notNotified: visits.filter((v) => !v.guardian_notified).length,
      openCases: cases.filter((c) => c.status !== "encerrado").length,
    },
  };
}

export function useStudentHealth(studentId: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["student-health", schoolId, studentId];
  const q = useQuery({ queryKey: key, queryFn: () => healthService.record(studentId!), enabled: Boolean(schoolId && studentId), retry: (n, e) => !forbidden(e) && n < 2 });
  const save = useMutation({
    mutationFn: (v: HealthRecordInput) => healthService.saveRecord(studentId!, v),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  return { data: q.data, isLoading: q.isLoading, forbidden: forbidden(q.error), save };
}

export function usePsychoCase(id: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["psycho-case", schoolId, id];
  const q = useQuery({ queryKey: key, queryFn: () => healthService.caseDetail(id!), enabled: Boolean(schoolId && id) });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: ["psycho-cases", schoolId] });
  };
  const addSession = useMutation({ mutationFn: (v: { date: string; notes: string }) => healthService.addSession(id!, v), onSuccess: refresh });
  const setStatus = useMutation({ mutationFn: (status: "em_acompanhamento" | "encerrado") => healthService.setCaseStatus(id!, status), onSuccess: refresh });
  return { data: q.data, isLoading: q.isLoading, addSession, setStatus };
}
