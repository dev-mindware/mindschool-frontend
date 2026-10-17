"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { sectionsService } from "@/services/sections-service";
import { timetablesService, type NewChange, type Shift } from "@/services/timetables-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

const SHIFT: Record<string, Shift> = { MORNING: "manha", AFTERNOON: "tarde", EVENING: "noite", DIURNO: "diurno" };

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

  const subjects = useQuery({ queryKey: ["subjects", schoolId], queryFn: academicService.subjects, enabled: on, staleTime: 60 * 1000 });
  const teachers = useQuery({ queryKey: ["teachers", schoolId], queryFn: academicService.teachers, enabled: on, staleTime: 60 * 1000 });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["timetables", schoolId] });
    qc.invalidateQueries({ queryKey: ["timetable-entries", schoolId] });
  };
  const create = useMutation({ mutationFn: (cloneFrom?: string) => timetablesService.create(year.data!.id, cloneFrom), onSuccess: refresh });
  const addEntry = useMutation({
    mutationFn: (v: { sectionSubjectId: string; weekday: number; firstSlot: number; span: number; roomId?: string; shift?: Shift }) =>
      timetablesService.addEntry(timetableId!, v),
    onSuccess: refresh,
  });
  const addLesson = useMutation({
    mutationFn: async (v: {
      sectionId: string;
      subjectId: string;
      teacherId: string;
      weekday: number;
      firstSlot?: number;
      span?: number;
      startTime?: string;
      endTime?: string;
      roomId?: string;
      shift?: Shift;
    }) => {
      // 1. Localizar ou provisionar a atribuição (SectionSubject)
      const currentAssignments = assignments.data ?? [];
      const match = currentAssignments.find(
        (a) => a.sectionId === v.sectionId && a.subjectId === v.subjectId,
      );
      let sectionSubjectId = match?.id;
      if (!sectionSubjectId) {
        const created = await academicService.assign({
          sectionId: v.sectionId,
          subjectId: v.subjectId,
          teacherId: v.teacherId,
          weeklyHours: Math.max(v.span ?? 1, 2),
        });
        sectionSubjectId = created.id;
        qc.invalidateQueries({ queryKey: ["assignments", schoolId] });
      }
      // 2. Registar a aula no horário semanal
      return timetablesService.addEntry(timetableId!, {
        sectionSubjectId,
        weekday: v.weekday,
        firstSlot: v.firstSlot,
        span: v.span,
        startTime: v.startTime,
        endTime: v.endTime,
        roomId: v.roomId,
        shift: v.shift,
      });
    },
    onSuccess: () => {
      refresh();
      qc.invalidateQueries({ queryKey: ["assignments", schoolId] });
    },
  });
  const updateLesson = useMutation({
    mutationFn: async (v: {
      entryId: string;
      sectionId: string;
      subjectId: string;
      teacherId: string;
      weekday: number;
      firstSlot?: number;
      span?: number;
      startTime?: string;
      endTime?: string;
      roomId?: string;
      shift?: Shift;
    }) => {
      let currentAssignments = assignments.data ?? [];
      if (!currentAssignments || currentAssignments.length === 0) {
        currentAssignments = await academicService.assignments();
      }
      const match = currentAssignments.find(
        (a) => a.sectionId === v.sectionId && a.subjectId === v.subjectId,
      );
      let sectionSubjectId = match?.id;
      if (!sectionSubjectId) {
        const created = await academicService.assign({
          sectionId: v.sectionId,
          subjectId: v.subjectId,
          teacherId: v.teacherId,
          weeklyHours: Math.max(v.span ?? 1, 2),
        });
        sectionSubjectId = created.id;
        qc.invalidateQueries({ queryKey: ["assignments", schoolId] });
      }
      return timetablesService.updateEntry(timetableId!, v.entryId, {
        sectionSubjectId,
        weekday: v.weekday,
        firstSlot: v.firstSlot,
        span: v.span,
        startTime: v.startTime,
        endTime: v.endTime,
        roomId: v.roomId,
        shift: v.shift,
      });
    },
    onSuccess: () => {
      refresh();
      qc.invalidateQueries({ queryKey: ["assignments", schoolId] });
    },
  });
  const removeEntry = useMutation({ mutationFn: (entryId: string) => timetablesService.removeEntry(timetableId!, entryId), onSuccess: refresh });
  const validate = useMutation({ mutationFn: () => timetablesService.validate(timetableId!), onSuccess: refresh });
  const publish = useMutation({ mutationFn: () => timetablesService.publish(timetableId!), onSuccess: refresh });
  const refreshRooms = () => qc.invalidateQueries({ queryKey: ["rooms", schoolId] });
  const createRoom = useMutation({ mutationFn: timetablesService.createRoom, onSuccess: refreshRooms });
  const setRoomActive = useMutation({ mutationFn: (v: { id: string; isActive: boolean }) => timetablesService.setRoomActive(v.id, v.isActive), onSuccess: refreshRooms });
  const requestChange = useMutation({ mutationFn: (v: NewChange) => timetablesService.requestChange(timetableId!, v), onSuccess: () => { refresh(); qc.invalidateQueries({ queryKey: ["timetable-changes", schoolId] }); } });
  const createBell = useMutation({ mutationFn: timetablesService.createBell, onSuccess: () => qc.invalidateQueries({ queryKey: ["bell-schedules", schoolId] }) });

const DEFAULT_SLOTS: Record<Shift, Array<{ position: number; start: string; end: string; kind: "aula" | "intervalo" }>> = {
  manha: [
    { position: 1, start: "07:30", end: "08:15", kind: "aula" },
    { position: 2, start: "08:15", end: "09:00", kind: "aula" },
    { position: 3, start: "09:00", end: "09:15", kind: "intervalo" },
    { position: 4, start: "09:15", end: "10:00", kind: "aula" },
    { position: 5, start: "10:00", end: "10:45", kind: "aula" },
    { position: 6, start: "10:45", end: "11:00", kind: "intervalo" },
    { position: 7, start: "11:00", end: "11:45", kind: "aula" },
    { position: 8, start: "11:45", end: "12:30", kind: "aula" },
  ],
  tarde: [
    { position: 1, start: "13:00", end: "13:45", kind: "aula" },
    { position: 2, start: "13:45", end: "14:30", kind: "aula" },
    { position: 3, start: "14:30", end: "14:45", kind: "intervalo" },
    { position: 4, start: "14:45", end: "15:30", kind: "aula" },
    { position: 5, start: "15:30", end: "16:15", kind: "aula" },
    { position: 6, start: "16:15", end: "16:30", kind: "intervalo" },
    { position: 7, start: "16:30", end: "17:15", kind: "aula" },
    { position: 8, start: "17:15", end: "18:00", kind: "aula" },
  ],
  noite: [
    { position: 1, start: "17:00", end: "17:45", kind: "aula" },
    { position: 2, start: "17:45", end: "18:30", kind: "aula" },
    { position: 3, start: "18:30", end: "18:45", kind: "intervalo" },
    { position: 4, start: "18:45", end: "19:30", kind: "aula" },
    { position: 5, start: "19:30", end: "20:15", kind: "aula" },
    { position: 6, start: "20:15", end: "21:00", kind: "aula" },
  ],
  diurno: [
    { position: 1, start: "07:30", end: "08:15", kind: "aula" },
    { position: 2, start: "08:15", end: "09:00", kind: "aula" },
    { position: 3, start: "09:00", end: "09:15", kind: "intervalo" },
    { position: 4, start: "09:15", end: "10:00", kind: "aula" },
    { position: 5, start: "10:00", end: "10:45", kind: "aula" },
    { position: 6, start: "10:45", end: "11:00", kind: "intervalo" },
    { position: 7, start: "11:00", end: "11:45", kind: "aula" },
    { position: 8, start: "11:45", end: "12:30", kind: "aula" },
    { position: 9, start: "12:30", end: "13:00", kind: "intervalo" },
    { position: 10, start: "13:00", end: "13:45", kind: "aula" },
    { position: 11, start: "13:45", end: "14:30", kind: "aula" },
    { position: 12, start: "14:30", end: "14:45", kind: "intervalo" },
    { position: 13, start: "14:45", end: "15:30", kind: "aula" },
    { position: 14, start: "15:30", end: "16:15", kind: "aula" },
    { position: 15, start: "16:15", end: "16:30", kind: "intervalo" },
    { position: 16, start: "16:30", end: "17:15", kind: "aula" },
    { position: 17, start: "17:15", end: "18:00", kind: "aula" },
  ],
};

  /** Tempos de aula do turno da turma (a grelha de campainha mais recente desse turno). */
  const slotsFor = useMemo(
    () => (sectionShift: string) => {
      const shift = SHIFT[sectionShift] ?? (sectionShift?.toLowerCase() as Shift) ?? "manha";
      if (shift === "diurno") {
        const diurnoBell = (bells.data ?? []).filter((b) => b.shift === "diurno").sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0];
        if (diurnoBell && diurnoBell.slots?.length > 0) return diurnoBell.slots;
        const morningSlots = (bells.data ?? []).filter((b) => b.shift === "manha").sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]?.slots ?? [];
        const afternoonSlots = (bells.data ?? []).filter((b) => b.shift === "tarde").sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]?.slots ?? [];
        if (morningSlots.length > 0 || afternoonSlots.length > 0) {
          const combined = [...morningSlots, ...afternoonSlots];
          return combined.map((s, idx) => ({ ...s, position: idx + 1 }));
        }
        return DEFAULT_SLOTS.diurno;
      }
      const bell = (bells.data ?? []).filter((b) => b.shift === shift).sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0];
      if (bell?.slots?.length) return bell.slots;
      return DEFAULT_SLOTS[shift] ?? DEFAULT_SLOTS.manha;
    },
    [bells.data],
  );

  return {
    timetables: list.data ?? [], bells: bells.data ?? [], rooms: rooms.data ?? [], sections: sections.data ?? [], assignments: assignments.data ?? [],
    subjects: subjects.data ?? [], teachers: teachers.data ?? [],
    entries: entries.data ?? [], isLoading: list.isLoading, hasYear: Boolean(year.data), slotsFor, create, addEntry, addLesson, updateLesson, removeEntry, validate, publish, createBell, createRoom, setRoomActive, requestChange, changes: changes.data ?? [],
  };
}
