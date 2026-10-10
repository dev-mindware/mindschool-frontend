"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { sectionsService } from "@/services/sections-service";
import { timetablesService, type NewChange, type Shift } from "@/services/timetables-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

const SHIFT: Record<string, Shift> = { MORNING: "manha", AFTERNOON: "tarde", EVENING: "noite" };

/** Horarios (versoes), tempos (campainha), salas e a grelha por turma/professor da escola activa. */
export function useTimetables(timetableId?: string) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const on = Boolean(schoolId);

  const list = useQuery({ queryKey: ["timetables", schoolId], queryFn: timetablesService.list, enabled: on, staleTime: 20 * 1000 });
  const bells = useQuery({ queryKey: ["bell-schedules", schoolId], queryFn: timetablesService.bells, enabled: on, staleTime: 60 * 1000 });
  const rooms = useQuery({ queryKey: ["rooms", schoolId], queryFn: timetablesService.rooms, enabled: on, staleTime: 60 * 1000 });
  const sections = useQuery({ queryKey: ["sections", schoolId], queryFn: () => sectionsService.list(), enabled: on, staleTime: 60 * 1000 });
  const assignments = useQuery({ queryKey: ["assignments", schoolId], queryFn: academicService.assignments, enabled: on, staleTime: 60 * 1000 });
  const year = useQuery({ queryKey: ["active-year", schoolId], queryFn: academicService.activeYear, enabled: on, staleTime: 5 * 60 * 1000 });
  const changes = useQuery({ queryKey: ["timetable-changes", schoolId, timetableId], queryFn: () => timetablesService.changes(timetableId!), enabled: on && Boolean(timetableId), staleTime: 15 * 1000 });
  const entries = useQuery({ queryKey: ["timetable-entries", schoolId, timetableId], queryFn: () => timetablesService.entries(timetableId!), enabled: on && Boolean(timetableId), staleTime: 10 * 1000 });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["timetables", schoolId] });
    qc.invalidateQueries({ queryKey: ["timetable-entries", schoolId] });
  };
  const create = useMutation({ mutationFn: (cloneFrom?: string) => timetablesService.create(year.data!.id, cloneFrom), onSuccess: refresh });
  const addEntry = useMutation({ mutationFn: (v: { sectionSubjectId: string; weekday: number; firstSlot: number; span: number; roomId?: string }) => timetablesService.addEntry(timetableId!, v), onSuccess: refresh });
  const removeEntry = useMutation({ mutationFn: (entryId: string) => timetablesService.removeEntry(timetableId!, entryId), onSuccess: refresh });
  const validate = useMutation({ mutationFn: () => timetablesService.validate(timetableId!), onSuccess: refresh });
  const publish = useMutation({ mutationFn: () => timetablesService.publish(timetableId!), onSuccess: refresh });
  const refreshRooms = () => qc.invalidateQueries({ queryKey: ["rooms", schoolId] });
  const createRoom = useMutation({ mutationFn: timetablesService.createRoom, onSuccess: refreshRooms });
  const setRoomActive = useMutation({ mutationFn: (v: { id: string; isActive: boolean }) => timetablesService.setRoomActive(v.id, v.isActive), onSuccess: refreshRooms });
  const requestChange = useMutation({ mutationFn: (v: NewChange) => timetablesService.requestChange(timetableId!, v), onSuccess: () => { refresh(); qc.invalidateQueries({ queryKey: ["timetable-changes", schoolId] }); } });
  const createBell = useMutation({ mutationFn: timetablesService.createBell, onSuccess: () => qc.invalidateQueries({ queryKey: ["bell-schedules", schoolId] }) });

  /** Tempos de aula do turno da turma (a grelha de campainha mais recente desse turno). */
  const slotsFor = useMemo(
    () => (sectionShift: string) => {
      const shift = SHIFT[sectionShift];
      const bell = (bells.data ?? []).filter((b) => b.shift === shift).sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0];
      return bell?.slots ?? [];
    },
    [bells.data],
  );

  return {
    timetables: list.data ?? [], bells: bells.data ?? [], rooms: rooms.data ?? [], sections: sections.data ?? [], assignments: assignments.data ?? [],
    entries: entries.data ?? [], isLoading: list.isLoading, hasYear: Boolean(year.data), slotsFor, create, addEntry, removeEntry, validate, publish, createBell, createRoom, setRoomActive, requestChange, changes: changes.data ?? [],
  };
}
