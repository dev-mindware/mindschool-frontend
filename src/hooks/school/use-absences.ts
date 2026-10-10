"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

export interface AbsenceSummaryRow {
  enrollment_id: string;
  student: { id: string; full_name: string };
  lessons: number;
  present: number;
  late: number;
  justified_absences: number;
  unjustified_absences: number;
  absence_rate: number;
  attendance_rate: number | null;
}

export interface AbsenceRecord {
  id: string;
  date: string;
  status: "presente" | "atraso" | "falta_justificada" | "falta_injustificada";
  justification: string | null;
  section_subject_id: string;
}

/** Mapa de assiduidade da turma (faltas e taxa por aluno) e justificacao de faltas pela secretaria/direccao. */
export function useClassAbsences(sectionId: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return useQuery({
    queryKey: ["attendance-summary", schoolId, sectionId],
    queryFn: async () => (await api.get<{ data: AbsenceSummaryRow[] }>(`/s/sections/${sectionId}/attendance-summary`)).data.data,
    enabled: Boolean(schoolId && sectionId),
    staleTime: 20 * 1000,
  });
}

export function useEnrollmentAbsences(enrollmentId: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const key = ["enrollment-attendance", schoolId, enrollmentId];
  const q = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<{ data: AbsenceRecord[] }>(`/s/enrollments/${enrollmentId}/attendance`)).data.data,
    enabled: Boolean(schoolId && enrollmentId),
  });
  const justify = useMutation({
    mutationFn: async (v: { id: string; justification: string }) => (await api.post(`/s/student-attendance/${v.id}/justify`, { justification: v.justification })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["attendance-summary", schoolId] });
    },
  });
  return { records: q.data ?? [], isLoading: q.isLoading, justify };
}
