import api from "./api";
import { fetchAllPages } from "./api-pagination";

export type EventStatus = "rascunho" | "aprovado" | "publicado" | "cancelado";

export type EventScope =
  | { kind: "escola" }
  | { kind: "classe"; class_level_id: string | null }
  | { kind: "turma"; section_id: string | null }
  | { kind: "turno"; shift: string | null };

export type EventAudience = "alunos" | "professores" | "todos";
export type EventEffect = "lectivo" | "nao_lectivo" | "parcial";

export interface ApiEvent {
  id: string;
  academic_year_id: string;
  type: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  effect: EventEffect;
  audience: EventAudience | string;
  scope?: EventScope;
  origin: "nacional" | "institucional" | "google_proposta";
  status: EventStatus;
  visibility: "interna" | "professores" | "encarregados" | "publica";
  justification: string | null;
  location: string | null;
  affects_lessons: boolean;
  online_meeting?: boolean;
  national_event_id?: string | null;
  row_version: number;
}

export interface ApiEventImpact {
  event_id: string;
  lective_days_affected: number;
  assessments: Array<{ id: string; date: string; type: string; section: string; subject: string }>;
  lessons: Record<string, number>;
  final_exams: Array<{ id: string; date: string; call: string; section: string; subject: string }>;
  admission_sessions: Array<{ id: string; title: string; scheduled_at: string; class_level: string | null }>;
  class_councils: Array<{ id: string; kind: string; scheduled_at: string; section: string }>;
  suggestion: string | null;
}

export interface ApiCalendarCheck {
  academic_year_id: string;
  hard: Array<{ code: string; message: string; event_id?: string }>;
  soft: Array<{ code: string; message: string; event_id?: string }>;
  stats: { lectiveDays: number; lectiveWeeks: number };
}

/** Um dia do motor de dias lectivos. `source`: `regra` (ano, trimestres, feriados nacionais) ou `calendario` (evento/marca da Direcção). */
export interface ApiSchoolDay {
  date: string;
  lectivo: boolean;
  reason: string;
  source: "regra" | "calendario";
  event_id: string | null;
}

export interface ApiHolidayRow {
  date: string;
  kind: "feriado" | "ponte";
  name: string;
  sources: { local: string | null; national: string | null; google: string | null };
  missing: string[];
  status: "concordam" | "divergente" | "confirmado" | "rejeitado";
  decision: { decision: string; reason: string | null } | null;
}

export interface ApiGoogleStatus {
  connected: boolean;
  integration: { mode: string; status: string; account: string | null; calendar_id: string | null; scopes: string; last_sync_at: string | null; last_error: string | null } | null;
  capabilities?: { oauth_configured: boolean; api_key_configured: boolean; webhook_configured: boolean };
}

export interface ApiTeacherGoogleStatus {
  teacher_id: string;
  connected: boolean;
  link: { status: string; calendar_id: string | null; consent_at: string; last_sync_at: string | null; last_error: string | null } | null;
}

export const EVENT_TYPE_LABEL: Record<string, string> = {
  aulas_inicio: "Início das aulas", aulas_fim: "Fim das aulas", trimestre: "Trimestre", avaliacoes_trimestrais: "Avaliações trimestrais",
  exame_nacional: "Exame nacional", exame_recurso: "Exame de recurso", exame_melhoria: "Exame de melhoria", exame_extraordinario: "Exame extraordinário",
  pausa_pedagogica: "Pausa pedagógica", recesso: "Recesso", feriado_nacional: "Feriado nacional", ponte: "Ponte", tolerancia_ponto: "Tolerância de ponto",
  comemoracao: "Comemoração", matricula: "Matrículas", ferias_professores: "Férias dos professores", seminario: "Seminário",
  reuniao_encarregados: "Reunião de encarregados", conselho_notas: "Conselho de notas", dia_nao_lectivo_institucional: "Dia não lectivo",
  reposicao: "Reposição de aulas", actividade_escolar: "Actividade escolar",
};

export interface NewEvent {
  academicYearId: string;
  type: string;
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  effect?: EventEffect;
  audience?: EventAudience;
  scope?: EventScope;
  visibility: ApiEvent["visibility"];
  justification?: string;
  location?: string;
  description?: string;
  affectsLessons: boolean;
  onlineMeeting?: boolean;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string | null;
  endTime?: string | null;
  effect?: EventEffect;
  audience?: EventAudience;
  scope?: EventScope;
  visibility?: ApiEvent["visibility"];
  justification?: string;
  location?: string;
  affectsLessons?: boolean;
  onlineMeeting?: boolean;
  rowVersion?: number;
  reason?: string;
}

const serializeScope = (scope?: EventScope) => {
  if (!scope) return undefined;
  if (scope.kind === "escola") return { kind: "escola" as const };
  if (scope.kind === "classe" && scope.class_level_id) return { kind: "classe" as const, class_level_id: scope.class_level_id };
  if (scope.kind === "turma" && scope.section_id) return { kind: "turma" as const, section_id: scope.section_id };
  if (scope.kind === "turno" && scope.shift) return { kind: "turno" as const, shift: scope.shift };
  return undefined;
};

export const calendarService = {
  events: (academicYearId: string) => fetchAllPages<ApiEvent>("/s/calendar/events", { academic_year_id: academicYearId }),
  createEvent: async (v: NewEvent) =>
    (await api.post<ApiEvent>("/s/calendar/events", {
      academic_year_id: v.academicYearId,
      type: v.type,
      title: v.title,
      start_date: v.startDate,
      visibility: v.visibility,
      affects_lessons: v.affectsLessons,
      online_meeting: Boolean(v.onlineMeeting),
      ...(v.endDate ? { end_date: v.endDate } : {}),
      ...(v.startTime && v.endTime ? { start_time: v.startTime, end_time: v.endTime } : {}),
      ...(v.effect ? { effect: v.effect } : {}),
      ...(v.audience ? { audience: v.audience } : {}),
      ...(serializeScope(v.scope) ? { scope: serializeScope(v.scope) } : {}),
      ...(v.justification ? { justification: v.justification } : {}),
      ...(v.location ? { location: v.location } : {}),
      ...(v.description ? { description: v.description } : {}),
    })).data,
  updateEvent: async (id: string, v: UpdateEventPayload) =>
    (await api.patch<ApiEvent>(`/s/calendar/events/${id}`, {
      ...(v.title !== undefined ? { title: v.title } : {}),
      ...(v.description !== undefined ? { description: v.description } : {}),
      ...(v.startDate !== undefined ? { start_date: v.startDate } : {}),
      ...(v.endDate !== undefined ? { end_date: v.endDate } : {}),
      ...(v.startTime !== undefined ? { start_time: v.startTime } : {}),
      ...(v.endTime !== undefined ? { end_time: v.endTime } : {}),
      ...(v.effect !== undefined ? { effect: v.effect } : {}),
      ...(v.audience !== undefined ? { audience: v.audience } : {}),
      ...(serializeScope(v.scope) ? { scope: serializeScope(v.scope) } : {}),
      ...(v.visibility !== undefined ? { visibility: v.visibility } : {}),
      ...(v.justification !== undefined ? { justification: v.justification } : {}),
      ...(v.location !== undefined ? { location: v.location } : {}),
      ...(v.affectsLessons !== undefined ? { affects_lessons: v.affectsLessons } : {}),
      ...(v.onlineMeeting !== undefined ? { online_meeting: v.onlineMeeting } : {}),
      ...(v.rowVersion !== undefined ? { row_version: v.rowVersion } : {}),
      ...(v.reason !== undefined ? { reason: v.reason } : {}),
    })).data,
  approve: async (id: string) => (await api.post<ApiEvent>(`/s/calendar/events/${id}/approve`, {})).data,
  publish: async (id: string, confirmConflicts = false) => (await api.post<ApiEvent>(`/s/calendar/events/${id}/publish`, { confirm_conflicts: confirmConflicts })).data,
  cancel: async (id: string, reason: string) => (await api.post<ApiEvent>(`/s/calendar/events/${id}/cancel`, { reason })).data,
  impact: async (id: string): Promise<ApiEventImpact> => (await api.get<ApiEventImpact>(`/s/calendar/events/${id}/impact`)).data,
  check: async (academicYearId: string): Promise<ApiCalendarCheck> =>
    (await api.get<ApiCalendarCheck>("/s/calendar/check", { params: { academic_year_id: academicYearId } })).data,

  // ---- Dias lectivos (todos os planos) ----
  schoolDays: async (from: string, to: string): Promise<ApiSchoolDay[]> => (await api.get<{ data: ApiSchoolDay[] }>("/s/school-days", { params: { from, to } })).data.data,
  markNonLective: async (v: { startDate: string; endDate?: string; title: string; justification: string; audience?: EventAudience }) =>
    (await api.post("/s/school-days/marks", {
      start_date: v.startDate,
      title: v.title,
      justification: v.justification,
      ...(v.endDate ? { end_date: v.endDate } : {}),
      ...(v.audience ? { audience: v.audience } : {}),
    })).data,
  updateMarkNonLective: async (eventId: string, v: { startDate?: string; endDate?: string; title?: string; justification: string; audience?: EventAudience }) =>
    (await api.patch(`/s/school-days/marks/${eventId}`, {
      ...(v.startDate ? { start_date: v.startDate } : {}),
      ...(v.endDate ? { end_date: v.endDate } : {}),
      ...(v.title ? { title: v.title } : {}),
      ...(v.audience ? { audience: v.audience } : {}),
      justification: v.justification,
    })).data,
  unmarkNonLective: async (eventId: string) => (await api.delete(`/s/school-days/marks/${eventId}`)).data,

  holidays: async (academicYearId: string): Promise<{ data: ApiHolidayRow[]; sources: { google: boolean } }> =>
    (await api.get<{ data: ApiHolidayRow[]; sources: { google: boolean } }>("/s/calendar/holidays", { params: { academic_year_id: academicYearId } })).data,
  decideHoliday: async (v: { date: string; kind: "feriado" | "ponte"; decision: "confirmado" | "rejeitado"; reason: string }) => (await api.post("/s/calendar/holidays/decisions", v)).data,
  importNational: async (academicYearId: string, mode: "preview" | "apply") => (await api.post<unknown>("/s/calendar/import-national", { academic_year_id: academicYearId, mode })).data,

  googleStatus: async (): Promise<ApiGoogleStatus> => (await api.get<ApiGoogleStatus>("/s/integrations/google")).data,
  googleConnect: async (): Promise<string> => (await api.post<{ url: string }>("/s/integrations/google/connect-url", { return_to: "calendar" })).data.url,
  googleDisconnect: async (removeEvents: boolean) => (await api.post("/s/integrations/google/disconnect", { remove_events: removeEvents })).data,
  googleResync: async () => (await api.post("/s/integrations/google/resync", {})).data,
  googlePull: async () => (await api.post("/s/integrations/google/pull", {})).data,

  // ---- Horário do professor no seu próprio Google Calendar (opt-in) ----
  teacherGoogleStatus: async (): Promise<ApiTeacherGoogleStatus> => (await api.get<ApiTeacherGoogleStatus>("/s/teachers/me/google")).data,
  teacherGoogleConnect: async (): Promise<string> => (await api.post<{ url: string }>("/s/teachers/me/google/connect-url", { return_to: "timetable" })).data.url,
  teacherGoogleSync: async () => (await api.post("/s/teachers/me/google/sync", {})).data,
  teacherGoogleDisconnect: async () => (await api.post("/s/teachers/me/google/disconnect", {})).data,
};
