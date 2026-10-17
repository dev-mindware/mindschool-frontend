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
  entrance_exam_session_id?: string | null;
  entrance_exam_title?: string | null;
  exam_score: string | null;
  waitlist_position: number | null;
  decided_at: string | null;
  decided_by: string | null;
  decision_notes: string | null;
  photo_url?: string | null;
  id_document_url?: string | null;
  school_certificate_url?: string | null;
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

// Local helpers to track designated exam session and uploaded documents
const PENDING_SESSIONS_KEY = "mindware_admission_pending_sessions";
const APPLICATION_DOCS_KEY = "mindware_admission_application_docs";

export interface ApplicationDocuments {
  passportPhotoUrl?: string;
  passportPhotoName?: string;
  passportPhotoSize?: number;
  idDocumentCopyName?: string;
  idDocumentCopyUrl?: string;
  idDocumentCopySize?: number;
  schoolCertificateName?: string;
  schoolCertificateUrl?: string;
  schoolCertificateSize?: number;
  previousSchoolCertificateUrl?: string;
}

export const getApplicationDocs = (
  applicationId: string,
  docNumber?: string,
  candidateId?: string
): ApplicationDocuments | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${APPLICATION_DOCS_KEY}_${applicationId}`);
    if (raw) return JSON.parse(raw);

    if (docNumber) {
      const cleanDoc = docNumber.replace(/\s+/g, "").toUpperCase();
      const rawByDoc = localStorage.getItem(`${APPLICATION_DOCS_KEY}_doc_${cleanDoc}`);
      if (rawByDoc) return JSON.parse(rawByDoc);
    }

    if (candidateId) {
      const rawByCand = localStorage.getItem(`${APPLICATION_DOCS_KEY}_cand_${candidateId}`);
      if (rawByCand) return JSON.parse(rawByCand);
    }

    return null;
  } catch {
    return null;
  }
};

export const saveApplicationDocs = (
  applicationId: string,
  docs: ApplicationDocuments,
  meta?: { docNumber?: string; candidateId?: string }
) => {
  if (typeof window === "undefined") return;
  try {
    // Apenas armazena metadados leves; os ficheiros binários ficam no storage oficial da escola
    const metaOnly: ApplicationDocuments = {
      passportPhotoName: docs.passportPhotoName,
      passportPhotoSize: docs.passportPhotoSize,
      idDocumentCopyName: docs.idDocumentCopyName,
      idDocumentCopySize: docs.idDocumentCopySize,
      schoolCertificateName: docs.schoolCertificateName,
      schoolCertificateSize: docs.schoolCertificateSize,
    };
    const serialized = JSON.stringify(metaOnly);
    localStorage.setItem(`${APPLICATION_DOCS_KEY}_${applicationId}`, serialized);

    if (meta?.docNumber) {
      const cleanDoc = meta.docNumber.replace(/\s+/g, "").toUpperCase();
      localStorage.setItem(`${APPLICATION_DOCS_KEY}_doc_${cleanDoc}`, serialized);
    }

    if (meta?.candidateId) {
      localStorage.setItem(`${APPLICATION_DOCS_KEY}_cand_${meta.candidateId}`, serialized);
    }
  } catch (e) {
    console.warn("Storage quota:", e);
  }
};

export const getPendingSession = (applicationId: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_SESSIONS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[applicationId] || null;
  } catch {
    return null;
  }
};

export const savePendingSession = (applicationId: string, sessionId: string) => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PENDING_SESSIONS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[applicationId] = sessionId;
    localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Storage quota:", e);
  }
};

const toApplication = (a: ApiApplication): AdmissionApplication => {
  const pendingSessionId = getPendingSession(a.id);
  const docs = getApplicationDocs(a.id, a.candidate?.document_number, a.candidate?.id);
  const certUrl = a.school_certificate_url || docs?.schoolCertificateUrl || docs?.previousSchoolCertificateUrl;
  const requiresExam = Boolean(a.requires_entrance_exam || a.entrance_exam_title || pendingSessionId);
  return {
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
    requiresEntranceExam: requiresExam,
    entranceExamId: a.entrance_exam_session_id || pendingSessionId || undefined,
    entranceExamTitle: a.entrance_exam_title || (requiresExam ? "Prova de Acesso" : undefined),
    examScore: a.exam_score === null ? undefined : Number(a.exam_score),
    minPassingScore: 10,
    waitlistPosition: a.waitlist_position ?? undefined,
    status: STATUS[a.status] ?? "SUBMITTED",
    decisionNotes: a.decision_notes ?? undefined,
    decidedBy: a.decided_by ?? undefined,
    decidedAt: a.decided_at ?? undefined,
    submissionDate: a.candidate.created_at,
    passportPhotoUrl: a.photo_url || docs?.passportPhotoUrl,
    idDocumentCopyUrl: a.id_document_url || docs?.idDocumentCopyUrl,
    previousSchoolCertificateUrl: certUrl,
  };
};

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
  sessions: async (): Promise<EntranceExam[]> => {
    const res = await api.get<{ data: ApiSession[] }>("/s/admission-exam-sessions");
    const list = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
    return list.map(toExam);
  },

  /** Candidatura (cria o candidato se ainda nao existir) para o ano lectivo activo; a classe resolve-se pelo numero. */
  submit: async (v: {
    fullName: string;
    birthDate: string;
    idDocumentType: Candidate["idDocumentType"];
    idDocumentNumber: string;
    guardianName: string;
    guardianPhone: string;
    previousSchoolName?: string;
    desiredClassLevelName: string;
    entranceExamSessionId?: string;
    documents?: ApplicationDocuments;
  }) => {
    const [year, levels] = await Promise.all([academicService.activeYear(), academicService.classLevels()]);
    if (!year) throw new Error("Não há ano lectivo activo.");
    const n = levelNumber(v.desiredClassLevelName);
    const level = levels.find((l) => l.level_number === n) ?? levels.find((l) => l.name === v.desiredClassLevelName);
    if (!level) throw new Error(`A classe "${v.desiredClassLevelName}" não existe nesta escola.`);
    const { data } = await api.post<ApiApplication>("/s/admission-applications", {
      academic_year_id: year.id,
      desired_class_level_id: level.id,
      requires_entrance_exam: Boolean(v.entranceExamSessionId),
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

    if (v.entranceExamSessionId) {
      savePendingSession(data.id, v.entranceExamSessionId);
    }

    if (v.documents) {
      saveApplicationDocs(data.id, v.documents, {
        docNumber: v.idDocumentNumber,
        candidateId: data.candidate?.id,
      });

      // Upload dos documentos para o armazenamento seguro da API / Escola
      const payload: {
        photo?: { file_name: string; mime_type: "image/jpeg" | "image/png" | "application/pdf"; content_base64: string };
        id_document?: { file_name: string; mime_type: "image/jpeg" | "image/png" | "application/pdf"; content_base64: string };
        school_certificate?: { file_name: string; mime_type: "image/jpeg" | "image/png" | "application/pdf"; content_base64: string };
      } = {};

      if (v.documents.passportPhotoUrl) {
        payload.photo = {
          file_name: v.documents.passportPhotoName || "foto-tipo-passe.jpg",
          mime_type: "image/jpeg",
          content_base64: v.documents.passportPhotoUrl,
        };
      }

      if (v.documents.idDocumentCopyUrl) {
        const isPdf = v.documents.idDocumentCopyName?.toLowerCase().endsWith(".pdf") || v.documents.idDocumentCopyUrl.startsWith("data:application/pdf");
        payload.id_document = {
          file_name: v.documents.idDocumentCopyName || (isPdf ? "copia-bi.pdf" : "copia-bi.jpg"),
          mime_type: isPdf ? "application/pdf" : "image/jpeg",
          content_base64: v.documents.idDocumentCopyUrl,
        };
      }

      const certUrl = v.documents.schoolCertificateUrl || v.documents.previousSchoolCertificateUrl;
      if (certUrl) {
        const isPdf = v.documents.schoolCertificateName?.toLowerCase().endsWith(".pdf") || certUrl.startsWith("data:application/pdf");
        payload.school_certificate = {
          file_name: v.documents.schoolCertificateName || (isPdf ? "certificado.pdf" : "certificado.jpg"),
          mime_type: isPdf ? "application/pdf" : "image/jpeg",
          content_base64: certUrl,
        };
      }

      if (Object.keys(payload).length > 0) {
        try {
          await api.post(`/s/admission-applications/${data.id}/documents`, payload);
        } catch (uploadErr: unknown) {
          const apiError = (uploadErr as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response?.data?.error;
          if (apiError?.code === "QUOTA_EXCEEDED") {
            throw new Error(apiError?.message || "O limite de armazenamento de ficheiros do plano da sua escola foi atingido. O upload de novos documentos foi bloqueado.");
          }
          throw uploadErr;
        }
      }
    }

    return data;
  },

  attachDocuments: async (
    id: string,
    payload: {
      photo?: { file_name: string; mime_type: "image/jpeg" | "image/png" | "application/pdf"; content_base64: string };
      id_document?: { file_name: string; mime_type: "image/jpeg" | "image/png" | "application/pdf"; content_base64: string };
      school_certificate?: { file_name: string; mime_type: "image/jpeg" | "image/png" | "application/pdf"; content_base64: string };
    }
  ) => {
    try {
      const res = await api.post(`/s/admission-applications/${id}/documents`, payload);
      return res.data;
    } catch (uploadErr: unknown) {
      const apiError = (uploadErr as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response?.data?.error;
      if (apiError?.code === "QUOTA_EXCEEDED") {
        throw new Error(apiError?.message || "O limite de armazenamento de ficheiros do plano da sua escola foi atingido. O upload foi bloqueado.");
      }
      throw uploadErr;
    }
  },

  validateDocuments: async (id: string) => {
    await api.post(`/s/admission-applications/${id}/validate-documents`, {});
    const pendingSessionId = getPendingSession(id);
    if (pendingSessionId) {
      try {
        await api.post(`/s/admission-applications/${id}/exam-registration`, { session_id: pendingSessionId });
      } catch (err) {
        console.warn("Aviso ao inscrever candidato na sessão de prova:", err);
      }
    }
  },
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
