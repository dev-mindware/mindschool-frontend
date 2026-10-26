/**
 * Official Ministry of Education (MED) institutional profile
 */
export interface SchoolInstitutionalProfile {
  id: string;
  schoolName: string;
  subTitle?: string;
  medRegistrationCode: string; // Código oficial do Ministério da Educação
  decreeNumber: string; // Decreto Executivo de Criação (ex: "Decreto Executivo n.º 142/18")
  gazetteDate: string; // Data de publicação no Diário da República
  gazetteSeries: string; // Série do Diário da República (ex: "I Série, n.º 84")
  taxNumber: string; // NIF institucional
  province: string;
  municipality: string;
  communeOrDistrict: string;
  fullAddress: string;
  phone: string;
  email: string;
  website?: string;
  directorGeneralName: string;
  pedagogicDirectorName: string;
  administrativeDirectorName?: string;
  schoolMotto?: string;
  sealImageUrl?: string;
}

/**
 * Trimester period details in the academic calendar
 */
export interface TrimesterCalendarPeriod {
  id: string;
  name: string; // "1º Trimestre", "2º Trimestre", "3º Trimestre"
  startDate: string;
  endDate: string;
  classesStartDate: string;
  classesEndDate: string;
  examStartDate: string;
  examEndDate: string;
  pautaClosingDeadline: string;
  isCurrent: boolean;
  isClosed: boolean;
}

/**
 * Full academic calendar configuration
 */
export interface AcademicCalendarConfig {
  academicYear: string; // "2025/2026"
  yearStartDate: string;
  yearEndDate: string;
  trimesters: TrimesterCalendarPeriod[];
  generalExamsPeriod: {
    startDate: string;
    endDate: string;
  };
  appealExamsPeriod: {
    startDate: string;
    endDate: string;
  };
  holidays: Array<{
    date: string;
    name: string;
    type: "NATIONAL" | "SCHOOL_BREAK";
  }>;
}

/**
 * Evaluation policy thresholds under Decreto Executivo n.º 424/25
 */
export interface EvaluationPolicyConfig {
  minimumPassingGrade: number; // 10.0
  honorRollThreshold: number; // 16.0
  maximumFailingSubjectsForAppeal: number; // 2 ou 3 disciplinas conforme o ciclo
  unjustifiedAbsenceLimitPercent: number; // 15%
  enableContinuousAssessmentWeight: boolean; // MAC + CPP + NPT
}
