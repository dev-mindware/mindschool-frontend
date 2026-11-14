"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { calendarService, type NewEvent, type UpdateEventPayload } from "@/services/calendar-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Resolve o ano lectivo seleccionado ou o ano corrente (`activo` -> `suspenso` -> primeiro). */
export function resolveSelectedAcademicYear<T extends { id: string; status: string }>(
  years: T[],
  selectedYearId?: string,
): T | undefined {
  return (
    (selectedYearId ? years.find((y) => y.id === selectedYearId) : undefined) ??
    years.find((y) => y.status === "activo") ??
    years.find((y) => y.status === "suspenso") ??
    years[0]
  );
}

/** Calendário escolar: aceita ano lectivo explícito ou resolve o ano corrente (`activo` → `suspenso` → primeiro). */
export function useCalendar(selectedYearId?: string) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const on = Boolean(schoolId);
  const yearsQuery = useQuery({ queryKey: ["academic-years", schoolId], queryFn: academicService.years, enabled: on, staleTime: 5 * 60 * 1000 });
  const years = useMemo(() => yearsQuery.data ?? [], [yearsQuery.data]);
  const activeYear = useMemo(
    () => resolveSelectedAcademicYear(years, selectedYearId),
    [years, selectedYearId],
  );
  const yearId = activeYear?.id;
  const events = useQuery({ queryKey: ["calendar-events", schoolId, yearId], queryFn: () => calendarService.events(yearId!), enabled: on && Boolean(yearId), staleTime: 20 * 1000 });
  const holidays = useQuery({ queryKey: ["calendar-holidays", schoolId, yearId], queryFn: () => calendarService.holidays(yearId!), enabled: on && Boolean(yearId), staleTime: 30 * 1000 });
  const checkQuery = useQuery({ queryKey: ["calendar-check", schoolId, yearId], queryFn: () => calendarService.check(yearId!), enabled: on && Boolean(yearId), staleTime: 30 * 1000 });
  const google = useQuery({ queryKey: ["google-integration", schoolId], queryFn: calendarService.googleStatus, enabled: on, staleTime: 30 * 1000, retry: false });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["calendar-events", schoolId] });
    qc.invalidateQueries({ queryKey: ["calendar-holidays", schoolId] });
    qc.invalidateQueries({ queryKey: ["calendar-check", schoolId] });
    qc.invalidateQueries({ queryKey: ["school-days", schoolId] });
  };
  const createEvent = useMutation({ mutationFn: (v: Omit<NewEvent, "academicYearId">) => calendarService.createEvent({ ...v, academicYearId: yearId! }), onSuccess: refresh });
  const updateEvent = useMutation({ mutationFn: (v: { id: string; payload: UpdateEventPayload }) => calendarService.updateEvent(v.id, v.payload), onSuccess: refresh });
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
    year: activeYear,
    years,
    events: events.data ?? [],
    eventsLoading: events.isLoading,
    holidays: holidays.data?.data ?? [],
    googleHolidays: Boolean(holidays.data?.sources.google),
    check: checkQuery.data,
    google: google.data,
    googleForbidden: (google.error as { response?: { status?: number } } | null)?.response?.status === 403,
    createEvent,
    updateEvent,
    approve,
    publish,
    cancel,
    decide,
    importNational,
    connect,
    disconnect,
    resync,
    pull,
  };
}
