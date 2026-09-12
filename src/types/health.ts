export type BloodType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"
  | "UNKNOWN";

export type HealthUrgencyLevel = "ROUTINE" | "MODERATE" | "URGENT" | "CRITICAL";

export type ClinicVisitStatus =
  | "UNDER_OBSERVATION"
  | "DISCHARGED_TO_CLASS"
  | "SENT_HOME"
  | "REFERRED_TO_HOSPITAL";

export type SpecialNeedType =
  | "AUTISM_SPECTRUM"
  | "ADHD"
  | "DYSLEXIA"
  | "HEARING_IMPAIRMENT"
  | "VISUAL_IMPAIRMENT"
  | "PHYSICAL_DISABILITY"
  | "GIFTED"
  | "LEARNING_DIFFICULTY"
  | "OTHER";

export interface StudentHealthProfile {
  studentId: string;
  studentNumber: string;
  studentName: string;
  classLevel: string;
  sectionName: string;
  bloodType: BloodType;
  allergies: string[]; // ex: ["Penicilina", "Amendoim", "Picadas de insectos"]
  chronicConditions: string[]; // ex: ["Asma Brônquica", "Diabetes Tipo 1", "Epilepsia"]
  regularMedications: string[]; // ex: ["Salbutamol inalatório em SOS", "Insulina"]
  physicalRestrictions: string[]; // ex: ["Isenção de corrida de resistência em Ed. Física"]
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  healthInsuranceProvider?: string;
  healthInsuranceNumber?: string;
  vaccinationUpToDate: boolean;
  confidentialNotes?: string;
  updatedAt: string;
}

export interface ClinicVisitRecord {
  id: string;
  visitNumber: string; // ex: "ENF-2026/0142"
  studentId: string;
  studentNumber: string;
  studentName: string;
  classLevel: string;
  sectionName: string;
  recordedAt: string; // ISO date-time
  recordedBy: string; // Nome do enfermeiro / profissional de saúde
  chiefComplaint: string; // Queixa principal (ex: "Cefaleia e náuseas intensas")
  symptoms: string[];
  urgencyLevel: HealthUrgencyLevel;
  vitalSigns?: {
    temperatureCelsius?: number; // ex: 38.5
    bloodPressure?: string; // ex: "110/70"
    heartRateBpm?: number; // ex: 82
  };
  actionsTaken: string; // Procedimentos realizados (ex: "Repouso de 30min, compressas frias, hidratação")
  administeredMedication?: string; // ex: "Paracetamol 500mg (com consentimento do encarregado)"
  status: ClinicVisitStatus;
  guardianNotified: boolean;
  guardianNotifiedAt?: string;
  guardianNotes?: string;
  dischargeTime?: string;
  dischargeNotes?: string;
}

export interface PsychologySessionNote {
  id: string;
  date: string;
  practitionerName: string; // Psicólogo(a) responsável
  sessionType: "INDIVIDUAL" | "FAMILY_GUARDIAN" | "TEACHER_CONFERENCE";
  topicsDiscussed: string;
  observations: string;
  recommendations: string;
  nextSessionDate?: string;
}

export interface PsychopedagogicalPlan {
  id: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  classLevel: string;
  sectionName: string;
  specialNeedType: SpecialNeedType;
  diagnosisSummary: string; // Diagnóstico / parecer pedagógico
  pedagogicalCoordinator: string;
  schoolPsychologist: string;
  startDate: string;
  reviewDate: string;
  isActive: boolean;
  curriculumAccommodations: string[]; // ex: ["Tempo adicional de 25% nas provas", "Instruções visuais passo a passo"]
  classroomAdjustments: string[]; // ex: ["Lugar na primeira fila próximo ao professor"]
  sessions: PsychologySessionNote[];
  createdAt: string;
  updatedAt: string;
}
