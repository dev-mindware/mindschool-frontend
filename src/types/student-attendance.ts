export type AttendanceStatus =
  | "PRESENT"             // Presente (P)
  | "ABSENT_UNJUSTIFIED"  // Falta Injustificada (FI)
  | "ABSENT_JUSTIFIED"    // Falta Justificada (FJ)
  | "LATE";               // Atraso (A)

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  studentAvatar?: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  slotNumber: number; // 1..6
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string; // Teacher or Secretary name
  recordedAt: string;
  justificationId?: string;
}

export type JustificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AbsenceJustification {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  startDate: string;
  endDate: string;
  reason: "MEDICAL" | "FAMILY_BEREAVEMENT" | "OFFICIAL_CONVOCATION" | "FORCE_MAJEURE" | "OTHER";
  reasonLabel: string;
  documentRef?: string;
  description: string;
  status: JustificationStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export type DisciplinarySeverity = "LOW" | "MEDIUM" | "HIGH";

export interface DisciplinaryOccurrence {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  severity: DisciplinarySeverity; // LOW (Advertência Verbal), MEDIUM (Repreensão / Chamada de Encarregado), HIGH (Suspensão / Conselho)
  category: "DISRUPTIVE_BEHAVIOR" | "INSUBORDINATION" | "VANDALISM" | "UNAUTHORIZED_LEAVE" | "UNIFORM_INFRACTION" | "FIGHT" | "ACADEMIC_DISHONESTY";
  title: string;
  description: string;
  reportedBy: string;
  actionTaken: string;
  parentNotified: boolean;
  status: "OPEN" | "IN_MEDIATION" | "RESOLVED";
  resolvedAt?: string;
}

export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  studentNumber: string;
  totalClasses: number;
  presentCount: number;
  unjustifiedCount: number;
  justifiedCount: number;
  lateCount: number;
  attendanceRate: number; // 0 to 100%
  unjustifiedAbsenceRate: number; // 0 to 100%
  medLimitRisk: "NORMAL" | "WARNING" | "AT_RISK" | "DISQUALIFIED"; // MED rule: >=25% unjustified absences = loss of frequency
}
