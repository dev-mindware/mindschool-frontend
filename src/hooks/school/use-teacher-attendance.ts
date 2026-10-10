"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { TeacherAttendanceLog, TeacherAttendanceMetrics, TeacherDayStatus, TeacherQrCredential } from "@/types/teacher-attendance";

interface ApiDaily {
  date: string;
  summary: { teachers: number; present: number; left: number; absent: number; flagged: number };
  data: Array<{
    teacher: { id: string; full_name: string };
    status: "presente" | "saiu" | "ausente" | string;
    first_entry_at: string | null;
    last_event_at: string | null;
    events_count: number;
    flagged_for_review: boolean;
  }>;
}

const STATUS: Record<string, TeacherDayStatus> = { presente: "PRESENT", saiu: "PRESENT", ausente: "ABSENT" };
const time = (iso: string | null) => (iso ? new Date(iso).toTimeString().slice(0, 8) : undefined);

/**
 * Assiduidade dos professores no dia (API `attendance/teachers`), com a forma do antigo store.
 * A leitura de QR, os cartoes e a justificacao de ausencias ainda nao tem ecra ligado a API.
 */
export function useTeacherAttendance() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [filterStatus, setStatusFilter] = useState<TeacherDayStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-attendance", schoolId],
    queryFn: async () => (await api.get<ApiDaily>("/s/attendance/teachers")).data,
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const attendanceLogs: TeacherAttendanceLog[] = (data?.data ?? []).map((r) => ({
    id: r.teacher.id,
    teacherId: r.teacher.id,
    teacherName: r.teacher.full_name,
    teacherCode: r.teacher.id.slice(-6).toUpperCase(),
    department: "",
    date: data?.date ?? "",
    checkInTime: time(r.first_entry_at),
    checkOutTime: r.status === "saiu" ? time(r.last_event_at) : undefined,
    status: STATUS[r.status] ?? "ABSENT",
    scheduledClassesCount: 0,
    completedClassesCount: 0,
  }));

  const total = data?.summary.teachers ?? 0;
  const present = data?.summary.present ?? 0;
  const metrics: TeacherAttendanceMetrics = {
    totalTeachers: total,
    presentToday: present + (data?.summary.left ?? 0),
    absentToday: data?.summary.absent ?? 0,
    lateArrivalsToday: 0,
    punctualityRatePercentage: total > 0 ? Math.round(((present + (data?.summary.left ?? 0)) / total) * 100) : 0,
    classesFulfillmentPercentage: 0,
  };

  const unavailable = () => {
    throw new Error("Esta operação ainda não está ligada à API.");
  };

  return {
    attendanceLogs,
    credentials: [] as TeacherQrCredential[],
    isLoading,
    filterStatus,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    /** Leitura do QR (terminal): a API alterna entrada/saida e ignora leituras repetidas em 30 s. */
    registerScan: async (code: string, terminal = "TERMINAL-WEB") => {
      try {
        const { data: r } = await api.post<{ duplicate?: boolean; teacher: { full_name: string }; event_type: "entrada" | "saida"; recorded_at: string; flagged_for_review: boolean }>("/s/attendance/scans", { code, reader_device_id: terminal });
        queryClient.invalidateQueries({ queryKey: ["teacher-attendance", schoolId] });
        return {
          success: true,
          type: r.event_type === "entrada" ? ("CHECK_IN" as const) : ("CHECK_OUT" as const),
          teacherName: r.teacher.full_name,
          time: new Date(r.recorded_at).toTimeString().slice(0, 8),
          message: r.duplicate ? "Leitura repetida ignorada (menos de 30 s)." : r.flagged_for_review ? "Registado, mas sinalizado para revisão (fora de qualquer aula do horário)." : "Registo efectuado.",
        };
      } catch (e) {
        const msg = (e as { message?: string }).message ?? "Leitura recusada.";
        return { success: false, type: "CHECK_IN" as const, teacherName: "", time: "", message: msg };
      }
    },
    justifyAbsence: (_teacherId: string, _reason: string, _doc?: string) => unavailable(),
    toggleCardPrinted: (_teacherId: string) => undefined,
    getMetrics: () => metrics,
  };
}
