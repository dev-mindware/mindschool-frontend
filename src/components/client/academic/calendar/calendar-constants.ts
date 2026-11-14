import type { ApiEvent, EventAudience, EventEffect } from "@/services/calendar-service";

export const CALENDAR_STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  aprovado: "Aprovado",
  publicado: "Publicado",
  cancelado: "Cancelado",
};

export const CALENDAR_EFFECT_LABEL: Record<EventEffect, string> = {
  lectivo: "Lectivo",
  nao_lectivo: "Não lectivo",
  parcial: "Parcial",
};

export const CALENDAR_AUDIENCE_LABEL: Record<EventAudience, string> = {
  todos: "Todos (alunos e professores)",
  alunos: "Apenas alunos",
  professores: "Apenas professores",
};

export const CALENDAR_VISIBILITY_LABEL: Record<ApiEvent["visibility"], string> = {
  interna: "Interna",
  professores: "Professores",
  encarregados: "Encarregados",
  publica: "Pública",
};

export const CALENDAR_ORIGIN_LABEL: Record<ApiEvent["origin"], string> = {
  nacional: "Calendário nacional",
  institucional: "Institucional",
  google_proposta: "Proposta do Google",
};

export type EventModalPayload = {
  date?: string;
  editing?: ApiEvent;
  template?: Partial<{
    type: string;
    title: string;
    startDate: string;
    endDate: string;
    effect: EventEffect;
    audience: EventAudience;
    justification: string;
  }>;
};

