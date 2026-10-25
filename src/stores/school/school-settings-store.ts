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

/** Sem dados de demonstração: o perfil e o ano letivo vêm da escola ativa (ver `useSchoolProfile`); enquanto não chegam ficam vazios. */
const DEFAULT_PROFILE: SchoolInstitutionalProfile = {
  id: "",
  schoolName: "",
  medRegistrationCode: "",
  decreeNumber: "",
  gazetteDate: "",
  gazetteSeries: "",
  taxNumber: "",
  province: "",
  municipality: "",
  communeOrDistrict: "",
  fullAddress: "",
  phone: "",
  email: "",
  directorGeneralName: "",
  pedagogicDirectorName: "",
};

const DEFAULT_CALENDAR: AcademicCalendarConfig = {
  academicYear: "",
  yearStartDate: "",
  yearEndDate: "",
  trimesters: [],
  generalExamsPeriod: { startDate: "", endDate: "" },
  appealExamsPeriod: { startDate: "", endDate: "" },
  holidays: [],
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
      // perfil e calendário vêm da API da escola ativa: não se guardam no browser (evita mostrar dados de outra escola)
      version: 2,
      partialize: (state) => ({ evaluationPolicy: state.evaluationPolicy }),
    }
  )
);
