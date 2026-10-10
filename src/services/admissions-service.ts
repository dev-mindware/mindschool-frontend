import api from "./api";
import { fetchAllPages } from "./api-pagination";
import { academicService } from "./academic-service";
import type { AdmissionApplication, AdmissionStatus, Candidate, EntranceExam } from "@/types/admission";

// ---- API ----------------------------------------------------------------------------------------------------------

interface ApiCandidate {
  id: string;
  school_id: string;
  full_name: string;
  birth_date: string;
  document_type: "cedula_pessoal" | "bilhete_identidade" | "certidao_nascimento" | "passaporte";
  document_number: string;
  guardian_name: string;
  guardian_phone: string;
  previous_school_name: string | null;
  converted_student_id: string | null;
  created_at: string;
}

interface ApiApplication {
  id: string;
  school_id: string;
  academic_year_id: string;
  candidate: ApiCandidate;
  desired_class_level: { id: string; name: string; level_number: number };
  status: string;
  requires_entrance_exam: boolean;
  exam_score: string | null;
  waitlist_position: number | null;
  decided_at: string | null;
  decided_by: string | null;
  decision_notes: string | null;
}

interface ApiSession {
  id: string;
  title: string;
  class_level: { id: string; name: string } | null;
  scheduled_at: string;
  location: string | null;
  capacity: number;
  registered: number;
  status: "agendada" | "realizada" | "cancelada";
}

const STATUS: Record<string, AdmissionStatus> = {
  submetida: "SUBMITTED",
  documentos_validados: "DOCS_VALIDATED",
  em_avaliacao: "UNDER_REVIEW",
  aprovada: "APPROVED",
  lista_espera: "WAITLIST",
  reprovada: "REJECTED",
  matriculada: "ENROLLED",
  desistiu: "WITHDRAWN",
};

const DOC_TYPE: Record<ApiCandidate["document_type"], Candidate["idDocumentType"]> = {
  bilhete_identidade: "IDENTITY_CARD",
  cedula_pessoal: "IDENTITY_CARD",
  certidao_nascimento: "BIRTH_CERTIFICATE",
  passaporte: "PASSPORT",
};
const DOC_TO_API = { IDENTITY_CARD: "bilhete_identidade", BIRTH_CERTIFICATE: "certidao_nascimento", PASSPORT: "passaporte" } as const;

const toCandidate = (c: ApiCandidate): Candidate => ({
  id: c.id,
  schoolId: c.school_id,
  fullName: c.full_name,
  gender: "MALE",
  birthDate: c.birth_date,
  idDocumentType: DOC_TYPE[c.document_type],
  idDocumentNumber: c.document_number,
  nationality: "",
  guardianName: c.guardian_name,
  guardianPhone: c.guardian_phone,
  guardianRelationship: "OTHER",
  previousSchoolName: c.previous_school_name ?? undefined,
  convertedStudentId: c.converted_student_id ?? undefined,
  createdAt: c.created_at,
});

const toApplication = (a: ApiApplication): AdmissionApplication => ({
  id: a.id,
  schoolId: a.school_id,
  applicationNumber: `CAND-${a.id.slice(-6).toUpperCase()}`,
  candidateId: a.candidate.id,
  candidateName: a.candidate.full_name,
  candidateGender: "MALE",
  candidateBirthDate: a.candidate.birth_date,
  candidateDocumentNumber: a.candidate.document_number,
  guardianName: a.candidate.guardian_name,
  guardianPhone: a.candidate.guardian_phone,
  academicYearId: a.academic_year_id,
  academicYear: "",
  desiredClassLevelId: a.desired_class_level.id,
  desiredClassLevelName: a.desired_class_level.name,
  desiredShift: "MORNING",
  requiresEntranceExam: a.requires_entrance_exam,
  examScore: a.exam_score === null ? undefined : Number(a.exam_score),
  minPassingScore: 10,
  waitlistPosition: a.waitlist_position ?? undefined,
  status: STATUS[a.status] ?? "SUBMITTED",
  decisionNotes: a.decision_notes ?? undefined,
  decidedBy: a.decided_by ?? undefined,
  decidedAt: a.decided_at ?? undefined,
  submissionDate: a.candidate.created_at,
});

const toExam = (s: ApiSession): EntranceExam => ({
  id: s.id,
  schoolId: "",
  title: s.title,
  purpose: "prova_admissao",
  subjectName: "Prova de acesso",
  classLevelId: s.class_level?.id ?? "",
  classLevelName: s.class_level?.name ?? "Todas as classes",
  examDate: s.scheduled_at,
  roomNumber: s.location ?? "",
  maxCapacity: s.capacity,
  enrolledCandidatesCount: s.registered,
  minPassingScore: 10,
  passingWeight: 100,
  status: s.status === "realizada" ? "COMPLETED" : "SCHEDULED",
});

const levelNumber = (name: string) => Number(name.match(/\d+/)?.[0] ?? NaN);

export const admissionsService = {
  applications: async (): Promise<ApiApplication[]> => fetchAllPages<ApiApplication>("/s/admission-applications"),
  mapApplications: (rows: ApiApplication[]) => rows.map(toApplication),
  mapCandidates: (rows: ApiApplication[]) => [...new Map(rows.map((a) => [a.candidate.id, toCandidate(a.candidate)])).values()],
  sessions: async (): Promise<EntranceExam[]> => (await fetchAllPages<ApiSession>("/s/admission-exam-sessions")).map(toExam),

  /** Candidatura (cria o candidato se ainda nao existir) para o ano lectivo activo; a classe resolve-se pelo numero. */
  submit: async (v: { fullName: string; birthDate: string; idDocumentType: Candidate["idDocumentType"]; idDocumentNumber: string; guardianName: string; guardianPhone: string; previousSchoolName?: string; desiredClassLevelName: string }) => {
    const [year, levels] = await Promise.all([academicService.activeYear(), academicService.classLevels()]);
    if (!year) throw new Error("Não há ano lectivo activo.");
    const n = levelNumber(v.desiredClassLevelName);
    const level = levels.find((l) => l.level_number === n) ?? levels.find((l) => l.name === v.desiredClassLevelName);
    if (!level) throw new Error(`A classe "${v.desiredClassLevelName}" não existe nesta escola.`);
    const { data } = await api.post<ApiApplication>("/s/admission-applications", {
      academic_year_id: year.id,
      desired_class_level_id: level.id,
      candidate: {
        full_name: v.fullName,
        birth_date: v.birthDate,
        document_type: DOC_TO_API[v.idDocumentType],
        document_number: v.idDocumentNumber,
        guardian_name: v.guardianName,
        guardian_phone: v.guardianPhone.startsWith("+") ? v.guardianPhone : `+244${v.guardianPhone}`,
        ...(v.previousSchoolName ? { previous_school_name: v.previousSchoolName } : {}),
      },
    });
    return data;
  },

  validateDocuments: async (id: string) => void (await api.post(`/s/admission-applications/${id}/validate-documents`, {})),
  gradeExam: async (id: string, score: number) => void (await api.post(`/s/admission-applications/${id}/exam-score`, { exam_score: score })),
  decide: async (id: string, decision: "aprovada" | "lista_espera" | "reprovada", notes: string) =>
    void (await api.post(`/s/admission-applications/${id}/decision`, { decision, ...(notes ? { notes } : {}) })),
  promoteWaitlist: async (academicYearId: string, classLevelId: string) =>
    void (await api.post(`/s/admission-applications/waitlist/promote`, {}, { params: { academic_year_id: academicYearId, class_level_id: classLevelId } })),
  convert: async (id: string, sectionId: string): Promise<{ studentId: string; enrollmentId: string }> => {
    const { data } = await api.post<{ student?: { id: string }; enrollment?: { id: string }; student_id?: string; enrollment_id?: string; id?: string }>(
      `/s/admission-applications/${id}/convert`,
      { section_id: sectionId },
    );
    return { studentId: data.student?.id ?? data.student_id ?? "", enrollmentId: data.enrollment?.id ?? data.enrollment_id ?? data.id ?? "" };
  },
};
