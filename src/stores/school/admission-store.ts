import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AdmissionApplication,
  Candidate,
  EntranceExam,
  CandidateExamSubmission,
  AdmissionStatus,
} from "@/types/admission";
import { useSchoolDataStore } from "./school-data-store";

const INITIAL_EXAMS: EntranceExam[] = [
  {
    id: "exam-7-mat-port",
    schoolId: "dev-school-1",
    title: "Exame de Acesso 7ª Classe - Português e Matemática",
    purpose: "prova_admissao",
    subjectName: "Língua Portuguesa & Matemática",
    classLevelId: "lvl-7",
    classLevelName: "7ª Classe",
    examDate: "2025-08-25T09:00:00Z",
    roomNumber: "Anfiteatro Central",
    maxCapacity: 60,
    enrolledCandidatesCount: 48,
    minPassingScore: 10,
    passingWeight: 100,
    status: "COMPLETED",
  },
  {
    id: "exam-10-cfb",
    schoolId: "dev-school-1",
    title: "Exame de Acesso 10ª Classe - Ciências Físicas e Biológicas",
    purpose: "prova_admissao",
    subjectName: "Ciências da Natureza & Matemática",
    classLevelId: "lvl-10-cfb",
    classLevelName: "10ª Classe - Ciências Físicas e Biológicas",
    examDate: "2025-08-26T09:00:00Z",
    roomNumber: "Laboratório de Ciências",
    maxCapacity: 45,
    enrolledCandidatesCount: 42,
    minPassingScore: 10,
    passingWeight: 100,
    status: "COMPLETED",
  },
  {
    id: "exam-10-info",
    schoolId: "dev-school-1",
    title: "Exame de Acesso 10ª Classe - Informática e Tecnologias",
    purpose: "prova_admissao",
    subjectName: "Matemática & Introdução à Lógica",
    classLevelId: "lvl-10-info",
    classLevelName: "10ª Classe - Técnico de Informática",
    examDate: "2025-08-27T14:00:00Z",
    roomNumber: "Sala Multimédia",
    maxCapacity: 35,
    enrolledCandidatesCount: 29,
    minPassingScore: 10,
    passingWeight: 100,
    status: "GRADING",
  },
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "cand-001",
    schoolId: "dev-school-1",
    fullName: "Kiara Luísa Gaspar",
    gender: "FEMALE",
    birthDate: "2013-05-14",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "008432190LA045",
    nationality: "Angolana",
    guardianName: "Gaspar António Gaspar",
    guardianPhone: "+244 923 112 334",
    guardianEmail: "gaspar.antonio@gmail.com",
    guardianRelationship: "FATHER",
    previousSchoolName: "Colégio Santa Ana - Luanda",
    createdAt: "2025-08-01T10:00:00Z",
  },
  {
    id: "cand-002",
    schoolId: "dev-school-1",
    fullName: "Mateus António Sebastião",
    gender: "MALE",
    birthDate: "2010-09-22",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "007321854LA032",
    nationality: "Angolana",
    guardianName: "Sebastião Manuel",
    guardianPhone: "+244 934 556 778",
    guardianEmail: "sebastiao.m@yahoo.com",
    guardianRelationship: "FATHER",
    previousSchoolName: "Complexo Escolar n.º 1024 - Viana",
    createdAt: "2025-08-03T11:20:00Z",
  },
  {
    id: "cand-003",
    schoolId: "dev-school-1",
    fullName: "Esperança Lukenia Panzo",
    gender: "FEMALE",
    birthDate: "2010-11-05",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "006541298LA091",
    nationality: "Angolana",
    guardianName: "Ana Lukenia Panzo",
    guardianPhone: "+244 912 889 001",
    guardianRelationship: "MOTHER",
    previousSchoolName: "Liceu Francês de Luanda",
    createdAt: "2025-08-04T09:15:00Z",
  },
  {
    id: "cand-004",
    schoolId: "dev-school-1",
    fullName: "Divaldo Francisco Gouveia",
    gender: "MALE",
    birthDate: "2013-02-18",
    idDocumentType: "BIRTH_CERTIFICATE",
    idDocumentNumber: "ASSENTO-4521/2013",
    nationality: "Angolana",
    guardianName: "Francisco Gouveia",
    guardianPhone: "+244 945 667 889",
    guardianRelationship: "FATHER",
    previousSchoolName: "Escola Primária do Rangel",
    createdAt: "2025-08-05T14:30:00Z",
  },
  {
    id: "cand-005",
    schoolId: "dev-school-1",
    fullName: "Neuza Maria da Silva",
    gender: "FEMALE",
    birthDate: "2010-07-12",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "009112453LA021",
    nationality: "Angolana",
    guardianName: "Maria da Silva",
    guardianPhone: "+244 928 334 112",
    guardianRelationship: "MOTHER",
    previousSchoolName: "Instituto Médio Politécnico",
    createdAt: "2025-08-06T16:00:00Z",
  },
  {
    id: "cand-006",
    schoolId: "dev-school-1",
    fullName: "Afonso Manuel Domingos",
    gender: "MALE",
    birthDate: "2013-08-30",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "005432987LA011",
    nationality: "Angolana",
    guardianName: "Manuel Domingos",
    guardianPhone: "+244 919 445 223",
    guardianRelationship: "FATHER",
    previousSchoolName: "Colégio Esperança",
    createdAt: "2025-08-07T08:45:00Z",
  },
  {
    id: "cand-007",
    schoolId: "dev-school-1",
    fullName: "Yolanda Cristina Bernardo",
    gender: "FEMALE",
    birthDate: "2019-10-10",
    idDocumentType: "BIRTH_CERTIFICATE",
    idDocumentNumber: "ASSENTO-9012/2019",
    nationality: "Angolana",
    guardianName: "Cristina Bernardo",
    guardianPhone: "+244 931 778 990",
    guardianRelationship: "MOTHER",
    previousSchoolName: "Creche Pequenos Génios",
    createdAt: "2025-08-08T10:10:00Z",
  },
];

const INITIAL_APPLICATIONS: AdmissionApplication[] = [
  {
    id: "app-001",
    schoolId: "dev-school-1",
    applicationNumber: "CAND-2025/2026-0001",
    candidateId: "cand-001",
    candidateName: "Kiara Luísa Gaspar",
    candidateGender: "FEMALE",
    candidateBirthDate: "2013-05-14",
    candidateDocumentNumber: "008432190LA045",
    guardianName: "Gaspar António Gaspar",
    guardianPhone: "+244 923 112 334",
    academicYearId: "ay-2025-2026",
    academicYear: "2025/2026",
    desiredClassLevelId: "lvl-7",
    desiredClassLevelName: "7ª Classe",
    desiredShift: "MORNING",
    requiresEntranceExam: true,
    entranceExamId: "exam-7-mat-port",
    entranceExamTitle: "Exame de Acesso 7ª Classe - Português e Matemática",
    examScore: 16.5,
    minPassingScore: 10,
    status: "APPROVED",
    decisionNotes: "Excelente desempenho na prova escrita. Vaga garantida na 7ª Classe A.",
    decidedBy: "Direção Pedagógica (Prof. António Silva)",
    decidedAt: "2025-08-28T10:00:00Z",
    submissionDate: "2025-08-01T10:00:00Z",
    documentsVerifiedAt: "2025-08-02T14:00:00Z",
  },
  {
    id: "app-002",
    schoolId: "dev-school-1",
    applicationNumber: "CAND-2025/2026-0002",
    candidateId: "cand-002",
    candidateName: "Mateus António Sebastião",
    candidateGender: "MALE",
    candidateBirthDate: "2010-09-22",
    candidateDocumentNumber: "007321854LA032",
    guardianName: "Sebastião Manuel",
    guardianPhone: "+244 934 556 778",
    academicYearId: "ay-2025-2026",
    academicYear: "2025/2026",
    desiredClassLevelId: "lvl-10-cfb",
    desiredClassLevelName: "10ª Classe - Ciências Físicas e Biológicas",
    desiredShift: "MORNING",
    requiresEntranceExam: true,
    entranceExamId: "exam-10-cfb",
    entranceExamTitle: "Exame de Acesso 10ª Classe - Ciências Físicas e Biológicas",
    examScore: 14.0,
    minPassingScore: 10,
    waitlistPosition: 1,
    status: "WAITLIST",
    decisionNotes: "Aprovado no exame com 14 valores, mas a turma matutina atingiu a lotação limite de 40 vagas. Colocado em 1º na lista de espera.",
    decidedBy: "Direção Pedagógica",
    decidedAt: "2025-08-28T11:00:00Z",
    submissionDate: "2025-08-03T11:20:00Z",
    documentsVerifiedAt: "2025-08-04T10:00:00Z",
  },
  {
    id: "app-003",
    schoolId: "dev-school-1",
    applicationNumber: "CAND-2025/2026-0003",
    candidateId: "cand-003",
    candidateName: "Esperança Lukenia Panzo",
    candidateGender: "FEMALE",
    candidateBirthDate: "2010-11-05",
    candidateDocumentNumber: "006541298LA091",
    guardianName: "Ana Lukenia Panzo",
    guardianPhone: "+244 912 889 001",
    academicYearId: "ay-2025-2026",
    academicYear: "2025/2026",
    desiredClassLevelId: "lvl-10-cfb",
    desiredClassLevelName: "10ª Classe - Ciências Físicas e Biológicas",
    desiredShift: "MORNING",
    requiresEntranceExam: true,
    entranceExamId: "exam-10-cfb",
    entranceExamTitle: "Exame de Acesso 10ª Classe - Ciências Físicas e Biológicas",
    examScore: 13.5,
    minPassingScore: 10,
    waitlistPosition: 2,
    status: "WAITLIST",
    decisionNotes: "Aprovada no exame. Colocada na lista de espera em 2º lugar após desempate de média.",
    decidedBy: "Direção Pedagógica",
    decidedAt: "2025-08-28T11:30:00Z",
    submissionDate: "2025-08-04T09:15:00Z",
    documentsVerifiedAt: "2025-08-05T09:00:00Z",
  },
  {
    id: "app-004",
    schoolId: "dev-school-1",
    applicationNumber: "CAND-2025/2026-0004",
    candidateId: "cand-004",
    candidateName: "Divaldo Francisco Gouveia",
    candidateGender: "MALE",
    candidateBirthDate: "2013-02-18",
    candidateDocumentNumber: "ASSENTO-4521/2013",
    guardianName: "Francisco Gouveia",
    guardianPhone: "+244 945 667 889",
    academicYearId: "ay-2025-2026",
    academicYear: "2025/2026",
    desiredClassLevelId: "lvl-7",
    desiredClassLevelName: "7ª Classe",
    desiredShift: "MORNING",
    requiresEntranceExam: true,
    entranceExamId: "exam-7-mat-port",
    entranceExamTitle: "Exame de Acesso 7ª Classe - Português e Matemática",
    minPassingScore: 10,
    status: "SUBMITTED",
    submissionDate: "2025-08-05T14:30:00Z",
  },
  {
    id: "app-005",
    schoolId: "dev-school-1",
    applicationNumber: "CAND-2025/2026-0005",
    candidateId: "cand-005",
    candidateName: "Neuza Maria da Silva",
    candidateGender: "FEMALE",
    candidateBirthDate: "2010-07-12",
    candidateDocumentNumber: "009112453LA021",
    guardianName: "Maria da Silva",
    guardianPhone: "+244 928 334 112",
    academicYearId: "ay-2025-2026",
    academicYear: "2025/2026",
    desiredClassLevelId: "lvl-10-info",
    desiredClassLevelName: "10ª Classe - Técnico de Informática",
    desiredShift: "AFTERNOON",
    requiresEntranceExam: true,
    entranceExamId: "exam-10-info",
    entranceExamTitle: "Exame de Acesso 10ª Classe - Informática e Tecnologias",
    examScore: 18.0,
    minPassingScore: 10,
    status: "APPROVED",
    decisionNotes: "Primeira classificada no exame de informática. Admissão imediata autorizada.",
    decidedBy: "Direção Pedagógica",
    decidedAt: "2025-08-29T15:00:00Z",
    submissionDate: "2025-08-06T16:00:00Z",
    documentsVerifiedAt: "2025-08-07T11:00:00Z",
  },
  {
    id: "app-006",
    schoolId: "dev-school-1",
    applicationNumber: "CAND-2025/2026-0006",
    candidateId: "cand-006",
    candidateName: "Afonso Manuel Domingos",
    candidateGender: "MALE",
    candidateBirthDate: "2013-08-30",
    candidateDocumentNumber: "005432987LA011",
    guardianName: "Manuel Domingos",
    guardianPhone: "+244 919 445 223",
    academicYearId: "ay-2025-2026",
    academicYear: "2025/2026",
    desiredClassLevelId: "lvl-7",
    desiredClassLevelName: "7ª Classe",
    desiredShift: "AFTERNOON",
    requiresEntranceExam: true,
    entranceExamId: "exam-7-mat-port",
    entranceExamTitle: "Exame de Acesso 7ª Classe - Português e Matemática",
    examScore: 7.5,
    minPassingScore: 10,
    status: "REJECTED",
    decisionNotes: "Pontuação na prova inferior ao limiar mínimo legal de aprovação (7.5 < 10 valores).",
    decidedBy: "Direção Pedagógica",
    decidedAt: "2025-08-28T14:00:00Z",
    submissionDate: "2025-08-07T08:45:00Z",
    documentsVerifiedAt: "2025-08-08T09:00:00Z",
  },
  {
    id: "app-007",
    schoolId: "dev-school-1",
    applicationNumber: "CAND-2025/2026-0007",
    candidateId: "cand-007",
    candidateName: "Yolanda Cristina Bernardo",
    candidateGender: "FEMALE",
    candidateBirthDate: "2019-10-10",
    candidateDocumentNumber: "ASSENTO-9012/2019",
    guardianName: "Cristina Bernardo",
    guardianPhone: "+244 931 778 990",
    academicYearId: "ay-2025-2026",
    academicYear: "2025/2026",
    desiredClassLevelId: "lvl-inic",
    desiredClassLevelName: "Iniciação (Educação Pré-Escolar)",
    desiredShift: "MORNING",
    requiresEntranceExam: false,
    minPassingScore: 10,
    status: "APPROVED",
    decisionNotes: "Classe de entrada isenta de prova de acesso segundo o regulamento interno. Documentação validada e vaga atribuída.",
    decidedBy: "Secretaria / Direção",
    decidedAt: "2025-08-29T10:00:00Z",
    submissionDate: "2025-08-08T10:10:00Z",
    documentsVerifiedAt: "2025-08-09T11:00:00Z",
  },
];

interface AdmissionState {
  applications: AdmissionApplication[];
  candidates: Candidate[];
  entranceExams: EntranceExam[];

  // Actions
  submitApplication: (
    candidateData: Omit<Candidate, "id" | "schoolId" | "createdAt" | "convertedStudentId">,
    applicationData: {
      desiredClassLevelId: string;
      desiredClassLevelName: string;
      desiredShift: "MORNING" | "AFTERNOON" | "EVENING";
      requiresEntranceExam: boolean;
      entranceExamId?: string;
      entranceExamTitle?: string;
    }
  ) => Promise<{ candidate: Candidate; application: AdmissionApplication }>;

  validateDocuments: (applicationId: string) => Promise<void>;

  gradeCandidateExam: (
    applicationId: string,
    score: number,
    feedback?: string
  ) => Promise<void>;

  decideApplication: (
    applicationId: string,
    decision: "APPROVED" | "WAITLIST" | "REJECTED",
    notes: string,
    decidedBy?: string
  ) => Promise<void>;

  promoteFromWaitlist: (applicationId: string) => Promise<void>;

  convertCandidateToEnrollment: (
    applicationId: string,
    sectionId: string,
    academicYear?: string
  ) => Promise<{ studentId: string; enrollmentId: string }>;

  resetToDefaultMockData: () => void;
}

export const useAdmissionStore = create<AdmissionState>()(
  persist(
    (set, get) => ({
      applications: INITIAL_APPLICATIONS,
      candidates: INITIAL_CANDIDATES,
      entranceExams: INITIAL_EXAMS,

      submitApplication: async (candidateData, applicationData) => {
        const candidateId = `cand-${Date.now()}`;
        const newCandidate: Candidate = {
          ...candidateData,
          id: candidateId,
          schoolId: "dev-school-1",
          createdAt: new Date().toISOString(),
        };

        const currentYear = "2025/2026";
        const applicationCount = get().applications.length + 1;
        const appNumberFormatted = String(applicationCount).padStart(4, "0");
        const applicationId = `app-${Date.now()}`;

        const newApplication: AdmissionApplication = {
          id: applicationId,
          schoolId: "dev-school-1",
          applicationNumber: `CAND-${currentYear}-${appNumberFormatted}`,
          candidateId: newCandidate.id,
          candidateName: newCandidate.fullName,
          candidateGender: newCandidate.gender,
          candidateBirthDate: newCandidate.birthDate,
          candidateDocumentNumber: newCandidate.idDocumentNumber,
          guardianName: newCandidate.guardianName,
          guardianPhone: newCandidate.guardianPhone,
          academicYearId: "ay-2025-2026",
          academicYear: currentYear,
          desiredClassLevelId: applicationData.desiredClassLevelId,
          desiredClassLevelName: applicationData.desiredClassLevelName,
          desiredShift: applicationData.desiredShift,
          requiresEntranceExam: applicationData.requiresEntranceExam,
          entranceExamId: applicationData.entranceExamId,
          entranceExamTitle: applicationData.entranceExamTitle,
          minPassingScore: 10,
          status: "SUBMITTED",
          submissionDate: new Date().toISOString(),
        };

        set((state) => ({
          candidates: [newCandidate, ...state.candidates],
          applications: [newApplication, ...state.applications],
        }));

        return { candidate: newCandidate, application: newApplication };
      },

      validateDocuments: async (applicationId) => {
        const now = new Date().toISOString();
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: app.requiresEntranceExam ? "UNDER_REVIEW" : "DOCS_VALIDATED",
                  documentsVerifiedAt: now,
                }
              : app
          ),
        }));
      },

      gradeCandidateExam: async (applicationId, score, feedback) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  examScore: score,
                  decisionNotes: feedback
                    ? `${app.decisionNotes ? app.decisionNotes + " | " : ""}Nota da Prova: ${score} val. (${feedback})`
                    : app.decisionNotes,
                  status: score >= app.minPassingScore ? "APPROVED" : "REJECTED",
                }
              : app
          ),
        }));
      },

      decideApplication: async (applicationId, decision, notes, decidedBy = "Direção Pedagógica") => {
        const now = new Date().toISOString();
        set((state) => {
          let waitlistCount = state.applications.filter(
            (a) => a.status === "WAITLIST"
          ).length;

          return {
            applications: state.applications.map((app) => {
              if (app.id !== applicationId) return app;

              let waitlistPos = app.waitlistPosition;
              if (decision === "WAITLIST" && !waitlistPos) {
                waitlistPos = waitlistCount + 1;
              } else if (decision !== "WAITLIST") {
                waitlistPos = undefined;
              }

              return {
                ...app,
                status: decision as AdmissionStatus,
                decisionNotes: notes,
                decidedBy,
                decidedAt: now,
                waitlistPosition: waitlistPos,
              };
            }),
          };
        });
      },

      promoteFromWaitlist: async (applicationId) => {
        const now = new Date().toISOString();
        set((state) => ({
          applications: state.applications.map((app) => {
            if (app.id === applicationId) {
              return {
                ...app,
                status: "APPROVED",
                waitlistPosition: undefined,
                decisionNotes: `${app.decisionNotes ? app.decisionNotes + " | " : ""}Promovido da lista de espera após abertura de vaga em ${new Date().toLocaleDateString("pt-AO")}.`,
                decidedAt: now,
              };
            }
            return app;
          }),
        }));
      },

      convertCandidateToEnrollment: async (applicationId, sectionId, academicYear = "2025/2026") => {
        const app = get().applications.find((a) => a.id === applicationId);
        if (!app) throw new Error("Candidatura não encontrada");

        const candidate = get().candidates.find((c) => c.id === app.candidateId);
        if (!candidate) throw new Error("Dados do candidato não encontrados");

        const schoolStore = useSchoolDataStore.getState();
        const targetSection = schoolStore.sections.find((s) => s.id === sectionId);
        if (!targetSection) throw new Error("Turma de destino não encontrada");

        // 1. Create or ensure Student
        const newStudent = schoolStore.addStudent({
          schoolId: "dev-school-1",
          studentNumber: `MS-2026-${String(schoolStore.students.length + 1).padStart(4, "0")}`,
          fullName: candidate.fullName,
          gender: candidate.gender,
          birthDate: candidate.birthDate,
          idDocumentType: candidate.idDocumentType,
          idDocumentNumber: candidate.idDocumentNumber,
          nationality: candidate.nationality,
          address: "Endereço cadastrado na candidatura",
          city: "Luanda",
          province: "Luanda",
          status: "ENROLLED",
          guardianId: "guard-temp",
          guardianName: candidate.guardianName,
          guardianPhone: candidate.guardianPhone,
          guardianRelationship: candidate.guardianRelationship,
          currentSectionId: targetSection.id,
          currentSectionName: targetSection.name,
          currentClassLevel: targetSection.classLevel,
          academicYear,
        });

        // 2. Create Guardian if not already registered
        const existingGuardian = schoolStore.guardians.find(
          (g) =>
            g.fullName.toLowerCase() === candidate.guardianName.toLowerCase() ||
            g.phonePrimary === candidate.guardianPhone
        );

        if (!existingGuardian) {
          schoolStore.addGuardian({
            schoolId: "dev-school-1",
            fullName: candidate.guardianName,
            phonePrimary: candidate.guardianPhone,
            email: candidate.guardianEmail,
            preferredContactChannel: "WHATSAPP",
            wards: [
              {
                studentId: newStudent.id,
                studentName: newStudent.fullName,
                relationship: candidate.guardianRelationship,
                isPrimaryContact: true,
              },
            ],
          });
        }

        // 3. Create Enrollment (UC-01)
        const newEnrollment = schoolStore.enrollStudent({
          studentId: newStudent.id,
          sectionId: targetSection.id,
          classLevelId: targetSection.classLevel,
          academicYear,
          tuitionPlanId: "plan-regular",
          notes: `Matrícula efectivada a partir da candidatura ${app.applicationNumber}. Prova de Acesso: ${
            app.examScore !== undefined ? app.examScore + " val." : "Isento"
          }.`,
        });

        // 4. Mark candidate as converted and application as ENROLLED
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === candidate.id ? { ...c, convertedStudentId: newStudent.id } : c
          ),
          applications: state.applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  status: "ENROLLED",
                  decisionNotes: `${a.decisionNotes ? a.decisionNotes + " | " : ""}Matrícula confirmada no Processo N.º ${newStudent.studentNumber} (Turma ${targetSection.name}).`,
                }
              : a
          ),
        }));

        return { studentId: newStudent.id, enrollmentId: newEnrollment.id };
      },

      resetToDefaultMockData: () => {
        set({
          applications: INITIAL_APPLICATIONS,
          candidates: INITIAL_CANDIDATES,
          entranceExams: INITIAL_EXAMS,
        });
      },
    }),
    {
      name: "mindschool-admission-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
