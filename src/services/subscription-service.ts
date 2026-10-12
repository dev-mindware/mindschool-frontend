import api from "./api";

export interface ApiPlan { code: string; name: string; monthly_price: string; currency: string; rank: number; features: string[]; limits: Record<string, { limit: number | null; unit: string }> }
export interface ApiAddon { code: string; name: string; description: string | null; monthly_price: string; grants: string[]; limit_grants?: Record<string, number>; min_plan_rank: number | null }
export interface ApiCatalog {
  plans: ApiPlan[];
  addons: ApiAddon[];
  features: Array<{ key: string; message: string }>;
  quotas: Array<{ key: string; unit: string; label: string }>;
  payment_instructions: string | null;
}

export type OrderStatus = "pending_payment" | "payment_proof_submitted" | "under_review" | "proof_replacement_required" | "approved" | "rejected" | "cancelled" | string;

export interface ApiOrder {
  id: string;
  kind: string;
  plan: { code: string; name: string };
  addon_codes: string[];
  period_months: number;
  total_amount: string;
  currency: string;
  status: OrderStatus;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  proofs: Array<{ id: string; file_name: string; is_current: boolean; uploaded_at: string }>;
}

export interface ApiCurrentSubscription {
  subscription: {
    id: string;
    status: string;
    plan: { code: string; name: string };
    trial_ends_at: string | null;
    period_start: string | null;
    period_end: string | null;
    grace_ends_at: string | null;
    cancel_at_period_end: boolean;
    pending_plan: { code: string; name: string; effective_at: string | null } | null;
    message: string;
  };
  addons: Array<{ code: string; name: string; status: string }>;
  quotas: Array<{ key: string; unit: string; limit: number | null; used: number; state: string }>;
  orders: ApiOrder[];
}

export interface ApiQuote {
  kind: string;
  effective: string;
  breakdown: { plan: { name: string; monthly_price: string }; addons: Array<{ name: string; monthly_price: string }>; months: number; monthly_total: string; subtotal?: string; discount?: string; total: string; currency: string; coupon?: { code: string } | null };
  features_lost: Array<{ key: string; message: string }>;
  notes: string[];
}

export interface OrderRequest { plan_code: string; addon_codes: string[]; period_months: 1 | 3 | 6 | 12; coupon_code?: string }

export const subscriptionService = {
  catalog: async (): Promise<ApiCatalog> => (await api.get<ApiCatalog>("/subscription/catalog")).data,
  current: async (): Promise<ApiCurrentSubscription> => (await api.get<ApiCurrentSubscription>("/s/subscription")).data,
  quote: async (v: OrderRequest): Promise<ApiQuote> => (await api.post<ApiQuote>("/s/subscription/quote", v)).data,
  createOrder: async (v: OrderRequest): Promise<ApiOrder> => (await api.post<ApiOrder>("/s/subscription/orders", v)).data,
  orders: async (): Promise<ApiOrder[]> => (await api.get<{ data: ApiOrder[] }>("/s/subscription/orders")).data.data,
  cancelOrder: async (id: string) => (await api.post(`/s/subscription/orders/${id}/cancel`, {})).data,
  /** Envia o comprovativo (PDF ou PNG, ate 10 MB) para analise; nunca activa o plano por si so. */
  submitProof: async (orderId: string, file: File): Promise<ApiOrder> => {
    const buf = new Uint8Array(await file.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return (await api.post<ApiOrder>(`/s/subscription/orders/${orderId}/proof`, { file_name: file.name, mime_type: file.type, content_base64: btoa(bin) })).data;
  },
  cancelSubscription: async (reason: string, when: "period_end" | "immediate" = "period_end") => (await api.post("/s/subscription/cancel", { when, reason })).data,
};
