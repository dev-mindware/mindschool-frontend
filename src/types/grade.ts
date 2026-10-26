export type AssessmentTerm = "TRIMESTER_1" | "TRIMESTER_2" | "TRIMESTER_3";

export type AssessmentType = "CONTINUOUS_MAC" | "TEACHER_TEST_NPP" | "TRIMESTER_EXAM_NPT";

export type TransitionStatus =
  | "APPROVED"
  | "APPROVED_WITH_CONDITIONS"
  | "RECOVERY_EXAM"
  | "FAILED"
  | "PENDING";

export interface StudentGradeEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  continuousAssessment?: number; // MAC (0-20)
  teacherTest?: number; // NPP (0-20)
  systematicAverage?: number; // MAS = (MAC + NPP) / 2
  termExam?: number; // NPT (0-20)
  termAverage?: number; // MT = (2 * MAS + NPT) / 3
  finalAverage?: number; // MF (anual)
  notes?: string;
  /** Estado de cada nota (por omissao `avaliado`): ausente, dispensado ou nao_avaliado nao tem valor. */
  statuses?: Partial<Record<"continuousAssessment" | "teacherTest" | "termExam", "avaliado" | "ausente" | "dispensado" | "nao_avaliado">>;
}

export interface ClassSubjectGradeSheet {
  id: string;
  schoolId: string;
  sectionId: string;
  sectionName: string;
  classLevel: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  term: AssessmentTerm;
  academicYear: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  entries: StudentGradeEntry[];
  updatedAt: string;
}

export interface SubjectTermScores {
  mac?: number;
  npp?: number;
  mas?: number;
  npt?: number;
  mt?: number;
}

export interface ConsolidatedStudentRow {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  subjects: Record<string, SubjectTermScores>; // subjectId -> scores
  termAverageTotal: number;
  finalScoreTotal?: number;
  failedSubjectsCount: number;
  transitionStatus: TransitionStatus;
  exceptionApplied?: string;
}

export interface ConsolidatedPauta {
  id: string;
  schoolId: string;
  sectionId: string;
  sectionName: string;
  classLevel: string;
  shift: string;
  term: AssessmentTerm;
  academicYear: string;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
  students: ConsolidatedStudentRow[];
  missingGradesCount: number;
  averageClassScore: number;
  approvalRate: number; // percentage
  subjects?: Array<{ id: string; name: string; code?: string; sectionSubjectId: string }>;
}

export interface PautaAuditEntry {
  id: string;
  pautaId: string;
  sectionId: string;
  sectionName: string;
  term: AssessmentTerm;
  action: "CLOSED" | "REOPENED" | "GRADE_MODIFIED";
  reason: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface ReportCardSubjectRow {
  subjectId: string;
  subjectName: string;
  teacherName?: string;
  mt1?: number;
  mt2?: number;
  mt3?: number;
  finalScore: number;
  qualitativeEvaluation: string;
  status: "APROVADO" | "RECURSO" | "REPROVADO";
}

export interface StudentReportCard {
  studentId: string;
  studentName: string;
  studentNumber: string;
  sectionId: string;
  sectionName: string;
  classLevel: string;
  cycle: string;
  shift: string;
  academicYear: string;
  guardianName: string;
  subjects: ReportCardSubjectRow[];
  globalFinalScore: number;
  globalQualitative: string;
  finalDecision: string;
  absencesCount: number;
  pedagogicDirectorName: string;
  directorGeneralName: string;
  issuedAt: string;
}
