import api from "./api";

export interface ApiOverview {
  schools_by_subscription_status: Record<string, number>;
  mrr: string;
  arr: string;
  currency: string;
  needs_attention: Record<string, number>;
}

export interface ApiQueueOrder {
  id: string;
  school: { id: string; name: string; nif: string };
  kind: string;
  plan: { code: string; name: string };
  addon_codes: string[];
  period_months: number;
  total_amount: string;
  currency: string;
  status: string;
  created_at: string;
  waiting_hours?: number;
  proofs: Array<{ id: string; file_name: string; is_current: boolean }>;
  reviews: Array<{ decision: string; reason: string | null; reviewed_at: string }>;
}

export interface ApiDeadEvent { id: string; type: string; school_id: string | null; attempts: number; last_error: string | null; occurred_at: string }

export const platformService = {
  overview: async (): Promise<ApiOverview> => (await api.get<ApiOverview>("/admin/overview")).data,
  queue: async (): Promise<ApiQueueOrder[]> => (await api.get<{ data: ApiQueueOrder[] }>("/admin/subscriptions/queue")).data.data,
  startReview: async (id: string) => (await api.post(`/admin/subscription-orders/${id}/start-review`, {})).data,
  review: async (id: string, v: { decision: "approved" | "rejected" | "replacement_required"; reason: string; confirmedAmount?: string; reference?: string }) =>
    (await api.post(`/admin/subscription-orders/${id}/review`, {
      decision: v.decision, reason: v.reason, ...(v.confirmedAmount ? { confirmed_amount: v.confirmedAmount } : {}), ...(v.reference ? { reference: v.reference } : {}),
    })).data,
  proofBlob: async (id: string): Promise<Blob> => (await api.get<Blob>(`/admin/subscription-orders/${id}/proof`, { responseType: "blob" })).data,
  sweep: async () => (await api.post("/admin/subscriptions/lifecycle-sweep", {})).data,
  outbox: async (): Promise<{ pending: number; dead_letter: number; processed: number }> => (await api.get<{ pending: number; dead_letter: number; processed: number }>("/admin/outbox")).data,
  deadLetters: async (): Promise<ApiDeadEvent[]> => (await api.get<{ data: ApiDeadEvent[] }>("/admin/outbox/dead-letter")).data.data,
  requeue: async (id: string) => (await api.post(`/admin/outbox/dead-letter/${id}/requeue`, {})).data,
  suspend: async (schoolId: string, reason: string) => (await api.post(`/admin/schools/${schoolId}/subscription/suspend`, { reason })).data,
  reactivate: async (schoolId: string, reason: string) => (await api.post(`/admin/schools/${schoolId}/subscription/reactivate`, { reason })).data,
};
