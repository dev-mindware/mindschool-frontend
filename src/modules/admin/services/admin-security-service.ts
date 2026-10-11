import api from "@/services/api";

export type AlertSeverity = "info" | "warning" | "critical";

export interface SecurityOverview {
  period: { days: number; from: string; to: string };
  alerts: { unacknowledged: number; critical_unacknowledged: number; by_type: Array<{ type: string; severity: AlertSeverity; count: number }> };
  accounts: {
    blocked: number; temporarily_locked: number; with_failed_attempts: number; titulars_without_mfa: number;
    attention: Array<{ user_id: string; email: string; full_name: string; status: string; failed_attempts: number; locked_until: string | null }>;
  };
  impersonations: { started: number; with_write: number; active_now: number };
  sensitive_operations: Array<{ operation: string; count: number }>;
}

export interface PlatformAlert {
  id: string; type: string; severity: AlertSeverity; details: unknown; created_at: string; acknowledged_at: string | null;
  school: { id: string; name: string | null } | null;
  user: { id: string; email: string | null; full_name: string | null } | null;
}

export interface AuditFilters { schoolId?: string; actorEmail?: string; action?: string; module?: string; from?: string; to?: string; text?: string }

export interface AuditRow {
  id: string; occurred_at: string; organization_id: string | null; actor: { id: string; full_name: string } | null; action: string; module: string;
  entity_type: string; entity_id: string; reason: string | null; ip: string | null;
}

export interface IntegrityResult { ok: boolean; checked: number; first_break: { id: string; seq: string; reason: string } | null; next_after_seq: string | null }

export const SEVERITY_LABEL: Record<AlertSeverity, string> = { critical: "Crítico", warning: "Aviso", info: "Informação" };

export const ALERT_TYPE_LABEL: Record<string, string> = {
  login_bruteforce: "Tentativas de entrada repetidas numa conta",
  credential_stuffing: "Muitas contas testadas a partir do mesmo IP",
  multi_school_access: "Acesso a muitas escolas em pouco tempo",
  export_off_hours: "Exportação fora do horário habitual",
  export_large_volume: "Exportação de grande volume",
};

export const OPERATION_LABEL: Record<string, string> = {
  sessions_revoked: "Sessões terminadas", user_blocked: "Utilizador bloqueado", user_unblocked: "Utilizador desbloqueado", mfa_reset: "Segundo factor reposto",
  password_reset_sent: "Link de nova palavra-passe enviado", invite_resent: "Convite reenviado", audit_search: "Pesquisa na auditoria global",
  impersonation_started: "Personificação iniciada", invite_accepted: "Convite aceite", password_reset: "Palavra-passe redefinida",
};

const clean = <T extends Record<string, string | number | undefined>>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "")) as Partial<T>;

export const adminSecurityService = {
  overview: async (days: number): Promise<SecurityOverview> => (await api.get<SecurityOverview>("/admin/security/overview", { params: { days } })).data,

  alerts: async (f: { severity?: string; onlyOpen?: boolean }): Promise<PlatformAlert[]> =>
    (await api.get<{ data: PlatformAlert[] }>("/admin/security-alerts", { params: clean({ severity: f.severity, unacknowledged: f.onlyOpen ? "true" : undefined }) })).data.data,
  acknowledge: async (id: string) => (await api.post(`/admin/security-alerts/${id}/acknowledge`, {})).data,

  /** Auditoria global: a API limita a janela a 31 dias (por omissão, os últimos 7). */
  audit: async (f: AuditFilters, cursor?: string): Promise<{ data: AuditRow[]; page: { has_more: boolean; next_cursor: string | null } }> =>
    (await api.get("/admin/audit/events", {
      params: clean({ organization_id: f.schoolId, actor_email: f.actorEmail, action: f.action, module: f.module, from: f.from, to: f.to, text: f.text, limit: 25, cursor }),
    })).data,

  integrity: async (schoolId: string, afterSeq?: string): Promise<IntegrityResult> =>
    (await api.get<IntegrityResult>("/admin/audit/integrity", { params: clean({ school_id: schoolId, after_seq: afterSeq, limit: 5000 }) })).data,
};
