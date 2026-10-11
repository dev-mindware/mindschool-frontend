import api from "@/services/api";

export type ImpersonationMode = "leitura" | "escrita";

export interface StartedImpersonation {
  impersonation_id: string;
  mode: ImpersonationMode;
  access_token: string;
  expires_in: number;
  expires_at: string;
}

export interface AdminImpersonation {
  id: string;
  reason: string;
  started_at: string;
  expires_at: string;
  revoked_at: string | null;
  active: boolean;
  mode: ImpersonationMode;
  admin: { id: string; email: string; full_name: string } | null;
  target: { id: string; email: string; full_name: string } | null;
  school: { id: string; name: string } | null;
}

export const adminImpersonationService = {
  /** Exige motivo (>= 10 caracteres), duração até 30 minutos e reautenticação (a janela abre sozinha). Por omissão só leitura. */
  start: async (v: { targetUserId: string; schoolId: string; reason: string; durationMinutes: number; mode: ImpersonationMode }): Promise<StartedImpersonation> =>
    (await api.post<StartedImpersonation>("/admin/impersonations", { target_user_id: v.targetUserId, school_id: v.schoolId, reason: v.reason, duration_minutes: v.durationMinutes, mode: v.mode })).data,
  list: async (): Promise<AdminImpersonation[]> => (await api.get<{ data: AdminImpersonation[] }>("/admin/impersonations")).data.data,
  revoke: async (id: string) => (await api.delete(`/admin/impersonations/${id}`)).data,
};
