import { User } from "@/types";
import { ApiMe, ApiSubscription, mapApiSubscription, mapApiUser } from "@/utils/map-api-user";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import api from "./api";

export const authService = {
  /** Utilizador actual + escolas a que pertence (`GET /auth/me`); sincroniza a escola activa. */
  getMe: async (): Promise<User | null> => {
    try {
      const response = await api.get<ApiMe>("/auth/me");
      const store = useActiveSchoolStore.getState();
      store.setMemberships(
        response.data.memberships.map((m) => ({ schoolId: m.school_id, schoolName: m.school_name, roles: m.roles, permissions: m.permissions, viaGroup: m.via_group === true })),
      );
      const schoolId = useActiveSchoolStore.getState().schoolId;
      // Encarregado e aluno não têm permissão sobre a subscrição (403): não se pede.
      const roles = response.data.memberships.find((m) => m.school_id === schoolId)?.roles ?? [];
      const familyOnly = roles.length > 0 && roles.every((r) => ["encarregado", "aluno"].includes(r));
      const sub = schoolId && !familyOnly ? await api.get<ApiSubscription>(`/schools/${schoolId}/subscription/entitlements`).then((r) => mapApiSubscription(r.data)).catch(() => undefined) : undefined;
      return mapApiUser(response.data, schoolId, sub);
    } catch (error) {
      console.error("Erro ao obter o utilizador actual:", error);
      return null;
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    await api.post("/auth/forgot-password", { email });
    return { message: "Se o email existir, enviámos as instruções." };
  },

  resetPassword: async (data: { token: string; newPassword: string }): Promise<{ message: string }> => {
    await api.post("/auth/reset-password", { token: data.token, password: data.newPassword });
    return { message: "Palavra-passe redefinida." };
  },

  /** A API ainda nao tem "alterar password" autenticado (so recuperacao por email). */
  changePassword: async (_data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    throw new Error("A alteração de palavra-passe autenticada ainda não está disponível; use a recuperação por email.");
  },
};
