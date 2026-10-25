"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { calendarService, type NewEvent } from "@/services/calendar-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Calendario escolar do ano letivo ativo: eventos, feriados/pontes (reconciliacao) e ligacao ao Google Calendar. */
export function useCalendar() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const on = Boolean(schoolId);
  const year = useQuery({ queryKey: ["active-year", schoolId], queryFn: academicService.activeYear, enabled: on, staleTime: 5 * 60 * 1000 });
  const yearId = year.data?.id;
  const events = useQuery({ queryKey: ["calendar-events", schoolId, yearId], queryFn: () => calendarService.events(yearId!), enabled: on && Boolean(yearId), staleTime: 20 * 1000 });
  const holidays = useQuery({ queryKey: ["calendar-holidays", schoolId, yearId], queryFn: () => calendarService.holidays(yearId!), enabled: on && Boolean(yearId), staleTime: 30 * 1000 });
  const google = useQuery({ queryKey: ["google-integration", schoolId], queryFn: calendarService.googleStatus, enabled: on, staleTime: 30 * 1000, retry: false });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["calendar-events", schoolId] });
    qc.invalidateQueries({ queryKey: ["calendar-holidays", schoolId] });
  };
  const createEvent = useMutation({ mutationFn: (v: Omit<NewEvent, "academicYearId">) => calendarService.createEvent({ ...v, academicYearId: yearId! }), onSuccess: refresh });
  const approve = useMutation({ mutationFn: calendarService.approve, onSuccess: refresh });
  const publish = useMutation({ mutationFn: (v: { id: string; confirm?: boolean }) => calendarService.publish(v.id, v.confirm), onSuccess: refresh });
  const cancel = useMutation({ mutationFn: (v: { id: string; reason: string }) => calendarService.cancel(v.id, v.reason), onSuccess: refresh });
  const decide = useMutation({ mutationFn: calendarService.decideHoliday, onSuccess: refresh });
  const importNational = useMutation({ mutationFn: (mode: "preview" | "apply") => calendarService.importNational(yearId!, mode), onSuccess: refresh });
  const refreshGoogle = () => qc.invalidateQueries({ queryKey: ["google-integration", schoolId] });
  const connect = useMutation({ mutationFn: calendarService.googleConnect });
  const disconnect = useMutation({ mutationFn: calendarService.googleDisconnect, onSuccess: refreshGoogle });
  const resync = useMutation({ mutationFn: calendarService.googleResync, onSuccess: refreshGoogle });
  const pull = useMutation({ mutationFn: calendarService.googlePull, onSuccess: () => { refreshGoogle(); refresh(); } });

  return {
    year: year.data, events: events.data ?? [], eventsLoading: events.isLoading, holidays: holidays.data?.data ?? [], googleHolidays: Boolean(holidays.data?.sources.google),
    google: google.data, googleForbidden: (google.error as { response?: { status?: number } } | null)?.response?.status === 403,
    createEvent, approve, publish, cancel, decide, importNational, connect, disconnect, resync, pull,
  };
}
