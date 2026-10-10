import api from "./api";
import { fetchAllPages } from "./api-pagination";

export type RequestType = "declaracao_matricula" | "declaracao_notas" | "certificado" | "segunda_via_cartao" | "transferencia" | "outro";
export type RequestStatus = "aberto" | "aguarda_pagamento" | "em_analise" | "concluido" | "rejeitado" | "cancelado";

export interface ApiRequestEvent {
  id: string;
  kind: "criado" | "atribuido" | "estado" | "comentario" | "pagamento";
  actor_id: string;
  from_status: RequestStatus | null;
  to_status: RequestStatus | null;
  message: string | null;
  created_at: string;
}

export interface ApiRequest {
  id: string;
  protocol: string;
  type: RequestType;
  status: RequestStatus;
  subject: string;
  description: string | null;
  student_id: string | null;
  fee_amount: string | null;
  invoice: { id: string; status: string; due_date: string; payment_reference: string } | null;
  requested_by: string;
  assigned_to: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  events?: ApiRequestEvent[];
}

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  declaracao_matricula: "Declaração de matrícula",
  declaracao_notas: "Declaração com notas / histórico",
  certificado: "Certificado",
  segunda_via_cartao: "2.ª via de cartão de estudante",
  transferencia: "Guia de transferência",
  outro: "Outro requerimento",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  aberto: "Submetido",
  aguarda_pagamento: "A aguardar pagamento",
  em_analise: "Em análise",
  concluido: "Concluído",
  rejeitado: "Indeferido",
  cancelado: "Cancelado",
};

export interface NewRequest {
  type: RequestType;
  subject: string;
  description?: string;
  studentId?: string;
}

export const secretaryRequestsService = {
  /** Secretaria: todos os pedidos da escola. Portal: so os do utilizador (`portal: true`). */
  list: (portal = false): Promise<ApiRequest[]> => fetchAllPages<ApiRequest>(portal ? "/s/portal/requests" : "/s/requests"),
  get: async (id: string, portal = false): Promise<ApiRequest> => (await api.get<ApiRequest>(`${portal ? "/s/portal/requests" : "/s/requests"}/${id}`)).data,

  create: async (v: NewRequest, portal = false): Promise<ApiRequest> =>
    (await api.post<ApiRequest>(portal ? "/s/portal/requests" : "/s/requests", {
      type: v.type, subject: v.subject, ...(v.description ? { description: v.description } : {}), ...(v.studentId ? { student_id: v.studentId } : {}),
    })).data,

  assign: async (id: string) => (await api.post<ApiRequest>(`/s/requests/${id}/assign`, {})).data,
  setStatus: async (id: string, status: "em_analise" | "concluido" | "rejeitado", resolution?: string, waiveFee = false) =>
    (await api.post<ApiRequest>(`/s/requests/${id}/status`, { status, ...(resolution ? { resolution } : {}), ...(waiveFee ? { waive_fee: true } : {}) })).data,
  comment: async (id: string, message: string, portal = false) => (await api.post(`${portal ? "/s/portal/requests" : "/s/requests"}/${id}/comments`, { message })).data,
  cancel: async (id: string) => (await api.post<ApiRequest>(`/s/portal/requests/${id}/cancel`, {})).data,
};
