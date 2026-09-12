export type MedSnapshotCut = 'ENROLLMENT_START' | 'TERM_1_CLOSE' | 'TERM_2_CLOSE' | 'FINAL_YEAR';

export type ReportSubmissionStatus = 'DRAFT' | 'OFFICIALLY_SUBMITTED';

export interface GenderStats {
  male: number;
  female: number;
  total: number;
}

export interface MedGradeDistribution {
  veryGood: GenderStats; // 17-20 valores (Muito Bom)
  good: GenderStats; // 14-16 valores (Bom)
  sufficient: GenderStats; // 10-13 valores (Suficiente)
  mediocre: GenderStats; // 7-9 valores (Medíocre)
  poor: GenderStats; // 0-6 valores (Mau)
}

export interface ClassStatisticalRow {
  id: string;
  classLevel: string; // Ex: "7ª Classe", "8ª Classe", "10ª Classe"
  sectionName: string; // Ex: "Turma A"
  shift: 'MANHÃ' | 'TARDE';
  cycle: 'PRIMARIO' | 'I_CICLO' | 'II_CICLO';
  enrolledStudents: GenderStats;
  evaluatedStudents: GenderStats;
  passedStudents: GenderStats;
  failedStudents: GenderStats;
  dropoutStudents: GenderStats;
  gradeDistribution: MedGradeDistribution;
  passRatePercentage: number;
}

export interface MedStatisticalReport {
  id: string;
  reportCode: string; // Ex: "MED-MAP-2026/01"
  schoolId: string;
  schoolName: string;
  provincialDirectorate: string; // Ex: "Direcção Provincial da Educação de Luanda"
  municipalDirectorate: string; // Ex: "Repartição Municipal de Educação de Belas"
  academicYear: string;
  snapshotCut: MedSnapshotCut;
  generatedAt: string;
  generatedBy: string;
  status: ReportSubmissionStatus;
  submissionDate?: string;
  submissionProtocolNumber?: string;
  totalStudents: GenderStats;
  totalPassed: GenderStats;
  totalFailed: GenderStats;
  overallPassRate: number;
  rows: ClassStatisticalRow[];
}

export interface MedMetrics {
  totalSnapshots: number;
  officialSubmissionsCount: number;
  femaleStudentRatioPercentage: number;
  overallSuccessRatePercentage: number;
  lastSnapshotDate: string;
}
