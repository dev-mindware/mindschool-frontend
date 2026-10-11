import api from "@/services/api";
import type { ActivationSummary, SubscriptionStatus } from "@/modules/admin/services/admin-directory-service";

// ---- Tipos (API /admin/schools/{id}) ------------------------------------------------------------------------------------

export interface AdminSchoolDetail {
  school: {
    id: string; name: string; nif: string; med_code: string | null; subsystem: string; status: string; phone: string | null; email: string | null;
    address: string | null; school_group_id: string | null; fiscal_series_prefix: string; created_at: string;
  };
  subscription: {
    status: SubscriptionStatus; plan: { code: string; name: string }; ends_at: string | null; days_left: number | null; trial_ends_at: string | null;
    period_start: string | null; period_end: string | null; cancel_at_period_end: boolean; pending_plan: { code: string; name: string } | null;
    credit_balance: string; addons: Array<{ code: string; name: string; status: string; ends_at: string | null }>;
  } | null;
  orders: Array<{ id: string; kind: string; status: string; plan: { code: string; name: string }; period_months: number; total_amount: string; currency: string; created_at: string; decided_at: string | null }>;
  usage: { students: number; teachers: number; sections: number; internal_users: number; family_users: number; roles: Record<string, number> };
  activation: ActivationSummary & { items: Array<{ key: string; label: string; hint: string; done: boolean }> };
  last_login_at: string | null;
  titulars: Array<{ user_id: string; email: string; full_name: string; mfa_enabled: boolean; last_login_at: string | null }>;
}

export interface AdminEntitlements {
  features: Array<{ key: string; state: string; entitled: boolean; source: string | null; reason: string }>;
  quotas: Array<{ key: string; unit: string; limit: number | null; used: number; remaining: number | null; policy: string; state: "OK" | "ALERT" | "LIMIT_REACHED"; alert_threshold: number }>;
  overrides: Array<{ key: string; value: unknown; ends_at: string; reason: string }>;
}

export interface AdminOverride { id: string; key: string; value: unknown; starts_at: string; ends_at: string; active: boolean; reason: string; ticket?: string | null }

export interface AdminAuditEvent {
  id: string; occurred_at: string; organization_id: string | null; actor: { id: string; full_name: string } | null; action: string; module: string;
  entity_type: string; entity_id: string; reason: string | null;
}

export interface AdminSecurityAlert { id: string; type: string; severity: string; user_id: string | null; school_id: string | null; details: unknown; created_at: string; acknowledged_at: string | null }

export const QUOTA_LABEL: Record<string, string> = {
  students: "Alunos", users: "Utilizadores internos", teachers: "Professores", sections: "Turmas", exports_month: "Exportações por mês", academic_years_active: "Anos lectivos activos", storage_mb: "Armazenamento (MB)",
};

export const adminSchoolService = {
  detail: async (id: string): Promise<AdminSchoolDetail> => (await api.get<AdminSchoolDetail>(`/admin/schools/${id}`)).data,
  entitlements: async (id: string): Promise<AdminEntitlements> => (await api.get<AdminEntitlements>(`/admin/schools/${id}/entitlements`)).data,
  overrides: async (id: string): Promise<AdminOverride[]> => (await api.get<{ data: AdminOverride[] }>(`/admin/schools/${id}/entitlement-overrides`)).data.data,
  createOverride: async (id: string, v: { key: string; value: boolean | number | null; endsAt: string; reason: string; ticket?: string }) =>
    (await api.post(`/admin/schools/${id}/entitlement-overrides`, { key: v.key, value: v.value, ends_at: v.endsAt, reason: v.reason, ...(v.ticket ? { ticket: v.ticket } : {}) })).data,
  suspend: async (id: string, reason: string, ticket?: string) => (await api.post(`/admin/schools/${id}/subscription/suspend`, { reason, ...(ticket ? { ticket } : {}) })).data,
  reactivate: async (id: string, reason: string, ticket?: string) => (await api.post(`/admin/schools/${id}/subscription/reactivate`, { reason, ...(ticket ? { ticket } : {}) })).data,
  audit: async (id: string, cursor?: string): Promise<{ data: AdminAuditEvent[]; page: { has_more: boolean; next_cursor: string | null } }> =>
    (await api.get("/admin/audit/events", { params: { organization_id: id, limit: 25, ...(cursor ? { cursor } : {}) } })).data,
  alerts: async (id: string): Promise<AdminSecurityAlert[]> => (await api.get<{ data: AdminSecurityAlert[] }>("/admin/security-alerts", { params: { school_id: id } })).data.data,
  acknowledgeAlert: async (alertId: string) => (await api.post(`/admin/security-alerts/${alertId}/acknowledge`, {})).data,
};
