import api from "./api";
import { fetchAllPages } from "./api-pagination";

export type Shift = "manha" | "tarde" | "noite" | "diurno";

export interface ApiTimetable {
  id: string;
  academic_year_id: string;
  name: string;
  status: "rascunho" | "validado" | "publicado" | "arquivado";
  version_number: number;
  published_at: string | null;
  entries: number;
}

export interface ApiEntry {
  id: string;
  timetable_id: string;
  section_subject_id: string;
  section: { id: string; name: string };
  subject: { name: string };
  teacher: { id: string; full_name: string };
  weekday: number;
  first_slot: number;
  span: number;
  start: string;
  end: string;
  room: { id: string; code: string; name: string } | null;
  location_label: string | null;
}

export interface ApiBellSchedule {
  id: string;
  shift: Shift;
  name: string;
  valid_from: string;
  valid_to: string | null;
  slots: Array<{ position: number; start: string; end: string; kind: "aula" | "intervalo"; minutes: number }>;
}

export interface ApiViolation { severity: "hard" | "soft"; code: string; message: string }
export interface ApiValidation { timetable_id: string; status: string; hard: ApiViolation[]; soft: ApiViolation[]; score: number; stats: { entries: number; sections: number; teachers: number } }
export interface ApiRoom { id: string; code: string; name: string; capacity: number | null; is_active: boolean }

export const WEEKDAY = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
export const SHIFT_LABEL: Record<Shift, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite", diurno: "Diurno" };

export interface ApiChange { id: string; type: string; effective_date: string; reason: string; created_at: string }
export interface NewChange { type: "troca_tempo" | "troca_professor" | "troca_sala" | "anulacao"; entryId: string; effectiveDate: string; reason: string; weekday?: number; firstSlot?: number; span?: number; teacherId?: string; roomId?: string | null }

export const timetablesService = {
  list: async (): Promise<ApiTimetable[]> => (await api.get<{ data: ApiTimetable[] }>("/s/timetables")).data.data,
  create: async (academicYearId: string, cloneFrom?: string) =>
    (await api.post<ApiTimetable>("/s/timetables", { academic_year_id: academicYearId, ...(cloneFrom ? { clone_from: cloneFrom } : {}) })).data,
  entries: async (id: string): Promise<ApiEntry[]> => (await api.get<{ data: ApiEntry[] }>(`/s/timetables/${id}/entries`)).data.data,
  addEntry: async (id: string, v: { sectionSubjectId: string; weekday: number; firstSlot?: number; span?: number; startTime?: string; endTime?: string; roomId?: string; shift?: Shift }) =>
    (await api.post<ApiEntry>(`/s/timetables/${id}/entries`, {
      section_subject_id: v.sectionSubjectId,
      weekday: v.weekday,
      ...(v.firstSlot ? { first_slot: v.firstSlot } : {}),
      ...(v.span ? { span: v.span } : {}),
      ...(v.startTime ? { start_time: v.startTime } : {}),
      ...(v.endTime ? { end_time: v.endTime } : {}),
      ...(v.roomId ? { room_id: v.roomId } : {}),
      ...(v.shift ? { shift: v.shift } : {}),
    })).data,
  updateEntry: async (id: string, entryId: string, v: { sectionSubjectId?: string; weekday?: number; firstSlot?: number; span?: number; startTime?: string; endTime?: string; roomId?: string | null; shift?: Shift }) =>
    (await api.patch<ApiEntry>(`/s/timetables/${id}/entries/${entryId}`, {
      ...(v.sectionSubjectId ? { section_subject_id: v.sectionSubjectId } : {}),
      ...(v.weekday ? { weekday: v.weekday } : {}),
      ...(v.firstSlot ? { first_slot: v.firstSlot } : {}),
      ...(v.span ? { span: v.span } : {}),
      ...(v.startTime ? { start_time: v.startTime } : {}),
      ...(v.endTime ? { end_time: v.endTime } : {}),
      ...(v.roomId !== undefined ? { room_id: v.roomId } : {}),
      ...(v.shift ? { shift: v.shift } : {}),
    })).data,
  removeEntry: async (id: string, entryId: string) => (await api.delete(`/s/timetables/${id}/entries/${entryId}`)).data,
  validate: async (id: string): Promise<ApiValidation> => (await api.post<ApiValidation>(`/s/timetables/${id}/validate`, {})).data,
  publish: async (id: string) => (await api.post<ApiTimetable>(`/s/timetables/${id}/publish`, {})).data,

  bells: async (): Promise<ApiBellSchedule[]> => (await api.get<{ data: ApiBellSchedule[] }>("/s/bell-schedules")).data.data,
  createBell: async (v: { shift: Shift; name: string; validFrom: string; start: string; periodMinutes: number; periods: number; breakAfter?: number; breakMinutes?: number }) =>
    (await api.post<ApiBellSchedule>("/s/bell-schedules", {
      shift: v.shift, name: v.name, valid_from: v.validFrom,
      generate: { start: v.start, period_minutes: v.periodMinutes, periods: v.periods, breaks: v.breakAfter && v.breakMinutes ? [{ after: v.breakAfter, minutes: v.breakMinutes }] : [] },
    })).data,
  changes: async (id: string): Promise<ApiChange[]> => (await api.get<{ data: ApiChange[] }>(`/s/timetables/${id}/changes`)).data.data,
  requestChange: async (id: string, v: NewChange) =>
    (await api.post(`/s/timetables/${id}/changes`, {
      type: v.type, entry_id: v.entryId, effective_date: v.effectiveDate, reason: v.reason,
      ...(v.weekday ? { weekday: v.weekday } : {}), ...(v.firstSlot ? { first_slot: v.firstSlot } : {}), ...(v.span ? { span: v.span } : {}),
      ...(v.teacherId ? { teacher_id: v.teacherId } : {}), ...(v.roomId !== undefined ? { room_id: v.roomId } : {}),
    })).data,
  rooms: () => fetchAllPages<ApiRoom>("/s/rooms"),
  createRoom: async (v: { code: string; name: string; type: string; capacity?: number }) =>
    (await api.post<ApiRoom>("/s/rooms", { code: v.code, name: v.name, type: v.type, capacity: v.capacity ?? null })).data,
  setRoomActive: async (id: string, isActive: boolean) => (await api.patch<ApiRoom>(`/s/rooms/${id}`, { is_active: isActive })).data,
};
