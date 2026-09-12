import { Shift } from "./academic";

export type DayOfWeek = 1 | 2 | 3 | 4 | 5; // 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
};

export const DAY_OF_WEEK_SHORT: Record<DayOfWeek, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
};

/**
 * Definition of daily time slots in the school schedule
 */
export interface TimeSlotDefinition {
  id: string;
  slotNumber: number; // 1 to 6
  shift: Shift; // MORNING, AFTERNOON, EVENING
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "08:15"
  label: string;     // e.g. "1º Tempo (07:30 - 08:15)"
  isBreak?: boolean;
}

/**
 * An individual lesson slot scheduled in the timetable
 */
export interface ClassScheduleEntry {
  id: string;
  classId: string;
  className: string;
  dayOfWeek: DayOfWeek;
  slotNumber: number;
  subjectId: string;
  subjectName: string;
  subjectColor?: string; // Hex or CSS class for visual differentiation
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  shift: Shift;
  academicYear: string;
}

/**
 * Conflict detection result
 */
export interface ScheduleConflictWarning {
  hasConflict: boolean;
  type?: "TEACHER_OVERLAP" | "ROOM_OVERLAP";
  conflictingEntry?: ClassScheduleEntry;
  message?: string;
}

/**
 * Teacher weekly teaching load
 */
export interface TeacherWeeklyLoad {
  teacherId: string;
  teacherName: string;
  totalSlots: number;
  classesAssigned: string[];
  daysActive: DayOfWeek[];
}
