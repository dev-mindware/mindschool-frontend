import { create } from "zustand";
import {
  ClassPerformanceSummary,
  CriticalSubjectDiagnostic,
  HonorRollStudent,
  TrimesterEvolutionPoint,
  AcademicCycle,
} from "@/types";

interface AcademicPerformanceState {
  classes: ClassPerformanceSummary[];
  criticalSubjects: CriticalSubjectDiagnostic[];
  honorRoll: HonorRollStudent[];
  evolution: TrimesterEvolutionPoint[];
  selectedCycle: "ALL" | AcademicCycle;
  selectedTrimester: "1_TRIMESTRE" | "2_TRIMESTRE" | "3_TRIMESTRE" | "ANNUAL";
  searchQuery: string;
  selectedStudentForDiploma: HonorRollStudent | null;

  // Actions
  setSelectedCycle: (cycle: "ALL" | AcademicCycle) => void;
  setSelectedTrimester: (trimester: "1_TRIMESTRE" | "2_TRIMESTRE" | "3_TRIMESTRE" | "ANNUAL") => void;
  setSearchQuery: (query: string) => void;
  openDiplomaModal: (student: HonorRollStudent) => void;
  closeDiplomaModal: () => void;
}

const MOCK_CLASSES: ClassPerformanceSummary[] = [
  {
    id: "cls-1",
    className: "10ª Classe - Turma A",
    cycle: "CYCLE_2",
    cycleLabel: "II Ciclo / Médio",
    academicYear: "2025/2026",
    totalStudents: 38,
    averageGrade: 15.6,
    approvedCount: 34,
    appealCount: 3,
    failedCount: 1,
    passRatePercent: 89.5,
    classDirectorName: "Prof. Alberto Manuel",
    roomName: "Sala 21 - Bloco A",
  },
  {
    id: "cls-2",
    className: "9ª Classe - Turma A",
    cycle: "CYCLE_1",
    cycleLabel: "I Ciclo Secundário",
    academicYear: "2025/2026",
    totalStudents: 42,
    averageGrade: 14.2,
    approvedCount: 36,
    appealCount: 4,
    failedCount: 2,
    passRatePercent: 85.7,
    classDirectorName: "Profª. Teresa Silva",
    roomName: "Sala 14 - Bloco B",
  },
  {
    id: "cls-3",
    className: "8ª Classe - Turma B",
    cycle: "CYCLE_1",
    cycleLabel: "I Ciclo Secundário",
    academicYear: "2025/2026",
    totalStudents: 40,
    averageGrade: 12.4,
    approvedCount: 30,
    appealCount: 6,
    failedCount: 4,
    passRatePercent: 75.0,
    classDirectorName: "Prof. Pedro Kiala",
    roomName: "Sala 12 - Bloco B",
  },
  {
    id: "cls-4",
    className: "6ª Classe - Turma A",
    cycle: "PRIMARY",
    cycleLabel: "Ensino Primário",
    academicYear: "2025/2026",
    totalStudents: 35,
    averageGrade: 15.1,
    approvedCount: 32,
    appealCount: 2,
    failedCount: 1,
    passRatePercent: 91.4,
    classDirectorName: "Profª. Catarina Diogo",
    roomName: "Sala 06 - Bloco Primário",
  },
  {
    id: "cls-5",
    className: "11ª Classe - Ciências Físicas",
    cycle: "CYCLE_2",
    cycleLabel: "II Ciclo / Médio",
    academicYear: "2025/2026",
    totalStudents: 32,
    averageGrade: 13.5,
    approvedCount: 26,
    appealCount: 4,
    failedCount: 2,
    passRatePercent: 81.2,
    classDirectorName: "Prof. João Afonso",
    roomName: "Laboratório de Ciências",
  },
  {
    id: "cls-6",
    className: "7ª Classe - Turma C",
    cycle: "CYCLE_1",
    cycleLabel: "I Ciclo Secundário",
    academicYear: "2025/2026",
    totalStudents: 41,
    averageGrade: 11.8,
    approvedCount: 28,
    appealCount: 8,
    failedCount: 5,
    passRatePercent: 68.3,
    classDirectorName: "Prof. Mateus Luvualo",
    roomName: "Sala 10 - Bloco B",
  },
];

const MOCK_CRITICAL_SUBJECTS: CriticalSubjectDiagnostic[] = [
  {
    id: "cs-1",
    subjectName: "Matemática",
    cycle: "CYCLE_1",
    cycleLabel: "I Ciclo Secundário",
    classesCount: 8,
    totalEvaluatedStudents: 320,
    failingStudentsCount: 78,
    failureRatePercent: 24.4,
    averageGrade: 11.2,
    assignedTeachersCount: 4,
    urgencyLevel: "CRITICAL",
    recommendedIntervention:
      "Aulas de apoio pedagógico aos sábados e monitoria entre pares.",
  },
  {
    id: "cs-2",
    subjectName: "Física",
    cycle: "CYCLE_2",
    cycleLabel: "II Ciclo / Médio",
    classesCount: 6,
    totalEvaluatedStudents: 190,
    failingStudentsCount: 39,
    failureRatePercent: 20.5,
    averageGrade: 11.6,
    assignedTeachersCount: 2,
    urgencyLevel: "HIGH",
    recommendedIntervention:
      "Revisão prática laboratorial dos conceitos de cinemática e dinâmica.",
  },
  {
    id: "cs-3",
    subjectName: "Química",
    cycle: "CYCLE_2",
    cycleLabel: "II Ciclo / Médio",
    classesCount: 6,
    totalEvaluatedStudents: 190,
    failingStudentsCount: 31,
    failureRatePercent: 16.3,
    averageGrade: 12.1,
    assignedTeachersCount: 2,
    urgencyLevel: "MODERATE",
    recommendedIntervention:
      "Laboratórios experimentais para fixação de estequiometria.",
  },
  {
    id: "cs-4",
    subjectName: "Língua Inglesa",
    cycle: "CYCLE_1",
    cycleLabel: "I Ciclo Secundário",
    classesCount: 8,
    totalEvaluatedStudents: 320,
    failingStudentsCount: 45,
    failureRatePercent: 14.1,
    averageGrade: 12.8,
    assignedTeachersCount: 3,
    urgencyLevel: "MODERATE",
    recommendedIntervention:
      "Reforço de vocabulário e exercícios de compreensão auditiva.",
  },
];

const MOCK_HONOR_ROLL: HonorRollStudent[] = [
  {
    id: "hr-1",
    studentName: "Carlos Daniel Kuanza",
    studentNumber: "MS-2025-0481",
    className: "9ª Classe A",
    cycle: "CYCLE_1",
    cycleLabel: "I Ciclo Secundário",
    generalAverage: 17.8,
    bestSubject: { name: "Matemática", grade: 19.0 },
    totalDistinctions: 6,
    conduct: "EXCELENTE",
    academicYear: "2025/2026",
    trimester: "1_TRIMESTRE",
    diplomaGeneratedAt: "2026-03-01",
  },
  {
    id: "hr-2",
    studentName: "Miriam Varela dos Santos",
    studentNumber: "MS-2025-0104",
    className: "10ª Classe A",
    cycle: "CYCLE_2",
    cycleLabel: "II Ciclo / Médio",
    generalAverage: 18.2,
    bestSubject: { name: "Biologia", grade: 19.5 },
    totalDistinctions: 8,
    conduct: "EXCELENTE",
    academicYear: "2025/2026",
    trimester: "1_TRIMESTRE",
  },
  {
    id: "hr-3",
    studentName: "José Eduardo Domingos",
    studentNumber: "MS-2025-0219",
    className: "6ª Classe A",
    cycle: "PRIMARY",
    cycleLabel: "Ensino Primário",
    generalAverage: 17.4,
    bestSubject: { name: "Língua Portuguesa", grade: 18.5 },
    totalDistinctions: 5,
    conduct: "EXCELENTE",
    academicYear: "2025/2026",
    trimester: "1_TRIMESTRE",
  },
  {
    id: "hr-4",
    studentName: "Benedita Kassoma",
    studentNumber: "MS-2025-0312",
    className: "11ª Classe - Ciências",
    cycle: "CYCLE_2",
    cycleLabel: "II Ciclo / Médio",
    generalAverage: 16.9,
    bestSubject: { name: "Química", grade: 18.0 },
    totalDistinctions: 4,
    conduct: "MUITO_BOM",
    academicYear: "2025/2026",
    trimester: "1_TRIMESTRE",
  },
  {
    id: "hr-5",
    studentName: "Lukeni Sebastião Garcia",
    studentNumber: "MS-2025-0550",
    className: "8ª Classe B",
    cycle: "CYCLE_1",
    cycleLabel: "I Ciclo Secundário",
    generalAverage: 16.5,
    bestSubject: { name: "História", grade: 18.0 },
    totalDistinctions: 4,
    conduct: "EXCELENTE",
    academicYear: "2025/2026",
    trimester: "1_TRIMESTRE",
  },
];

const MOCK_EVOLUTION: TrimesterEvolutionPoint[] = [
  {
    trimester: "1º Trimestre",
    averageGrade: 13.8,
    passRatePercent: 85.6,
    failingCount: 68,
    honorRollCount: 42,
  },
  {
    trimester: "2º Trimestre (Actual)",
    averageGrade: 14.1,
    passRatePercent: 88.2,
    failingCount: 52,
    honorRollCount: 48,
  },
  {
    trimester: "3º Trimestre (Previsto)",
    averageGrade: 14.5,
    passRatePercent: 91.0,
    failingCount: 38,
    honorRollCount: 55,
  },
];

export const useAcademicPerformanceStore = create<AcademicPerformanceState>(
  (set) => ({
    classes: MOCK_CLASSES,
    criticalSubjects: MOCK_CRITICAL_SUBJECTS,
    honorRoll: MOCK_HONOR_ROLL,
    evolution: MOCK_EVOLUTION,
    selectedCycle: "ALL",
    selectedTrimester: "1_TRIMESTRE",
    searchQuery: "",
    selectedStudentForDiploma: null,

    setSelectedCycle: (cycle) => set({ selectedCycle: cycle }),
    setSelectedTrimester: (trimester) => set({ selectedTrimester: trimester }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    openDiplomaModal: (student) => set({ selectedStudentForDiploma: student }),
    closeDiplomaModal: () => set({ selectedStudentForDiploma: null }),
  })
);
