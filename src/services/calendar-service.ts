import api from "./api";
import { fetchAllPages } from "./api-pagination";

export type EventStatus = "rascunho" | "aprovado" | "publicado" | "cancelado";

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
  effect: "lectivo" | "nao_lectivo" | "parcial";
  audience: string;
  origin: "nacional" | "institucional" | "google_proposta";
  status: EventStatus;
  visibility: "interna" | "professores" | "encarregados" | "publica";
  justification: string | null;
  location: string | null;
  affects_lessons: boolean;
  row_version: number;
}

/** Um dia do motor de dias letivos. `source`: `regra` (ano, trimestres, feriados nacionais) ou `calendario` (evento/marca da Direção). */
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
  reuniao_encarregados: "Reunião de encarregados", conselho_notas: "Conselho de notas", dia_nao_lectivo_institucional: "Dia não letivo",
  reposicao: "Reposição de aulas", actividade_escolar: "Atividade escolar",
};

export interface NewEvent {
  academicYearId: string;
  type: string;
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  visibility: ApiEvent["visibility"];
  justification?: string;
  location?: string;
  description?: string;
  affectsLessons: boolean;
}

export const calendarService = {
  events: (academicYearId: string) => fetchAllPages<ApiEvent>("/s/calendar/events", { academic_year_id: academicYearId }),
  createEvent: async (v: NewEvent) =>
    (await api.post<ApiEvent>("/s/calendar/events", {
      academic_year_id: v.academicYearId, type: v.type, title: v.title, start_date: v.startDate, visibility: v.visibility, affects_lessons: v.affectsLessons,
      ...(v.endDate ? { end_date: v.endDate } : {}), ...(v.startTime && v.endTime ? { start_time: v.startTime, end_time: v.endTime } : {}),
      ...(v.justification ? { justification: v.justification } : {}), ...(v.location ? { location: v.location } : {}), ...(v.description ? { description: v.description } : {}),
    })).data,
  approve: async (id: string) => (await api.post<ApiEvent>(`/s/calendar/events/${id}/approve`, {})).data,
  publish: async (id: string, confirmConflicts = false) => (await api.post<ApiEvent>(`/s/calendar/events/${id}/publish`, { confirm_conflicts: confirmConflicts })).data,
  cancel: async (id: string, reason: string) => (await api.post<ApiEvent>(`/s/calendar/events/${id}/cancel`, { reason })).data,
  impact: async (id: string) => (await api.get<unknown>(`/s/calendar/events/${id}/impact`)).data,

  // ---- Dias letivos (todos os planos) ----
  schoolDays: async (from: string, to: string): Promise<ApiSchoolDay[]> => (await api.get<{ data: ApiSchoolDay[] }>("/s/school-days", { params: { from, to } })).data.data,
  markNonLective: async (v: { startDate: string; endDate?: string; title: string; justification: string }) =>
    (await api.post("/s/school-days/marks", { start_date: v.startDate, title: v.title, justification: v.justification, ...(v.endDate ? { end_date: v.endDate } : {}) })).data,
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
