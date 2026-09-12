export type Shift = "MORNING" | "AFTERNOON" | "EVENING";

export type EducationCycle =
  | "PRIMARY"
  | "LOWER_SECONDARY"
  | "UPPER_SECONDARY";

export interface AcademicSection {
  id: string;
  schoolId: string;
  name: string; // ex: "10ª A", "7ª B", "11ª Informática"
  classLevel: string; // ex: "7ª Classe", "10ª Classe"
  cycle: EducationCycle;
  shift: Shift;
  roomNumber: string;
  capacity: number;
  currentEnrollmentCount: number;
  academicYear: string;
  mainTeacherId?: string;
  mainTeacherName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string; // ex: "Língua Portuguesa", "Matemática", "Física"
  code: string; // ex: "LP", "MAT", "FIS"
  cycle: EducationCycle;
  weeklyHours: number;
  isActive: boolean;
  isCore?: boolean; // Disciplina Nuclear / Chave
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAssignment {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  teacherPhone?: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  weeklyHours: number;
  academicYear: string;
  createdAt: string;
}
