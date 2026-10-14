"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { AttendanceStatus } from "@/types";

interface ApiRow {
  enrollment_id: string;
  student: { id: string; full_name: string; gender?: "M" | "F" | null };
  attendance_id: string | null;
  status: "presente" | "atraso" | "falta_justificada" | "falta_injustificada" | null;
  justification: string | null;
}

const FROM_API: Record<NonNullable<ApiRow["status"]>, AttendanceStatus> = {
  presente: "PRESENT",
  atraso: "LATE",
  falta_justificada: "ABSENT_JUSTIFIED",
  falta_injustificada: "ABSENT_UNJUSTIFIED",
};
const TO_API: Record<AttendanceStatus, NonNullable<ApiRow["status"]>> = {
  PRESENT: "presente",
  LATE: "atraso",
  ABSENT_JUSTIFIED: "falta_justificada",
  ABSENT_UNJUSTIFIED: "falta_injustificada",
};

export interface RollCallStudent {
  id: string; // matricula
  name: string;
  number: string;
  gender: "M" | "F";
  status?: AttendanceStatus;
  notes?: string;
}

/** Chamada de uma disciplina numa turma e data (`/sections/:id/subjects/:ss/attendance/:date`). */
export function useRollCall(sectionId: string, sectionSubjectId: string | undefined, date: string) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["roll-call", schoolId, sectionId, sectionSubjectId, date];
  const url = `/s/sections/${sectionId}/subjects/${sectionSubjectId}/attendance/${date}`;

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<RollCallStudent[]> =>
      (await api.get<{ data: ApiRow[] }>(url)).data.data.map((r, i) => ({
        id: r.enrollment_id,
        name: r.student.full_name,
        number: String(i + 1).padStart(2, "0"),
        gender: r.student.gender === "F" ? "F" : "M",
        status: r.status ? FROM_API[r.status] : undefined,
        notes: r.justification ?? undefined,
      })),
    enabled: Boolean(schoolId && sectionId && sectionSubjectId && date),
    staleTime: 10 * 1000,
  });

  const save = useMutation({
    mutationFn: async (records: Array<{ enrollmentId: string; status: AttendanceStatus; notes?: string }>) =>
      api.put(url, {
        records: records.map((r) => ({
          enrollment_id: r.enrollmentId,
          status: TO_API[r.status],
          ...(r.status === "ABSENT_JUSTIFIED" ? { justification: r.notes && r.notes.trim().length >= 3 ? r.notes.trim() : "Justificada" } : {}),
        })),
      }),
    onMutate: async (records) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RollCallStudent[]>(key);
      if (previous) {
        const byId = new Map(records.map((r) => [r.enrollmentId, r]));
        queryClient.setQueryData<RollCallStudent[]>(
          key,
          previous.map((s) => {
            const update = byId.get(s.id);
            if (!update) return s;
            return {
              ...s,
              status: update.status,
              notes: update.notes !== undefined ? update.notes : s.notes,
            };
          }),
        );
      }
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return { students: query.data ?? [], isLoading: query.isLoading, isError: query.isError, save };
}
