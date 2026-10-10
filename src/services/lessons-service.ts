import api from "./api";
import { fetchAllPages } from "./api-pagination";

export type LessonStatus = "prevista" | "realizada" | "nao_realizada" | "substituida" | "cancelada" | "reposta";

export interface ApiLesson {
  id: string;
  date: string;
  start: string;
  end: string;
  status: LessonStatus;
  reason: string | null;
  section: { id: string; name: string };
  subject: { name: string };
  teacher: { id: string; full_name: string };
  substitute_teacher: { id: string | null; full_name: string } | null;
}

export interface ApiSummary {
  id: string;
  lesson_id: string;
  version_number: number;
  lesson_number: number | null;
  content: string;
  objectives: string | null;
  homework: string | null;
  status: "rascunho" | "submetido" | "validado" | "devolvido";
  late: boolean;
  review_note: string | null;
}

export interface ApiLessonStat {
  section_subject_id: string;
  section: string;
  subject: string;
  teacher: string;
  counts: Record<string, number>;
  given: number;
  planned: number;
  compliance_rate: number | null;
}

export const LESSON_STATUS_LABEL: Record<LessonStatus, string> = {
  prevista: "Prevista", realizada: "Realizada", nao_realizada: "Não realizada", substituida: "Substituída", cancelada: "Cancelada", reposta: "Reposta",
};

export const lessonsService = {
  mine: (from: string, to: string) => fetchAllPages<ApiLesson>("/s/lessons/mine", { from, to }),
  all: (from: string, to: string) => fetchAllPages<ApiLesson>("/s/lessons", { from, to }),
  missingSummaries: async (): Promise<ApiLesson[]> => (await api.get<{ data: ApiLesson[] }>("/s/summaries/missing")).data.data,
  stats: async (): Promise<ApiLessonStat[]> => (await api.get<{ data: ApiLessonStat[] }>("/s/lessons/stats")).data.data,
  record: async (id: string, status: "realizada" | "nao_realizada", reason?: string) => (await api.post<ApiLesson>(`/s/lessons/${id}/record`, { status, ...(reason ? { reason } : {}) })).data,
  cancel: async (id: string, reason: string) => (await api.post(`/s/lessons/${id}/cancel`, { reason })).data,
  substitute: async (id: string, teacherId: string, reason: string) => (await api.post(`/s/lessons/${id}/substitute`, { teacher_id: teacherId, reason })).data,
  reschedule: async (id: string, v: { date: string; startMinute: number; endMinute: number }) => (await api.post(`/s/lessons/${id}/reschedule`, { date: v.date, start_minute: v.startMinute, end_minute: v.endMinute })).data,
  generate: async (from: string, to: string) => (await api.post("/s/lessons/generate", { from, to })).data,
  summary: async (id: string): Promise<ApiSummary | null> => {
    try { return (await api.get<ApiSummary>(`/s/lessons/${id}/summary`)).data; } catch (e) { if ((e as { response?: { status?: number } }).response?.status === 404) return null; throw e; }
  },
  saveSummary: async (id: string, v: { content: string; objectives?: string; homework?: string; submit: boolean }) => (await api.put<ApiSummary>(`/s/lessons/${id}/summary`, v)).data,
  reviewSummary: async (summaryId: string, decision: "validado" | "devolvido", note?: string) => (await api.post(`/s/summaries/${summaryId}/review`, { decision, ...(note ? { note } : {}) })).data,
};
