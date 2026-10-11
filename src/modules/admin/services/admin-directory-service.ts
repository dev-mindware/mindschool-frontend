import api from "@/services/api";
import { fetchAllPages } from "@/services/api-pagination";

// ---- Tipos (API /admin) -----------------------------------------------------------------------------------------------

export type SubscriptionStatus = "trial" | "active" | "past_due" | "grace" | "suspended" | "cancelled" | "expired";

export interface ActivationSummary {
  done: number;
  total: number;
  percent: number;
  status: "completa" | "em_curso" | "parada";
  next_step: { key: string; label: string } | null;
  days_inactive: number;
}

export interface AdminSchool {
  id: string;
  name: string;
  nif: string;
  med_code: string | null;
  subsystem: "geral" | "tecnico_profissional" | "formacao_professores";
  status: string;
  created_at: string;
  subscription: { status: SubscriptionStatus; plan: { code: string; name: string }; ends_at: string | null; days_left: number | null } | null;
  usage: { students: number; internal_users: number };
  activation: ActivationSummary;
  last_login_at: string | null;
  titular: { user_id: string; email: string; full_name: string; mfa_enabled: boolean; last_login_at: string | null } | null;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  status: "activo" | "suspenso" | "bloqueado";
  mfa_enabled: boolean;
  locked: boolean;
  invite_pending: boolean;
  last_login_at: string | null;
  created_at: string;
  memberships: Array<{ school: { id: string; name: string }; role: string; is_active: boolean }>;
}

export interface AdminUsersPage {
  data: AdminUser[];
  page: { limit: number; has_more: boolean; next_cursor: string | null };
}

export interface OnboardSchoolInput {
  name: string;
  nif: string;
  subsystem: AdminSchool["subsystem"];
  fiscalSeriesPrefix: string;
  medCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  trialDays?: number;
  titularName: string;
  titularEmail: string;
}

export interface OnboardResult {
  school: { id: string; name: string };
  titular: { user_id: string; email: string; full_name: string; is_new_user: boolean; invite: { sent: true } | { sent: false; reason: string } | null };
}

export type UserAction = "block" | "unblock" | "mfa/reset" | "sessions/revoke" | "password-reset" | "invite/resend";

export const USER_ACTION_LABEL: Record<UserAction, string> = {
  block: "Bloquear utilizador",
  unblock: "Desbloquear utilizador",
  "mfa/reset": "Repor segundo factor",
  "sessions/revoke": "Terminar sessões",
  "password-reset": "Repor palavra-passe",
  "invite/resend": "Reenviar convite",
};

/** Resposta de «repor palavra-passe» e «reenviar convite»: o link vai por email ao utilizador, nunca ao administrador. */
export type EmailActionResult = { user_id: string; sent: true } | { user_id: string; sent: false; reason: string };

export const EMAIL_FAILURE_LABEL: Record<string, string> = {
  canal_email_nao_configurado: "o canal de email não está configurado",
  email_invalido: "o email do utilizador é inválido",
  falha_no_envio: "o envio falhou",
};

export const adminDirectoryService = {
  schools: () => fetchAllPages<AdminSchool>("/admin/schools"),

  onboard: async (v: OnboardSchoolInput): Promise<OnboardResult> =>
    (await api.post<OnboardResult>("/admin/schools/onboard", {
      name: v.name,
      nif: v.nif,
      subsystem: v.subsystem,
      fiscal_series_prefix: v.fiscalSeriesPrefix,
      ...(v.medCode ? { med_code: v.medCode } : {}),
      ...(v.phone ? { phone: v.phone } : {}),
      ...(v.email ? { email: v.email } : {}),
      ...(v.address ? { address: v.address } : {}),
      ...(v.trialDays ? { trial_days: v.trialDays } : {}),
      titular: { email: v.titularEmail, full_name: v.titularName },
    })).data,

  users: async (p: { q?: string; status?: string; schoolId?: string; cursor?: string }): Promise<AdminUsersPage> =>
    (await api.get<AdminUsersPage>("/admin/users", { params: { limit: 25, ...(p.q ? { q: p.q } : {}), ...(p.status ? { status: p.status } : {}), ...(p.schoolId ? { school_id: p.schoolId } : {}), ...(p.cursor ? { cursor: p.cursor } : {}) } })).data,

  /** Acções de suporte: exigem motivo (>= 10 caracteres) e reautenticação (a janela abre sozinha). */
  userAction: async (id: string, action: UserAction, reason: string, ticket?: string) =>
    (await api.post(`/admin/users/${id}/${action}`, { reason, ...(ticket ? { ticket } : {}) })).data,
};
