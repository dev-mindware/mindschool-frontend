import api from "./api";
import { fetchAllPages } from "./api-pagination";

export type Shift = "manha" | "tarde" | "noite" | "diurno";

export interface GenerateRequest {
  mode: "preview" | "apply";
  replace: boolean;
  seed: number;
  sectionIds?: string[];
  allocateRooms?: boolean;
  useOppositeShift?: boolean;
}

export interface ApiReadinessIssue {
  code: string;
  severity: "blocker" | "warning" | "info";
  title: string;
  description: string;
  teacher_id?: string;
  section_id?: string;
  action_type?: "teacher_availability" | "create_bell" | "assign_subjects" | "create_rooms" | "school_settings";
}

export interface ApiReadinessReport {
  ready: boolean;
  feasibility_score: number;
  timetable_id?: string | null;
  summary: {
    sections_total: number;
    sections_with_subjects: number;
    section_subjects_total: number;
    total_weekly_hours: number;
    teachers_total: number;
    teachers_with_availability: number;
    rooms_active: number;
    lective_weekdays: number[];
    missing_shifts: string[];
  };
  issues: ApiReadinessIssue[];
}

export interface ApiSolverSuggestion {
  id: string;
  type:
    | "unblock_availability"
    | "assign_substitute_teacher"
    | "swap_existing_entry"
    | "split_double_period"
    | "relax_daily_limit"
    | "configure_bell_schedule"
    | "assign_or_expand_rooms"
    | "configure_opposite_shift";
  priority: "alta" | "media" | "baixa";
  title: string;
  description: string;
  impact_periods: number;
  target: {
    section_id?: string;
    section_subject_id?: string;
    teacher_id?: string;
    substitute_teacher_id?: string;
    weekday?: number;
    start?: string;
    end?: string;
    room_id?: string;
  };
}

export interface ApiRankedFreeSlot {
  weekday: number;
  weekday_label: string;
  first_slot: number;
  start: string;
  end: string;
  score: number;
  reasons: string[];
  recommended_room: {
    id: string;
    code: string;
    name: string;
    capacity: number | null;
    fit: "section_room" | "specialized" | "ideal" | "compatible" | "small";
  } | null;
}

export interface ApiGeneration {
  timetable_id?: string | null;
  mode: "preview" | "apply";
  seed: number;
  replace: boolean;
  placed_periods: number;
  unplaced_periods: number;
  score: number;
  attempts: number;
  readiness?: ApiReadinessReport;
  placements: Array<{
    section: { id: string; name: string };
    subject: string;
    teacher: string;
    weekday: number;
    weekday_label: string;
    first_slot: number;
    span: number;
    start: string;
    end: string;
    room?: { id: string; code: string; name: string } | null;
    shift?: Shift | null;
  }>;
  unplaced: Array<{ section: { id: string; name: string }; subject: string; teacher: string; remaining: number; reason: string; message: string }>;
  suggestions?: ApiSolverSuggestion[];
  hard_violations: number;
  soft: Array<{ code: string; count: number }>;
  applied: { created: number; replaced: number; preserved_locked?: number } | null;
}

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
  readiness: async (timetableId?: string): Promise<ApiReadinessReport> =>
    (await api.get<ApiReadinessReport>("/s/timetables/readiness", { params: timetableId ? { timetable_id: timetableId } : undefined })).data,
  freeSlots: async (id: string, q: { sectionSubjectId: string; span?: number; roomId?: string }): Promise<ApiRankedFreeSlot[]> =>
    (
      await api.get<{ data: ApiRankedFreeSlot[] }>(`/s/timetables/${id}/free-slots`, {
        params: {
          section_subject_id: q.sectionSubjectId,
          ...(q.span ? { span: q.span } : {}),
          ...(q.roomId ? { room_id: q.roomId } : {}),
        },
      })
    ).data.data,
  /** Gerador automático (Enterprise): `preview` propõe sem gravar; `apply` grava de forma atómica. */
  generate: async (id: string, v: GenerateRequest): Promise<ApiGeneration> =>
    (
      await api.post<ApiGeneration>(`/s/timetables/${id}/generate`, {
        mode: v.mode,
        replace: v.replace,
        seed: v.seed,
        ...(v.sectionIds?.length ? { section_ids: v.sectionIds } : {}),
        ...(v.allocateRooms !== undefined ? { allocate_rooms: v.allocateRooms } : {}),
        ...(v.useOppositeShift !== undefined ? { use_opposite_shift: v.useOppositeShift } : {}),
      })
    ).data,
  /** Fluxo com 1 clique: funciona mesmo antes de existir um rascunho criado. */
  quickGenerate: async (v: GenerateRequest): Promise<ApiGeneration> =>
    (
      await api.post<ApiGeneration>("/s/timetables/quick-generate", {
        mode: v.mode,
        replace: v.replace,
        seed: v.seed,
        ...(v.sectionIds?.length ? { section_ids: v.sectionIds } : {}),
        ...(v.allocateRooms !== undefined ? { allocate_rooms: v.allocateRooms } : {}),
        ...(v.useOppositeShift !== undefined ? { use_opposite_shift: v.useOppositeShift } : {}),
      })
    ).data,

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
