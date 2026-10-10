import api from "./api";

export type ApiExamStatus = "rascunho" | "publicada" | "encerrada";
export type ApiQuestionType = "escolha_multipla_unica" | "escolha_multipla_varias" | "verdadeiro_falso" | "resposta_curta" | "dissertativa";

export interface ApiExamQuestion {
  id: string;
  order_index: number;
  question_type: ApiQuestionType;
  prompt: string;
  options: Array<{ id: string; text: string }> | null;
  max_score: number;
  expected_answer?: string | null;
}

export interface ApiExam {
  id: string;
  assessment_id: string | null;
  title: string;
  status: ApiExamStatus;
  opens_at: string;
  closes_at: string;
  time_limit_minutes: number | null;
  shuffle_questions: boolean;
  max_attempts: number;
  delivery: "nativa" | "google_forms";
  google_form: { form_id: string; responder_url: string | null; linked_at: string | null; synced_at: string | null } | null;
  total_score: number;
  questions: ApiExamQuestion[];
  context: { assessment_id: string; term_id: string; section_id: string; section_name: string; subject_id: string; subject_name: string } | null;
}

export interface ApiExamSubmission {
  id: string;
  status: "em_curso" | "submetida" | "corrigida_automaticamente" | "corrigida_manualmente" | "confirmada";
  attempt_number: number;
  enrollment_id: string | null;
  source: "nativa" | "google_forms";
  student: { id: string; full_name: string } | null;
  submitted_at: string | null;
  total_score: number | null;
}

export interface ApiSubmissionDetail {
  id: string;
  status: ApiExamSubmission["status"];
  total_score: number | null;
  answers: Array<{
    answer_id: string | null;
    question: ApiExamQuestion;
    value: string | string[] | boolean | null;
    score_awarded: number | null;
    grading_status: "pendente" | "corrigida_automaticamente" | "corrigida_manualmente" | null;
  }>;
}

export interface ApiGoogleFormStatus {
  linked: boolean;
  delivery: string;
  form_id: string | null;
  responder_url: string | null;
  edit_url: string | null;
  linked_at: string | null;
  synced_at: string | null;
  imported_responses?: number;
}

export interface ApiFormSync {
  total_responses: number;
  imported: number;
  already_imported: number;
  manual_pending: number;
  skipped: Array<{ response_id: string; email: string | null; reason: string }>;
}

export interface NewQuestion {
  question_type: ApiQuestionType;
  prompt: string;
  max_score: number;
  options?: Array<{ id: string; text: string }>;
  expected_answer?: string;
}

export const SKIP_REASON: Record<string, string> = {
  sem_email: "Resposta sem e-mail (formulário sem identificação)",
  aluno_nao_encontrado: "E-mail não corresponde a nenhum aluno da turma",
  fora_da_janela: "Enviada fora da janela da prova",
  tentativas_excedidas: "Excede o número de tentativas",
};

export const examsService = {
  list: async (): Promise<ApiExam[]> => (await api.get<{ data: ApiExam[] }>("/s/exams")).data.data,
  get: async (id: string): Promise<ApiExam> => (await api.get<ApiExam>(`/s/exams/${id}`)).data,

  /** Garante a avaliacao (prova periodica do periodo) da disciplina/turma e cria a prova ligada a ela. */
  create: async (v: { sectionId: string; assignmentId: string; termId: string; title: string; opensAt: string; closesAt: string; timeLimitMinutes?: number; maxAttempts: number }): Promise<ApiExam> => {
    const list = (await api.get<{ data: Array<{ id: string; type: string }> }>(`/s/sections/${v.sectionId}/subjects/${v.assignmentId}/assessments`, { params: { term_id: v.termId } })).data.data;
    let assessment = list.find((a) => a.type === "prova_periodica");
    if (!assessment) {
      assessment = (await api.post<{ id: string; type: string }>(`/s/sections/${v.sectionId}/subjects/${v.assignmentId}/assessments`, {
        term_id: v.termId, type: "prova_periodica", date: v.opensAt.slice(0, 10), weight: 1,
      })).data;
    }
    return (await api.post<ApiExam>(`/s/assessments/${assessment.id}/exams`, {
      title: v.title, opens_at: v.opensAt, closes_at: v.closesAt, max_attempts: v.maxAttempts, shuffle_questions: false,
      ...(v.timeLimitMinutes ? { time_limit_minutes: v.timeLimitMinutes } : {}),
    })).data;
  },

  addQuestion: async (examId: string, q: NewQuestion) => (await api.post(`/s/exams/${examId}/questions`, q)).data,
  removeQuestion: async (examId: string, questionId: string) => (await api.delete(`/s/exams/${examId}/questions/${questionId}`)).data,
  publish: async (id: string) => (await api.post<ApiExam>(`/s/exams/${id}/publish`, {})).data,
  close: async (id: string) => (await api.post<ApiExam>(`/s/exams/${id}/close`, {})).data,

  submissions: async (examId: string): Promise<ApiExamSubmission[]> => (await api.get<{ data: ApiExamSubmission[] }>(`/s/exams/${examId}/submissions`)).data.data,
  submission: async (examId: string, id: string): Promise<ApiSubmissionDetail> => (await api.get<ApiSubmissionDetail>(`/s/exams/${examId}/submissions/${id}`)).data,
  gradeAnswer: async (examId: string, submissionId: string, answerId: string, score: number) =>
    (await api.put(`/s/exams/${examId}/submissions/${submissionId}/answers/${answerId}/grade`, { score_awarded: score })).data,
  confirm: async (examId: string, submissionId: string) => (await api.post<{ grade_value: string }>(`/s/exams/${examId}/submissions/${submissionId}/confirm`, {})).data,

  // ---- Google Forms ----
  formStatus: async (examId: string): Promise<ApiGoogleFormStatus> => (await api.get<ApiGoogleFormStatus>(`/s/exams/${examId}/google-form`)).data,
  linkForm: async (examId: string, emailCollection: "verified" | "responder_input" = "verified"): Promise<ApiGoogleFormStatus> =>
    (await api.post<ApiGoogleFormStatus>(`/s/exams/${examId}/google-form`, { email_collection: emailCollection })).data,
  syncForm: async (examId: string): Promise<ApiFormSync> => (await api.post<ApiFormSync>(`/s/exams/${examId}/google-form/sync`, {})).data,
  unlinkForm: async (examId: string): Promise<ApiGoogleFormStatus> => (await api.delete<ApiGoogleFormStatus>(`/s/exams/${examId}/google-form`)).data,

  /** Estado da ligacao Google da escola (para avisar quando falta ligar). */
  googleStatus: async (): Promise<{ connected: boolean; scopes: string | null }> => {
    const { data } = await api.get<{ connected: boolean; integration?: { scopes?: string } | null }>("/s/integrations/google");
    return { connected: data.connected, scopes: data.integration?.scopes ?? null };
  },
  connectGoogle: async (): Promise<string> => (await api.post<{ url: string }>("/s/integrations/google/connect-url", {})).data.url,

};
