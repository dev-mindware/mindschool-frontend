import api from "@/services/api";

export interface PortalWard {
  student: { id: string; full_name: string; status: string };
  relationship_type: string;
  can_view_grades: boolean;
  can_view_finance: boolean;
  current_enrollment: { id: string; section: string; shift: string; class_level: string } | null;
}

export interface PortalTermGrades {
  term: { id: string; sequence: number };
  status: string;
  subjects: Array<{ name: string; mac: number | null; mas: number | null; mt: number | null }>;
}

export interface PortalAssessment {
  assessment_id: string;
  subject: string;
  type: string;
  date: string;
  term_id: string;
  numeric_value: number | null;
  qualitative_value: string | null;
  status: string;
  review: { id: string; status: string } | null;
  review_deadline: string | null;
}

export interface PortalInvoice {
  id: string;
  type: string;
  status: string;
  total_due: string;
  paid_amount: string;
  balance: string;
  due_date: string;
  is_overdue: boolean;
}

export interface PortalPayment { id: string; invoice_id: string; amount: string; method: string; paid_at: string; invoice_type: string; invoice_due_date: string; reference: string | null }
export interface PortalStatement {
  year: number; currency: string; invoices: number; billed: string; paid: string; outstanding: string; late_fees: string;
  months: Array<{ month: string; billed: string; paid: string; outstanding: string }>;
}

export interface PortalExam {
  id: string;
  title: string;
  opens_at: string;
  closes_at: string;
  time_limit_minutes: number | null;
  max_attempts: number;
  delivery: "nativa" | "google_forms";
  google_form_url: string | null;
  is_open: boolean;
  attempts: Array<{ id: string; attempt_number: number; status: string }>;
}

export interface PortalTimetableDay { weekday: number; entries: Array<{ id: string; subject: { name: string }; teacher: { full_name: string }; start: string; end: string; room: { code: string } | null }> }
export interface PortalAttendance { summary: { lessons: number; present: number; late: number; justified_absences: number; unjustified_absences: number; attendance_rate: number | null }; data: Array<{ id: string; date: string; status: string; justification: string | null }> }
export interface PortalDocument { id: string; type: string; document_number: string; issued_at: string }
export interface PortalAnnouncement { id: string; title: string; body: string; audience: string; published_at: string | null }
export interface PortalEvent { id: string; type: string; title: string; description: string | null; start_date: string; end_date: string; location: string | null; effect: string }

const num = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : Number(v));

// ---- Disciplinas e aproveitamento ------------------------------------------------------------------------------------
export interface PortalSubject { id: string; subject: string; teacher: string; weekly_hours: number; last_mt: number | null; last_term: number | null }
export interface PortalPerformanceSubject { subject: string; mt: number | null; class_avg: number | null; class_min: number | null; class_max: number | null; quartile: 1 | 2 | 3 | 4 | null; passed: boolean | null }
export interface PortalPerformanceTerm { term: { id: string; sequence: number }; student_avg: number | null; class_avg: number | null; quartile: 1 | 2 | 3 | 4 | null; negatives: number; subjects: PortalPerformanceSubject[] }
export interface PortalPerformance { pass_mark: number; terms: PortalPerformanceTerm[] }

// ---- Provas online (realizacao pelo aluno) ---------------------------------------------------------------------------
export type QuestionType = "escolha_multipla_unica" | "escolha_multipla_varias" | "verdadeiro_falso" | "resposta_curta" | "dissertativa";
export type AnswerValue = string | boolean | string[];
export interface ExamQuestion {
  id: string; order_index: number; question_type: QuestionType; prompt: string; options: Array<{ id: string; text: string }> | null; max_score: number;
  answer: AnswerValue | null; score_awarded?: number | null; expected_answer?: string | null;
}
export interface ExamSession {
  submission: { id: string; status: string; attempt_number: number; started_at: string };
  deadline: string;
  seconds_left: number;
  questions: ExamQuestion[];
  result?: { total_score: number; max_score: number; confirmed: boolean; pending_manual: boolean };
}

// ---- Biblioteca ------------------------------------------------------------------------------------------------------
export interface PortalBook { id: string; title: string; author: string; category: string | null; location: string | null; copies_available: number }
export type LibraryRequestStatus = "pedido" | "aprovado" | "recusado" | "cancelado";
export interface PortalLibraryRequest {
  id: string; status: LibraryRequestStatus; book_id: string; book_title: string; book_author: string; student_id: string; student_name: string; notes: string | null; decision_reason: string | null;
  decided_at: string | null; created_at: string; loan: { id: string; status: string; due_at: string; renewals: number; overdue: boolean } | null;
}
export interface PortalLoan { id: string; book_id: string; book_title: string; book_author: string; status: "emprestado" | "devolvido"; loaned_at: string; due_at: string; returned_at: string | null; renewals: number; overdue: boolean }

// ---- Perfil ----------------------------------------------------------------------------------------------------------
export interface PortalProfile {
  user: { id: string; email: string; full_name: string; mfa_enabled: boolean; last_login_at: string | null };
  roles: string[];
  guardian: { id: string; full_name: string; phone: string; email: string | null; document_number: string } | null;
  student: { id: string; full_name: string; birth_date: string; document_number: string } | null;
  editable: { phone: boolean; email: boolean };
}

export const portalService = {
  subjects: async (studentId: string): Promise<PortalSubject[]> =>
    (await api.get<{ data: PortalSubject[] }>(`/s/portal/students/${studentId}/subjects`)).data.data,
  performance: async (studentId: string): Promise<PortalPerformance> => (await api.get<PortalPerformance>(`/s/portal/students/${studentId}/performance`)).data,
  reportCardPdf: async (studentId: string, term: number): Promise<Blob> => (await api.get<Blob>(`/s/portal/students/${studentId}/report-card.pdf`, { params: { term }, responseType: "blob" })).data,

  startExam: async (examId: string): Promise<ExamSession> => (await api.post<ExamSession>(`/s/portal/exams/${examId}/submissions`, {})).data,
  examSession: async (examId: string, submissionId: string): Promise<ExamSession> => (await api.get<ExamSession>(`/s/portal/exams/${examId}/submissions/${submissionId}`)).data,
  saveExamAnswers: async (examId: string, submissionId: string, answers: Array<{ question_id: string; value: AnswerValue }>) =>
    (await api.put<{ saved: number; deadline: string }>(`/s/portal/exams/${examId}/submissions/${submissionId}/answers`, { answers })).data,
  submitExam: async (examId: string, submissionId: string) => (await api.post<{ status: string; total_score: number | null; provisional: boolean }>(`/s/portal/exams/${examId}/submissions/${submissionId}/submit`, {})).data,

  libraryBooks: async (q?: string): Promise<PortalBook[]> => (await api.get<{ data: PortalBook[] }>("/s/portal/library/books", { params: { limit: 100, ...(q ? { q } : {}) } })).data.data,
  library: async (studentId: string): Promise<{ requests: PortalLibraryRequest[]; loans: PortalLoan[] }> => (await api.get<{ requests: PortalLibraryRequest[]; loans: PortalLoan[] }>(`/s/portal/students/${studentId}/library`)).data,
  requestBook: async (studentId: string, bookId: string, notes?: string) => (await api.post<PortalLibraryRequest>(`/s/portal/students/${studentId}/library/requests`, { book_id: bookId, ...(notes ? { notes } : {}) })).data,
  cancelBookRequest: async (id: string) => (await api.post<PortalLibraryRequest>(`/s/portal/library/requests/${id}/cancel`, {})).data,
  renewLoan: async (studentId: string, loanId: string) => (await api.post(`/s/portal/students/${studentId}/library/loans/${loanId}/renew`, {})).data,

  profile: async (): Promise<PortalProfile> => (await api.get<PortalProfile>("/s/portal/me")).data,
  updateContacts: async (v: { phone?: string; email?: string | null }): Promise<PortalProfile> => (await api.patch<PortalProfile>("/s/portal/me", v)).data,

  timetable: async (studentId: string): Promise<PortalTimetableDay[]> => (await api.get<{ days: PortalTimetableDay[] }>(`/s/portal/students/${studentId}/timetable`)).data.days,
  attendance: async (studentId: string): Promise<PortalAttendance> => (await api.get<PortalAttendance>(`/s/portal/students/${studentId}/attendance`)).data,
  documents: async (studentId: string): Promise<PortalDocument[]> => (await api.get<{ data: PortalDocument[] }>(`/s/portal/students/${studentId}/documents`)).data.data,
  documentPdf: async (studentId: string, id: string): Promise<Blob> => (await api.get<Blob>(`/s/portal/students/${studentId}/documents/${id}/pdf`, { responseType: "blob" })).data,
  announcements: async (): Promise<PortalAnnouncement[]> => (await api.get<{ data: PortalAnnouncement[] }>("/s/portal/announcements")).data.data,
  calendar: async (): Promise<PortalEvent[]> => (await api.get<{ data: PortalEvent[] }>("/s/portal/calendar")).data.data,
  wards: async (): Promise<PortalWard[]> => (await api.get<{ data: PortalWard[] }>("/s/portal/students")).data.data,
  // A API devolve as notas como texto decimal ("12.50"); a interface trabalha com numeros.
  grades: async (studentId: string): Promise<PortalTermGrades[]> =>
    (await api.get<{ terms: PortalTermGrades[] }>(`/s/portal/students/${studentId}/grades`)).data.terms.map((t) => ({
      ...t, subjects: t.subjects.map((s) => ({ ...s, mac: num(s.mac), mas: num(s.mas), mt: num(s.mt) })),
    })),
  assessments: async (studentId: string): Promise<PortalAssessment[]> =>
    (await api.get<{ data: PortalAssessment[] }>(`/s/portal/students/${studentId}/assessments`)).data.data.map((a) => ({ ...a, numeric_value: num(a.numeric_value) })),
  requestReview: async (studentId: string, assessmentId: string, reason: string) =>
    (await api.post(`/s/portal/students/${studentId}/grade-reviews`, { assessment_id: assessmentId, reason })).data,
  cancelReview: async (studentId: string, id: string) => (await api.post(`/s/portal/students/${studentId}/grade-reviews/${id}/cancel`, {})).data,
  invoices: async (studentId: string): Promise<PortalInvoice[]> => (await api.get<{ data: PortalInvoice[] }>(`/s/portal/students/${studentId}/invoices`)).data.data,
  payments: async (studentId: string): Promise<PortalPayment[]> => (await api.get<{ data: PortalPayment[] }>(`/s/portal/students/${studentId}/payments`)).data.data,
  receiptPdf: async (studentId: string, paymentId: string): Promise<Blob> => (await api.get<Blob>(`/s/portal/students/${studentId}/payments/${paymentId}/receipt.pdf`, { responseType: "blob" })).data,
  statement: async (studentId: string, year: number): Promise<PortalStatement> => (await api.get<PortalStatement>(`/s/portal/students/${studentId}/statement`, { params: { year } })).data,
  exams: async (): Promise<PortalExam[]> => (await api.get<{ data: PortalExam[] }>("/s/portal/exams")).data.data,
};
