export type ActivityCategory =
  | "SPORTS"
  | "TECHNOLOGY_STEM"
  | "ARTS_CULTURE"
  | "ACADEMIC_CHESS"
  | "MUSIC"
  | "LANGUAGES";

export type ActivityEnrollmentStatus = "ACTIVE" | "WAITLIST" | "COMPLETED" | "CANCELLED";

export interface ExtracurricularActivity {
  id: string;
  code: string; // ex: "ACT-ROB-01"
  name: string; // ex: "Clube de Robótica & Programação STEAM"
  category: ActivityCategory;
  categoryLabel: string;
  description: string;
  instructorName: string;
  instructorPhone: string;
  scheduleDays: string; // ex: "Terças e Quintas-feiras"
  scheduleTime: string; // ex: "15:00 - 16:30"
  location: string; // ex: "Laboratório de Informática / Sala STEAM"
  targetGrades: string; // ex: "7ª à 12ª Classe"
  maxCapacity: number;
  enrolledCount: number;
  isActive: boolean;
  colorTheme?: string;
}

export interface ActivityEnrollment {
  id: string;
  activityId: string;
  activityName: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  classLevel: string;
  sectionName: string;
  guardianName: string;
  guardianPhone: string;
  enrolledAt: string;
  status: ActivityEnrollmentStatus;
  achievements?: string[]; // ex: ["1º Lugar Torneio Inter-Escolar", "Projecto Destaque"]
  notes?: string;
}

export interface ActivityAttendanceRecord {
  id: string;
  activityId: string;
  date: string; // YYYY-MM-DD
  sessionTopic: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  isPresent: boolean;
  recordedBy: string;
  notes?: string;
}
