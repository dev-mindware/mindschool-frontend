import api from "./api";

export type GroupRole = "group_viewer" | "group_finance" | "group_admin" | "direccao_grupo";
export const GROUP_ROLE_LABEL: Record<GroupRole, string> = {
  group_viewer: "Indicadores pedagógicos", group_finance: "Indicadores financeiros", group_admin: "Administrador do grupo", direccao_grupo: "Direcção do grupo",
};

export interface ApiGroup { id: string; name: string; role: GroupRole; permissions: string[]; schools: Array<{ id: string; name: string }> }

export interface ApiGroupSchoolRow {
  school: { id: string; name: string };
  computed_at: string;
  provisional: boolean;
  academic_year?: { id: string; name: string } | null;
  enrolled?: number;
  approval_rate?: number | null;
  cancelled_enrollments?: number;
  dropout_rate?: number | null;
  invoiced?: string;
  collected?: string;
  collection_rate?: number | null;
  overdue_balance?: string;
  delinquency_rate?: number | null;
}

export interface ApiGroupDashboard {
  group: { id: string; name: string };
  computed_at: string | null;
  role: GroupRole;
  schools: ApiGroupSchoolRow[];
  totals: { schools: number; enrolled?: number; approval_rate?: number | null; dropout_rate?: number | null; invoiced?: string; collected?: string; collection_rate?: number | null; delinquency_rate?: number | null; provisional_schools: number };
  note: string;
}

export interface ApiGroupMember { user_id: string; email: string; full_name: string; role: GroupRole; granted_at: string }

export const groupsService = {
  mine: async (): Promise<ApiGroup[]> => (await api.get<{ data: ApiGroup[] }>("/groups")).data.data,
  dashboard: async (id: string): Promise<ApiGroupDashboard> => (await api.get<ApiGroupDashboard>(`/groups/${id}/dashboard`)).data,
  refresh: async (id: string) => (await api.post<{ refreshed: number }>(`/groups/${id}/refresh`, {})).data,
  members: async (id: string): Promise<ApiGroupMember[]> => (await api.get<{ data: ApiGroupMember[] }>(`/groups/${id}/members`)).data.data,
  addMember: async (id: string, email: string, role: GroupRole) => (await api.post(`/groups/${id}/members`, { email, role })).data,
  setRole: async (id: string, userId: string, role: GroupRole) => (await api.patch(`/groups/${id}/members/${userId}`, { role })).data,
  removeMember: async (id: string, userId: string) => (await api.delete(`/groups/${id}/members/${userId}`)).data,
};
