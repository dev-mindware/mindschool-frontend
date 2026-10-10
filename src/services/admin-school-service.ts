import api from "./api";
import { fetchAllPages } from "./api-pagination";

// ---- Utilizadores e papeis ------------------------------------------------------------------------------------

export type SchoolRole = "titular" | "direccao_pedagogica" | "secretaria" | "professor" | "financeiro" | "encarregado" | "aluno" | "admin_sistema" | "auditor_med";

export const ROLE_LABEL: Record<SchoolRole, string> = {
  titular: "Direcção Geral (Titular)", direccao_pedagogica: "Direcção Pedagógica", secretaria: "Secretaria", professor: "Professor", financeiro: "Financeiro",
  encarregado: "Encarregado", aluno: "Aluno", admin_sistema: "Administrador do sistema", auditor_med: "Auditor do MED",
};

export interface ApiMembership { id: string; role: SchoolRole; is_active: boolean; granted_at: string; user: { id: string; email: string; full_name: string; status: string } }

// ---- Professores -------------------------------------------------------------------------------------------------

export type TeacherStatus = "activo" | "licenca" | "desvinculado";
export interface ApiTeacherFull { id: string; user_id: string | null; full_name: string; email: string | null; document_number: string; academic_qualification: string | null; status: TeacherStatus }
export interface ApiQrCredential { id: string; credential_type: "app_dinamico" | "cartao_fisico"; status: string; issued_at: string; expires_at: string | null; blocked_reason: string | null; qr_payload?: string }
export interface ApiAvailabilityBlock { weekday: number; start: string; end: string; reason?: string }

// ---- Auditoria ----------------------------------------------------------------------------------------------------

export interface ApiAuditEvent {
  id: string;
  occurred_at: string;
  actor: { id: string; full_name: string };
  action: string;
  module: string;
  entity_type: string;
  entity_id: string;
  reason: string | null;
  request_id: string | null;
  ip: string | null;
}

export interface AuditFilters { module?: string; action?: string; entity_type?: string; text?: string; from?: string; to?: string }

// ---- Importacoes ---------------------------------------------------------------------------------------------------

export type ImportKind = "students" | "enrollments" | "grades";
export interface ApiImportJob {
  id: string;
  status: string;
  policy: string;
  summary: Record<string, number>;
  result: { created: number; updated: number; ignored: number; failed: number } | null;
  created_at: string;
  preview?: Array<{ line: number; status: string; errors?: Array<{ field: string; message: string }>; values?: Record<string, string> }>;
}

const base = (k: ImportKind) => (k === "students" ? "/s/imports" : `/s/imports/${k}`);

export const adminSchoolService = {
  memberships: () => fetchAllPages<ApiMembership>("/s/memberships"),
  grant: async (v: { email: string; role: SchoolRole; fullName?: string; password?: string; invite: boolean }) =>
    (await api.post("/s/memberships", { email: v.email, role: v.role, invite: v.invite, ...(v.fullName ? { full_name: v.fullName } : {}), ...(v.password ? { password: v.password } : {}) })).data,
  revoke: async (id: string) => (await api.delete(`/s/memberships/${id}`)).data,

  teachers: () => fetchAllPages<ApiTeacherFull>("/s/teachers"),
  createTeacher: async (v: { userId: string; documentNumber: string; qualification?: string }) =>
    (await api.post<ApiTeacherFull>("/s/teachers", { user_id: v.userId, document_number: v.documentNumber, ...(v.qualification ? { academic_qualification: v.qualification } : {}) })).data,
  updateTeacher: async (id: string, v: { status?: TeacherStatus; documentNumber?: string; qualification?: string | null }) =>
    (await api.patch<ApiTeacherFull>(`/s/teachers/${id}`, {
      ...(v.status ? { status: v.status } : {}), ...(v.documentNumber ? { document_number: v.documentNumber } : {}), ...(v.qualification !== undefined ? { academic_qualification: v.qualification } : {}),
    })).data,
  credentials: async (teacherId: string): Promise<ApiQrCredential[]> => (await api.get<{ data: ApiQrCredential[] }>(`/s/teachers/${teacherId}/qr-credentials`)).data.data,
  issueCredential: async (teacherId: string, type: "app_dinamico" | "cartao_fisico"): Promise<ApiQrCredential> => (await api.post<ApiQrCredential>(`/s/teachers/${teacherId}/qr-credentials`, { credential_type: type })).data,
  blockCredential: async (id: string, reason: string) => (await api.post(`/s/qr-credentials/${id}/block`, { reason })).data,
  availability: async (teacherId: string): Promise<ApiAvailabilityBlock[]> => {
    const { data } = await api.get<{ blocks?: ApiAvailabilityBlock[]; data?: ApiAvailabilityBlock[] }>(`/s/teachers/${teacherId}/availability`);
    return data.blocks ?? data.data ?? [];
  },
  setAvailability: async (teacherId: string, blocks: ApiAvailabilityBlock[]) => (await api.put(`/s/teachers/${teacherId}/availability`, { blocks })).data,

  audit: async (f: AuditFilters, cursor?: string): Promise<{ data: ApiAuditEvent[]; page: { has_more: boolean; next_cursor: string | null } }> =>
    (await api.get("/s/audit/events", { params: { ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)), limit: 50, ...(cursor ? { cursor } : {}) } })).data,
  auditEvent: async (id: string): Promise<{ before?: unknown; after?: unknown; reason?: string | null }> => (await api.get(`/s/audit/events/${id}`)).data,

  templates: async (): Promise<Array<{ template_code: string; name: string; operation?: string }>> => (await api.get<{ data: Array<{ template_code: string; name: string; operation?: string }> }>("/s/imports/templates")).data.data,
  templateCsv: async (k: ImportKind): Promise<string> =>
    (await api.get<string>(k === "students" ? "/s/imports/templates/students/download" : `/s/imports/${k}/template`, { responseType: "text" })).data,
  validateImport: async (k: ImportKind, csv: string, filename: string, extra: { assessmentId?: string } = {}): Promise<ApiImportJob> =>
    (await api.post<ApiImportJob>(k === "students" ? "/s/imports/students/validate" : `${base(k)}/validate`, { csv, filename, ...(extra.assessmentId ? { assessment_id: extra.assessmentId } : {}) })).data,
  job: async (k: ImportKind, id: string): Promise<ApiImportJob> => (await api.get<ApiImportJob>(`${base(k)}/jobs/${id}`)).data,
  commitImport: async (k: ImportKind, id: string, policy: "all_or_nothing" | "valid_rows_only"): Promise<ApiImportJob> => (await api.post<ApiImportJob>(`${base(k)}/jobs/${id}/commit`, { policy })).data,
  errorsCsv: async (k: ImportKind, id: string): Promise<string> => (await api.get<string>(`${base(k)}/jobs/${id}/errors`, { responseType: "text" })).data,
  jobs: async (): Promise<ApiImportJob[]> => (await api.get<{ data: ApiImportJob[] }>("/s/imports/jobs")).data.data,
};
