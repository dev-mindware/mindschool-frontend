import api from "./api";

export type PlanKind = "dosificacao" | "plano_aula";
export type PlanStatus = "rascunho" | "submetido" | "aprovado" | "devolvido";

export interface DosificacaoWeek {
  week: number;
  theme: string;
  objectives: string;
  contents: string;
  lessons?: number;
}

export interface LessonPlanContent {
  thematic_unit: string;
  summary: string;
  objectives: string;
  phases: Array<{ name: string; minutes: number; activities: string }>;
  assessment: string;
  post_class: string;
}

export interface TeachingPlan {
  id: string;
  kind: PlanKind;
  title: string;
  status: PlanStatus;
  term_id: string;
  lesson_date: string | null;
  section_subject_id: string;
  section: { id: string; name: string };
  subject: { name: string };
  teacher: { full_name: string };
  content: { weeks: DosificacaoWeek[] } | LessonPlanContent;
  review_note: string | null;
  created_by_name: string;
  submitted_at: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanInput {
  kind: PlanKind;
  sectionSubjectIds: string[];
  termId: string;
  title: string;
  lessonDate?: string;
  content: unknown;
}

/** Base do serviço de IA (a mesma do assistente MIND): o URL configurado termina em /chat. */
const aiBase = () => (process.env.NEXT_PUBLIC_CHATBOT_API_URL || "https://chatbot.mindware-vps.cloud/chat").trim().replace(/\/+$/, "").replace(/\/chat$/, "");

export interface DosificacaoDraftRequest {
  schoolId: string;
  subject: string;
  classLevel: string;
  termLabel: string;
  weeks: number;
  weeklyHours?: number;
  themes?: string;
  onlyWeek?: number;
  currentWeeks?: DosificacaoWeek[];
}

export interface LessonPlanDraftRequest {
  schoolId: string;
  subject: string;
  classLevel: string;
  thematicUnit: string;
  summary?: string;
  durationMinutes: number;
}

export const planningService = {
  list: async (params: { kind?: PlanKind; status?: PlanStatus } = {}): Promise<TeachingPlan[]> =>
    (await api.get<{ data: TeachingPlan[] }>("/s/teaching-plans", { params })).data.data,

  create: async (v: CreatePlanInput): Promise<TeachingPlan[]> =>
    (await api.post<{ data: TeachingPlan[] }>("/s/teaching-plans", {
      kind: v.kind,
      section_subject_ids: v.sectionSubjectIds,
      term_id: v.termId,
      title: v.title,
      ...(v.lessonDate ? { lesson_date: v.lessonDate } : {}),
      content: v.content,
    })).data.data,

  update: async (id: string, v: { title?: string; lessonDate?: string | null; content?: unknown }): Promise<TeachingPlan> =>
    (await api.patch<TeachingPlan>(`/s/teaching-plans/${id}`, { title: v.title, lesson_date: v.lessonDate, content: v.content })).data,

  submit: async (id: string): Promise<TeachingPlan> => (await api.post<TeachingPlan>(`/s/teaching-plans/${id}/submit`)).data,

  review: async (id: string, decision: "aprovado" | "devolvido", note?: string): Promise<TeachingPlan> =>
    (await api.post<TeachingPlan>(`/s/teaching-plans/${id}/review`, { decision, note })).data,

  remove: async (id: string): Promise<void> => {
    await api.delete(`/s/teaching-plans/${id}`);
  },

  /** A IA só devolve um rascunho: nada fica guardado até o professor gravar. */
  draftDosificacao: async (v: DosificacaoDraftRequest): Promise<DosificacaoWeek[]> =>
    (await api.post<{ weeks: DosificacaoWeek[] }>(`${aiBase()}/planning/dosificacao`, v)).data.weeks,

  draftLessonPlan: async (v: LessonPlanDraftRequest): Promise<LessonPlanContent> =>
    (await api.post<{ plan: LessonPlanContent }>(`${aiBase()}/planning/plano-aula`, v)).data.plan,
};
