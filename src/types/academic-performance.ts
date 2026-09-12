import { AcademicCycle } from "./dashboard";

/**
 * Performance metrics for an individual class (Turma)
 */
export interface ClassPerformanceSummary {
  id: string;
  className: string;
  cycle: AcademicCycle;
  cycleLabel: string;
  academicYear: string;
  totalStudents: number;
  averageGrade: number; // 0 to 20
  approvedCount: number;
  appealCount: number; // Em recurso
  failedCount: number; // Retidos
  passRatePercent: number; // 0 to 100
  classDirectorName: string;
  roomName: string;
}

/**
 * Diagnostic metrics for subjects with high failure rate (Disciplinas Críticas)
 */
export interface CriticalSubjectDiagnostic {
  id: string;
  subjectName: string;
  cycle: AcademicCycle;
  cycleLabel: string;
  classesCount: number;
  totalEvaluatedStudents: number;
  failingStudentsCount: number; // Alunos com nota < 10
  failureRatePercent: number; // % de notas negativas
  averageGrade: number; // Média geral na disciplina
  assignedTeachersCount: number;
  urgencyLevel: "CRITICAL" | "HIGH" | "MODERATE";
  recommendedIntervention: string;
}

/**
 * Student in the Honor Roll (Quadro de Honra & Mérito - Média >= 16.0)
 */
export interface HonorRollStudent {
  id: string;
  studentName: string;
  studentNumber: string;
  className: string;
  cycle: AcademicCycle;
  cycleLabel: string;
  generalAverage: number; // >= 16.0
  bestSubject: {
    name: string;
    grade: number;
  };
  totalDistinctions: number;
  conduct: "EXCELENTE" | "MUITO_BOM";
  academicYear: string;
  trimester: "1_TRIMESTRE" | "2_TRIMESTRE" | "3_TRIMESTRE" | "ANNUAL";
  diplomaGeneratedAt?: string;
}

/**
 * Evolution across trimesters
 */
export interface TrimesterEvolutionPoint {
  trimester: string;
  averageGrade: number;
  passRatePercent: number;
  failingCount: number;
  honorRollCount: number;
}
