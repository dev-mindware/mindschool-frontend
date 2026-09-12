export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type AlertStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DROPPED_OUT';

export type ActionType = 'GUARDIAN_CONTACT' | 'PEDAGOGIC_MEETING' | 'RECOVERY_PLAN' | 'TUTORING_ASSIGNED' | 'SOCIAL_ASSISTANCE';

export interface DropoutRiskSignals {
  consecutiveAbsences: number;
  absencePercentage: number;
  gradeDropSubjects: string[];
  currentAverage: number;
  failingSubjectsCount: number;
  tuitionOverdueMonths: number;
}

export interface DropoutActionLog {
  id: string;
  actionType: ActionType;
  title: string;
  notes: string;
  recordedBy: string;
  recordedAt: string;
  nextFollowUpDate?: string;
}

export interface DropoutRiskAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  classId: string;
  className: string;
  cycle: 'PRIMARIO' | 'I_CICLO' | 'II_CICLO';
  guardianName: string;
  guardianPhone: string;
  riskLevel: RiskLevel;
  compositeRiskScore: number; // 0 to 100
  signals: DropoutRiskSignals;
  status: AlertStatus;
  openedAt: string;
  lastActionAt?: string;
  assignedToPedagogue?: string;
  actionsHistory: DropoutActionLog[];
}

export interface DropoutMetrics {
  totalMonitored: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  activeInterventionsCount: number;
  resolvedCasesCount: number;
  retentionRatePercentage: number;
}
