import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SchoolInstitutionalProfile,
  AcademicCalendarConfig,
  EvaluationPolicyConfig,
} from "@/types";

interface SchoolSettingsState {
  profile: SchoolInstitutionalProfile;
  calendar: AcademicCalendarConfig;
  evaluationPolicy: EvaluationPolicyConfig;

  // Actions
  updateProfile: (data: Partial<SchoolInstitutionalProfile>) => void;
  updateCalendar: (data: Partial<AcademicCalendarConfig>) => void;
  updateEvaluationPolicy: (data: Partial<EvaluationPolicyConfig>) => void;
  closeTrimester: (trimesterId: string) => void;
}

const DEFAULT_PROFILE: SchoolInstitutionalProfile = {
  id: "school-inst-1",
  schoolName: "Colégio Privado MindSchool",
  subTitle: "Ensino Primário, I e II Ciclos do Ensino Secundário Geral e Técnico",
  medRegistrationCode: "MED-AO-LUA-2018-0492",
  decreeNumber: "Decreto Executivo n.º 148/18",
  gazetteDate: "12 de Outubro de 2018",
  gazetteSeries: "I Série, n.º 142",
  taxNumber: "5417082910",
  province: "Luanda",
  municipality: "Talatona",
  communeOrDistrict: "Benfica",
  fullAddress: "Rua Direita do Patriota, Bairro Benfica, Luanda - Angola",
  phone: "+244 923 000 000",
  email: "direccao@mindschool.ao",
  website: "https://mindschool.ao",
  directorGeneralName: "Dr. Alberto Manuel Domingos",
  pedagogicDirectorName: "Profª. Maria Teresa Diogo da Silva",
  administrativeDirectorName: "Eng. Pedro Sebastião Kiala",
  schoolMotto: "Educação de Rigor, Inovação e Excelência",
};

const DEFAULT_CALENDAR: AcademicCalendarConfig = {
  academicYear: "2025/2026",
  yearStartDate: "2025-09-01",
  yearEndDate: "2026-07-31",
  trimesters: [
    {
      id: "trim-1",
      name: "1º Trimestre",
      startDate: "2025-09-01",
      endDate: "2025-12-19",
      classesStartDate: "2025-09-08",
      classesEndDate: "2025-12-05",
      examStartDate: "2025-12-08",
      examEndDate: "2025-12-15",
      pautaClosingDeadline: "2025-12-18",
      isCurrent: false,
      isClosed: true,
    },
    {
      id: "trim-2",
      name: "2º Trimestre",
      startDate: "2026-01-05",
      endDate: "2026-04-10",
      classesStartDate: "2026-01-06",
      classesEndDate: "2026-03-27",
      examStartDate: "2026-03-30",
      examEndDate: "2026-04-06",
      pautaClosingDeadline: "2026-04-09",
      isCurrent: true,
      isClosed: false,
    },
    {
      id: "trim-3",
      name: "3º Trimestre",
      startDate: "2026-04-20",
      endDate: "2026-07-24",
      classesStartDate: "2026-04-21",
      classesEndDate: "2026-06-26",
      examStartDate: "2026-06-29",
      examEndDate: "2026-07-10",
      pautaClosingDeadline: "2026-07-20",
      isCurrent: false,
      isClosed: false,
    },
  ],
  generalExamsPeriod: {
    startDate: "2026-07-01",
    endDate: "2026-07-10",
  },
  appealExamsPeriod: {
    startDate: "2026-07-15",
    endDate: "2026-07-22",
  },
  holidays: [
    { date: "2025-11-11", name: "Dia da Independência Nacional", type: "NATIONAL" },
    { date: "2025-12-25", name: "Dia de Natal e Família", type: "NATIONAL" },
    { date: "2026-01-01", name: "Dia de Ano Novo", type: "NATIONAL" },
    { date: "2026-02-04", name: "Início da Luta Armada", type: "NATIONAL" },
    { date: "2026-03-08", name: "Dia Internacional da Mulher", type: "NATIONAL" },
    { date: "2026-04-04", name: "Dia da Paz e Reconciliação Nacional", type: "NATIONAL" },
    { date: "2026-05-01", name: "Dia Mundial do Trabalhador", type: "NATIONAL" },
  ],
};

const DEFAULT_EVALUATION_POLICY: EvaluationPolicyConfig = {
  minimumPassingGrade: 10.0,
  honorRollThreshold: 16.0,
  maximumFailingSubjectsForAppeal: 2,
  unjustifiedAbsenceLimitPercent: 15,
  enableContinuousAssessmentWeight: true,
};

export const useSchoolSettingsStore = create<SchoolSettingsState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      calendar: DEFAULT_CALENDAR,
      evaluationPolicy: DEFAULT_EVALUATION_POLICY,

      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),

      updateCalendar: (data) =>
        set((state) => ({
          calendar: { ...state.calendar, ...data },
        })),

      updateEvaluationPolicy: (data) =>
        set((state) => ({
          evaluationPolicy: { ...state.evaluationPolicy, ...data },
        })),

      closeTrimester: (trimesterId) =>
        set((state) => ({
          calendar: {
            ...state.calendar,
            trimesters: state.calendar.trimesters.map((t) =>
              t.id === trimesterId ? { ...t, isClosed: true, isCurrent: false } : t
            ),
          },
        })),
    }),
    {
      name: "mindschool-institutional-settings-storage",
    }
  )
);
