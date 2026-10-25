import api from "./api";
import { fetchAllPages } from "./api-pagination";
import type { Guardian, GuardianRelationship } from "@/types";
import { normalizeNif } from "@/lib/nif";

interface ApiGuardian {
  id: string;
  school_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  document_number: string;
  nif?: string | null;
  profession?: string | null;
  wards: Array<{ student_id: string; student_name: string; relationship_type: string; is_primary_contact: boolean }>;
}

const REL_FROM_API: Record<string, GuardianRelationship> = { pai: "FATHER", mae: "MOTHER", tutor_legal: "LEGAL_GUARDIAN", outro: "OTHER" };
export const REL_TO_API: Record<string, "pai" | "mae" | "tutor_legal" | "outro"> = {
  FATHER: "pai",
  MOTHER: "mae",
  LEGAL_GUARDIAN: "tutor_legal",
  TUTOR: "tutor_legal",
  UNCLE: "outro",
  GRANDPARENT: "outro",
  OTHER: "outro",
};

const toGuardian = (g: ApiGuardian): Guardian => ({
  id: g.id,
  schoolId: g.school_id,
  fullName: g.full_name,
  idDocumentNumber: g.document_number,
  nif: g.nif ?? undefined,
  profession: g.profession ?? undefined,
  phonePrimary: g.phone,
  email: g.email ?? undefined,
  // O canal preferido por tipo de evento vive em `notification-preferences`; aqui mostra-se o canal por omissao.
  preferredContactChannel: "WHATSAPP",
  wards: g.wards.map((w) => ({
    studentId: w.student_id,
    studentName: w.student_name,
    relationship: REL_FROM_API[w.relationship_type] ?? "OTHER",
    isPrimaryContact: w.is_primary_contact,
  })),
  createdAt: "",
  updatedAt: "",
});

const phone = (p: string) => (p.startsWith("+") ? p : `+244${p.replace(/\s+/g, "")}`);

export interface GuardianInput {
  fullName: string;
  documentNumber: string;
  phone: string;
  email?: string;
  /** NIF opcional; vazio apaga o que estava guardado. */
  nif?: string;
  profession?: string;
  wards: Array<{ studentId: string; relationship: string; isPrimaryContact?: boolean }>;
}

export const guardiansService = {
  list: async (): Promise<Guardian[]> => (await fetchAllPages<ApiGuardian>("/s/guardians")).map(toGuardian),

  create: async (input: GuardianInput): Promise<void> => {
    const { data } = await api.post<{ id: string }>("/s/guardians", {
      full_name: input.fullName,
      document_number: input.documentNumber,
      phone: phone(input.phone),
      ...(input.email ? { email: input.email } : {}),
      ...(input.nif ? { nif: normalizeNif(input.nif) } : {}),
      ...(input.profession ? { profession: input.profession } : {}),
    });
    for (const w of input.wards) await guardiansService.link(w.studentId, data.id, w.relationship, w.isPrimaryContact);
  },

  update: async (id: string, input: GuardianInput, previousWardIds: string[]): Promise<void> => {
    await api.patch(`/s/guardians/${id}`, {
      full_name: input.fullName,
      document_number: input.documentNumber,
      phone: phone(input.phone),
      email: input.email || null,
      nif: input.nif ? normalizeNif(input.nif) : null,
      profession: input.profession || null,
    });
    const keep = new Set(input.wards.map((w) => w.studentId));
    for (const sid of previousWardIds) if (!keep.has(sid)) await api.delete(`/s/students/${sid}/guardians/${id}`);
    for (const w of input.wards) if (!previousWardIds.includes(w.studentId)) await guardiansService.link(w.studentId, id, w.relationship, w.isPrimaryContact);
  },

  link: async (studentId: string, guardianId: string, relationship: string, primary = false): Promise<void> => {
    await api.post(`/s/students/${studentId}/guardians`, {
      guardian_id: guardianId,
      relationship_type: REL_TO_API[relationship] ?? "outro",
      is_primary_contact: primary,
      can_view_grades: true,
      can_view_finance: primary,
    });
  },

  invite: async (guardianId: string, email?: string): Promise<{ success: boolean; email: string; message: string }> => {
    const { data } = await api.post<{ success: boolean; email: string; message: string }>(`/s/guardians/${guardianId}/invite`, { email });
    return data;
  },
};
