"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { calendarService, type EventAudience } from "@/services/calendar-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { resolveSelectedAcademicYear } from "./use-calendar";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Dias lectivos do mês visível (e a margem que a grelha mostra), vindos do motor da API: disponível em todos os planos.
 */
export function useSchoolDays(month: Date, selectedYearId?: string) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const on = Boolean(schoolId);
  const from = iso(new Date(month.getFullYear(), month.getMonth(), -6));
  const to = iso(new Date(month.getFullYear(), month.getMonth() + 1, 7));

  const yearsQuery = useQuery({ queryKey: ["academic-years", schoolId], queryFn: academicService.years, enabled: on, staleTime: 5 * 60 * 1000 });
  const years = useMemo(() => yearsQuery.data ?? [], [yearsQuery.data]);
  const year = useMemo(
    () => resolveSelectedAcademicYear(years, selectedYearId),
    [years, selectedYearId],
  );
  const days = useQuery({ queryKey: ["school-days", schoolId, from, to], queryFn: () => calendarService.schoolDays(from, to), enabled: on, staleTime: 30 * 1000 });

  const refresh = () => qc.invalidateQueries({ queryKey: ["school-days", schoolId] });
  const mark = useMutation({ mutationFn: calendarService.markNonLective, onSuccess: refresh });
  const updateMark = useMutation({
    mutationFn: (v: { eventId: string; startDate?: string; endDate?: string; title?: string; justification: string; audience?: EventAudience }) =>
      calendarService.updateMarkNonLective(v.eventId, v),
    onSuccess: refresh,
  });
  const unmark = useMutation({ mutationFn: calendarService.unmarkNonLective, onSuccess: refresh });

  return { year, years, days: days.data ?? [], isLoading: days.isLoading, mark, updateMark, unmark };
}
