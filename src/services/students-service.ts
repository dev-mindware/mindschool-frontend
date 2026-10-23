import { normalizeNif } from "@/lib/nif";
import api from "./api";
import { fetchAllPages } from "./api-pagination";
import type { IdDocumentType, Student, StudentGender, StudentStatus } from "@/types";

// ---- Tipos da API MindEscola (o que o servidor devolve) ---------------------------------------------------------

interface ApiStudent {
  id: string;
  school_id: string;
  full_name: string;
  birth_date: string;
  gender: "masculino" | "feminino" | null;
  nif?: string | null;
  document_type: "cedula_pessoal" | "bilhete_identidade" | "certidao_nascimento" | "passaporte";
  document_number: string;
  status: "pre_inscrito" | "activo" | "transferido" | "concluido" | "inactivo";
  photo_url: string | null;
  email?: string | null;
  primary_guardian?: { id: string; full_name: string; phone: string; relationship_type: string } | null;
}

interface ApiEnrollment {
  id: string;
  student: { id: string; full_name: string };
  section: { id: string; name: string; shift: string };
  class_level: { id: string; name: string; level_number: number };
  status: string;
}

const LIVE_ENROLLMENT = ["pre_inscrito", "matriculado", "activo"];

// ---- Adaptadores API <-> modelo do frontend ---------------------------------------------------------------------

const STATUS_FROM_API: Record<ApiStudent["status"], StudentStatus> = {
  activo: "ENROLLED",
  pre_inscrito: "PENDING",
  transferido: "TRANSFERRED",
  concluido: "CANCELLED",
  inactivo: "CANCELLED",
};

const DOC_FROM_API: Record<ApiStudent["document_type"], IdDocumentType> = {
  bilhete_identidade: "IDENTITY_CARD",
  cedula_pessoal: "IDENTITY_CARD",
  certidao_nascimento: "BIRTH_CERTIFICATE",
  passaporte: "PASSPORT",
};

export const DOC_TO_API: Record<IdDocumentType, ApiStudent["document_type"]> = {
  IDENTITY_CARD: "bilhete_identidade",
  BIRTH_CERTIFICATE: "certidao_nascimento",
  PASSPORT: "passaporte",
};

export const GENDER_TO_API: Record<StudentGender, "masculino" | "feminino"> = { MALE: "masculino", FEMALE: "feminino" };

export const RELATIONSHIP_TO_API: Record<string, "pai" | "mae" | "tutor_legal" | "outro"> = {
  Pai: "pai",
  "Mãe": "mae",
  "Tutor Legal": "tutor_legal",
};

function toStudent(s: ApiStudent, enrollment?: ApiEnrollment): Student {
  return {
    id: s.id,
    schoolId: s.school_id,
    studentNumber: s.document_number, // a API identifica o aluno pelo documento (nao ha n.o de processo proprio)
    fullName: s.full_name,
    gender: s.gender === "feminino" ? "FEMALE" : "MALE",
    birthDate: s.birth_date,
    idDocumentType: DOC_FROM_API[s.document_type],
    idDocumentNumber: s.document_number,
    ...(s.nif ? { nif: s.nif } : {}),
    nationality: "",
    address: "",
    city: "",
    province: "",
    status: enrollment && s.status === "activo" ? "ENROLLED" : STATUS_FROM_API[s.status],
    guardianId: s.primary_guardian?.id ?? "",
    guardianName: s.primary_guardian?.full_name ?? "",
    guardianPhone: s.primary_guardian?.phone ?? "",
    guardianRelationship: s.primary_guardian?.relationship_type ?? "",
    currentSectionId: enrollment?.section.id ?? "",
    currentSectionName: enrollment ? `${enrollment.class_level.name} ${enrollment.section.name}` : "",
    currentClassLevel: enrollment?.class_level.name ?? "",
    academicYear: "",
    photoUrl: s.photo_url ?? undefined,
    email: s.email ?? undefined,
    createdAt: "",
    updatedAt: "",
  };
}

export interface CreateStudentInput {
  fullName: string;
  gender: StudentGender;
  birthDate: string;
  idDocumentType: IdDocumentType;
  idDocumentNumber: string;
  /** NIF opcional (cifrado na API). */
  nif?: string;
  sectionId?: string;
  guardianId?: string;
  guardianRelationship?: string;
  guardian?: { name: string; phone: string; documentNumber: string; relationship: string };
}

export const studentsService = {
  /** Alunos da escola activa, com a turma da matricula viva (juncao de `/students` e `/enrollments`). */
  list: async (search?: string): Promise<Student[]> => {
    const [students, enrollments] = await Promise.all([
      fetchAllPages<ApiStudent>("/s/students", search && search.trim().length >= 2 ? { q: search.trim() } : {}),
      fetchAllPages<ApiEnrollment>("/s/enrollments"),
    ]);
    const live = new Map<string, ApiEnrollment>();
    for (const e of enrollments) if (LIVE_ENROLLMENT.includes(e.status)) live.set(e.student.id, e);
    return students.map((s) => toStudent(s, live.get(s.id)));
  },

  /** Cria o aluno e, se indicado, matricula-o na turma e vincula o encarregado (cada passo e um pedido da API). */
  create: async (input: CreateStudentInput): Promise<Student> => {
    const { data: created } = await api.post<ApiStudent>("/s/students", {
      full_name: input.fullName,
      birth_date: input.birthDate,
      gender: GENDER_TO_API[input.gender],
      document_type: DOC_TO_API[input.idDocumentType],
      document_number: input.idDocumentNumber,
      ...(input.nif ? { nif: normalizeNif(input.nif) } : {}),
    });
    if (input.guardianId) {
      await api.post(`/s/students/${created.id}/guardians`, {
        guardian_id: input.guardianId,
        relationship_type: RELATIONSHIP_TO_API[input.guardianRelationship ?? ""] ?? "outro",
        is_primary_contact: true,
        can_view_grades: true,
        can_view_finance: true,
      });
    } else if (input.guardian) {
      const g = await api.post<{ id: string }>("/s/guardians", {
        full_name: input.guardian.name,
        phone: input.guardian.phone.startsWith("+") ? input.guardian.phone : `+244${input.guardian.phone}`,
        document_number: input.guardian.documentNumber,
      });
      await api.post(`/s/students/${created.id}/guardians`, {
        guardian_id: g.data.id,
        relationship_type: RELATIONSHIP_TO_API[input.guardian.relationship] ?? "outro",
        is_primary_contact: true,
        can_view_grades: true,
        can_view_finance: true,
      });
    }
    let enrollment: ApiEnrollment | undefined;
    if (input.sectionId) {
      const { data } = await api.post<ApiEnrollment>(`/s/students/${created.id}/enrollments`, { section_id: input.sectionId });
      enrollment = data;
    }
    return toStudent(created, enrollment);
  },

  update: async (id: string, input: Partial<Pick<CreateStudentInput, "fullName" | "gender" | "birthDate" | "idDocumentType" | "idDocumentNumber" | "nif">> & { status?: "activo" | "inactivo" }): Promise<void> => {
    await api.patch(`/s/students/${id}`, {
      ...(input.fullName ? { full_name: input.fullName } : {}),
      ...(input.birthDate ? { birth_date: input.birthDate } : {}),
      ...(input.gender ? { gender: GENDER_TO_API[input.gender] } : {}),
      ...(input.idDocumentType ? { document_type: DOC_TO_API[input.idDocumentType] } : {}),
      ...(input.idDocumentNumber ? { document_number: input.idDocumentNumber } : {}),
      ...(input.nif !== undefined ? { nif: input.nif ? normalizeNif(input.nif) : null } : {}),
      ...(input.status ? { status: input.status } : {}),
    });
  },

  /** Obtém os dados completos e paleta de cores derivada para pré-visualização do cartão de estudante. */
  getCardData: async (studentId: string): Promise<StudentCardPreviewData> => {
    const { data } = await api.get<StudentCardPreviewData>(`/s/students/${studentId}/card`);
    return data;
  },

  /** Descarrega o PDF oficial do cartão de estudante gerado no backend. */
  downloadCardPdf: async (studentId: string, studentName: string): Promise<void> => {
    const response = await api.get(`/s/students/${studentId}/card/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
    a.download = `Cartao_Estudante_${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  invite: async (studentId: string, email?: string): Promise<{ success: boolean; email: string; message: string }> => {
    const { data } = await api.post<{ success: boolean; email: string; message: string }>(`/s/students/${studentId}/invite`, { email });
    return data;
  },
};

export interface StudentCardPreviewData {
  student: {
    id: string;
    fullName: string;
    studentNumber?: string | null;
    identityCardNumber?: string | null;
    birthDate?: string | null;
    photoUrl?: string | null;
    courseName?: string | null;
    className?: string | null;
    classLevel?: string | null;
    academicYear?: string | null;
    validity?: string | null;
    address?: string | null;
  };
  school: {
    name: string;
    nif?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
  };
  palette: {
    primary: string;
    dark: string;
    medium: string;
    light: string;
    pastel: string;
    accent: string;
    textDark: string;
    textMuted: string;
    cardBg: string;
  };
  verificationUrl?: string | null;
}

