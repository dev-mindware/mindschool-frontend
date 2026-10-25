import api from "./api";
import { fetchAllPages } from "./api-pagination";

// ---- Reapreciacao de notas -----------------------------------------------------------------------------------

export type ReviewStatus = "pedido" | "em_revisao" | "deferido" | "indeferido" | "cancelado";
interface GradeView { numeric_value: number | null; qualitative_value: string | null; status: string; version: number }

export interface ApiReview {
  id: string;
  status: ReviewStatus;
  reason: string;
  requester_kind: string;
  student: { id: string; full_name: string };
  assessment: { id: string; type: string; date: string; subject: string; term_id: string };
  grade: GradeView | null;
  new_grade: GradeView | null;
  review_note: string | null;
  decision_note: string | null;
  decided_at: string | null;
  created_at: string;
}

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pedido: "Pedido", em_revisao: "Em revisão", deferido: "Deferido", indeferido: "Indeferido", cancelado: "Cancelado",
};

// ---- Conselhos de turma -------------------------------------------------------------------------------------

export type Outcome = "transita" | "nao_transita" | "transita_com_apoio";
export const OUTCOME_LABEL: Record<Outcome, string> = { transita: "Transita", nao_transita: "Não transita", transita_com_apoio: "Transita com apoio" };

export interface ApiCouncilSummary {
  id: string;
  section: { id: string; name: string; class_level: string };
  term_id: string | null;
  kind: "periodico" | "final";
  status: "agendado" | "encerrado";
  scheduled_at: string;
  agenda: string | null;
  closed_at: string | null;
}

export interface ApiCouncilAttendee { user_id: string; name: string; role: "presidente" | "secretario" | "membro"; present: boolean }

export interface ApiCouncil extends ApiCouncilSummary {
  attendees: ApiCouncilAttendee[];
  minutes: string | null;
  students: Array<{
    enrollment_id: string;
    student: { id: string; full_name: string };
    marks?: Record<string, number | null>;
    system_proposal?: { outcome?: Outcome; reason?: string } | string | null;
    confirmed_outcome?: Outcome | null;
    decision: { outcome: Outcome | null; system_proposal: string | null; justification: string | null; observation: string | null } | null;
  }>;
}

export interface ApiMember { id: string; role: string; user: { id: string; full_name: string; email: string } }

// ---- Exames finais -------------------------------------------------------------------------------------------

export type ExamCall = "primeira" | "segunda" | "recurso" | "melhoria";
export const CALL_LABEL: Record<ExamCall, string> = { primeira: "1.ª chamada", segunda: "2.ª chamada", recurso: "Recurso", melhoria: "Melhoria" };

export interface ApiFinalExam {
  id: string;
  call: ExamCall;
  national: boolean;
  scheduled_date: string;
  status: "agendado" | "realizado" | "encerrado";
  section: { id: string; name: string; class_level: string };
  subject: { id: string; name: string };
  teacher: { full_name: string };
}

export interface ApiFinalExamDetail extends ApiFinalExam {
  students: Array<{
    enrollment_id: string;
    student: { id: string; full_name: string };
    mfd: number | null;
    eligibility: { eligible: boolean; reason?: string; message?: string } | null;
    result: { status: string; exam_value: number | null; classification: number | null; justification: string | null } | null;
    effective_classification: number | null;
  }>;
}

export interface ExamResultInput { enrollment_id: string; status: "avaliado" | "ausente" | "ausente_justificado" | "anulado"; numeric_value?: number; justification?: string }

// ---- Prova de acesso ------------------------------------------------------------------------------------------

export interface ApiSessionSummary {
  id: string;
  academic_year_id: string;
  class_level: { id: string; name: string } | null;
  title: string;
  scheduled_at: string;
  location: string | null;
  capacity: number;
  registered: number;
  seats_left: number;
  status: "agendada" | "realizada" | "cancelada";
}

export interface ApiSessionDetail extends ApiSessionSummary {
  registrations: Array<{ application_id: string; candidate: string; document_number: string; status: string; registered_via: string; score: number | null }>;
}

export const phase6Service = {
  // reapreciacoes
  reviews: (status?: ReviewStatus) => fetchAllPages<ApiReview>("/s/grade-reviews", status ? { status } : {}),
  startReview: async (id: string, note?: string) => (await api.post<ApiReview>(`/s/grade-reviews/${id}/start`, note ? { note } : {})).data,
  decideReview: async (id: string, v: { decision: "deferido" | "indeferido"; note: string; numericValue?: number }) =>
    (await api.post<ApiReview>(`/s/grade-reviews/${id}/decide`, { decision: v.decision, note: v.note, ...(v.numericValue !== undefined ? { numeric_value: v.numericValue } : {}) })).data,

  // conselhos
  councils: () => fetchAllPages<ApiCouncilSummary>("/s/councils"),
  council: async (id: string): Promise<ApiCouncil> => (await api.get<ApiCouncil>(`/s/councils/${id}`)).data,
  createCouncil: async (sectionId: string, v: { kind: "periodico" | "final"; termId?: string; scheduledAt: string; agenda?: string }) =>
    (await api.post<ApiCouncilSummary>(`/s/sections/${sectionId}/councils`, {
      kind: v.kind, scheduled_at: v.scheduledAt, ...(v.termId ? { term_id: v.termId } : {}), ...(v.agenda ? { agenda: v.agenda } : {}),
    })).data,
  setAttendees: async (id: string, attendees: ApiCouncilAttendee[]) =>
    (await api.patch(`/s/councils/${id}`, { attendees: attendees.map((a) => ({ user_id: a.user_id, role: a.role, present: a.present })) })).data,
  putDecisions: async (id: string, decisions: Array<{ enrollment_id: string; outcome?: Outcome; justification?: string; observation?: string }>) =>
    (await api.put(`/s/councils/${id}/decisions`, { decisions })).data,
  closeCouncil: async (id: string, minutes: string) => (await api.post(`/s/councils/${id}/close`, { minutes })).data,
  minutesPdf: async (id: string): Promise<Blob> => (await api.get<Blob>(`/s/councils/${id}/minutes.pdf`, { responseType: "blob" })).data,
  members: () => fetchAllPages<ApiMember>("/s/memberships"),

  // exames finais
  finalExams: () => fetchAllPages<ApiFinalExam>("/s/final-exams"),
  finalExam: async (id: string): Promise<ApiFinalExamDetail> => (await api.get<ApiFinalExamDetail>(`/s/final-exams/${id}`)).data,
  createFinalExam: async (sectionId: string, sectionSubjectId: string, v: { call: ExamCall; national: boolean; scheduledDate: string }) =>
    (await api.post<ApiFinalExam>(`/s/sections/${sectionId}/subjects/${sectionSubjectId}/final-exams`, { call: v.call, national: v.national, scheduled_date: v.scheduledDate })).data,
  enrollFinalExam: async (id: string, enrollmentIds?: string[]) => (await api.post<{ enrolled: number }>(`/s/final-exams/${id}/enroll`, enrollmentIds ? { enrollment_ids: enrollmentIds } : {})).data,
  putFinalResults: async (id: string, results: ExamResultInput[]) => (await api.put(`/s/final-exams/${id}/results`, { results })).data,
  closeFinalExam: async (id: string) => (await api.post(`/s/final-exams/${id}/close`, {})).data,

  // prova de acesso
  sessions: async (): Promise<ApiSessionSummary[]> => (await api.get<{ data: ApiSessionSummary[] }>("/s/admission-exam-sessions")).data.data,
  session: async (id: string): Promise<ApiSessionDetail> => (await api.get<ApiSessionDetail>(`/s/admission-exam-sessions/${id}`)).data,
  createSession: async (v: { academicYearId: string; classLevelId?: string; title: string; scheduledAt: string; location?: string; capacity: number }) =>
    (await api.post<ApiSessionSummary>("/s/admission-exam-sessions", {
      academic_year_id: v.academicYearId, title: v.title, scheduled_at: v.scheduledAt, capacity: v.capacity,
      ...(v.classLevelId ? { class_level_id: v.classLevelId } : {}), ...(v.location ? { location: v.location } : {}),
    })).data,
  updateSession: async (id: string, v: { title?: string; scheduledAt?: string; location?: string | null; capacity?: number }) =>
    (await api.patch<ApiSessionSummary>(`/s/admission-exam-sessions/${id}`, {
      ...(v.title !== undefined ? { title: v.title } : {}), ...(v.scheduledAt !== undefined ? { scheduled_at: v.scheduledAt } : {}),
      ...(v.location !== undefined ? { location: v.location } : {}), ...(v.capacity !== undefined ? { capacity: v.capacity } : {}),
    })).data,
  cancelSession: async (id: string) => (await api.post(`/s/admission-exam-sessions/${id}/cancel`, {})).data,
  registerCandidate: async (applicationId: string, sessionId: string) => (await api.post(`/s/admission-applications/${applicationId}/exam-registration`, { session_id: sessionId })).data,
  putSessionResults: async (id: string, results: Array<{ application_id: string; status: "presente" | "ausente"; score?: number }>) =>
    (await api.post(`/s/admission-exam-sessions/${id}/results`, { results })).data,
  accessToken: async (applicationId: string): Promise<{ token: string; expires_at: string }> => (await api.post<{ token: string; expires_at: string }>(`/s/admission-applications/${applicationId}/access-token`, {})).data,
};
