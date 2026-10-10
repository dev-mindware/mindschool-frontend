import api from "./api";
import { fetchAllPages } from "./api-pagination";

export interface ApiHealthRecord {
  student_id: string;
  blood_type: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  updated_at: string;
}

export interface ApiVisit {
  id: string;
  student_id: string;
  visited_at: string;
  reason: string;
  treatment: string | null;
  guardian_notified: boolean;
}

export type CaseCategory = "aprendizagem" | "comportamento" | "emocional" | "familiar" | "outro";
export type CaseStatus = "aberto" | "em_acompanhamento" | "encerrado";

export interface ApiCase {
  id: string;
  student_id: string;
  category: CaseCategory;
  status: CaseStatus;
  summary: string;
  opened_at: string;
  closed_at: string | null;
}

export interface ApiCaseDetail extends ApiCase {
  sessions: Array<{ id: string; session_date: string; notes: string }>;
}

export const CASE_CATEGORY_LABEL: Record<CaseCategory, string> = {
  aprendizagem: "Aprendizagem",
  comportamento: "Comportamento",
  emocional: "Emocional",
  familiar: "Familiar",
  outro: "Outro",
};

export const CASE_STATUS_LABEL: Record<CaseStatus, string> = { aberto: "Aberto", em_acompanhamento: "Em acompanhamento", encerrado: "Encerrado" };

export type HealthRecordInput = Partial<Omit<ApiHealthRecord, "student_id" | "updated_at">>;

export const healthService = {
  record: async (studentId: string): Promise<{ record: ApiHealthRecord | null; recent_visits: ApiVisit[] }> =>
    (await api.get<{ record: ApiHealthRecord | null; recent_visits: ApiVisit[] }>(`/s/students/${studentId}/health`)).data,
  saveRecord: async (studentId: string, v: HealthRecordInput) => (await api.put<ApiHealthRecord>(`/s/students/${studentId}/health`, v)).data,
  visits: () => fetchAllPages<ApiVisit>("/s/health/visits"),
  addVisit: async (studentId: string, v: { reason: string; treatment?: string; guardianNotified: boolean }) =>
    (await api.post<ApiVisit>(`/s/students/${studentId}/health/visits`, { reason: v.reason, guardian_notified: v.guardianNotified, ...(v.treatment ? { treatment: v.treatment } : {}) })).data,

  cases: () => fetchAllPages<ApiCase>("/s/psycho-cases"),
  caseDetail: async (id: string): Promise<ApiCaseDetail> => (await api.get<ApiCaseDetail>(`/s/psycho-cases/${id}`)).data,
  openCase: async (studentId: string, v: { category: CaseCategory; summary: string }) => (await api.post<ApiCase>(`/s/students/${studentId}/psycho-cases`, v)).data,
  addSession: async (id: string, v: { date: string; notes: string }) => (await api.post(`/s/psycho-cases/${id}/sessions`, { session_date: v.date, notes: v.notes })).data,
  setCaseStatus: async (id: string, status: "em_acompanhamento" | "encerrado") => (await api.post<ApiCase>(`/s/psycho-cases/${id}/status`, { status })).data,
};
