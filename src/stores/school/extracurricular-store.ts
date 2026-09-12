import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ExtracurricularActivity,
  ActivityEnrollment,
  ActivityAttendanceRecord,
  ActivityEnrollmentStatus,
  ActivityCategory,
} from "@/types";

interface ExtracurricularState {
  activities: ExtracurricularActivity[];
  enrollments: ActivityEnrollment[];
  attendanceLogs: ActivityAttendanceRecord[];
  selectedCategory: string;
  searchQuery: string;

  // Actions
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;

  addActivity: (activity: Omit<ExtracurricularActivity, "id" | "enrolledCount">) => ExtracurricularActivity;
  updateActivity: (id: string, data: Partial<ExtracurricularActivity>) => void;

  enrollStudent: (
    data: Omit<ActivityEnrollment, "id" | "enrolledAt" | "status">
  ) => ActivityEnrollment;
  updateEnrollmentStatus: (id: string, status: ActivityEnrollmentStatus) => void;
  addStudentAchievement: (enrollmentId: string, achievement: string) => void;

  recordSessionAttendance: (records: Omit<ActivityAttendanceRecord, "id">[]) => void;
}

const INITIAL_ACTIVITIES: ExtracurricularActivity[] = [
  {
    id: "act-01",
    code: "ACT-ROB-01",
    name: "Clube de Robótica & Programação STEAM",
    category: "TECHNOLOGY_STEM",
    categoryLabel: "Ciência, Robótica & Programação",
    description: "Construção de circuitos com Arduino, programação em blocos e Python, e desafios práticos de automação e robótica educativa.",
    instructorName: "Eng. Sílvio Ndalu (Engenheiro Informático)",
    instructorPhone: "+244 923 881 122",
    scheduleDays: "Quartas e Sextas-feiras",
    scheduleTime: "15:00 - 16:30",
    location: "Laboratório de Informática / Sala STEAM",
    targetGrades: "7ª à 12ª Classe",
    maxCapacity: 20,
    enrolledCount: 4,
    isActive: true,
  },
  {
    id: "act-02",
    code: "ACT-XAD-01",
    name: "Academia de Xadrez Escolar MindSchool",
    category: "ACADEMIC_CHESS",
    categoryLabel: "Xadrez & Estratégia Cognitiva",
    description: "Desenvolvimento do raciocínio lógico, concentração e estratégia, com preparação para torneios provinciais e nacionais inter-escolares.",
    instructorName: "Mestre Domingos Neves",
    instructorPhone: "+244 931 556 778",
    scheduleDays: "Terças e Quintas-feiras",
    scheduleTime: "14:30 - 16:00",
    location: "Sala Multiusos Pedagógica",
    targetGrades: "5ª à 12ª Classe",
    maxCapacity: 24,
    enrolledCount: 3,
    isActive: true,
  },
  {
    id: "act-03",
    code: "ACT-BAS-01",
    name: "Escola de Basquetebol Sub-14 & Sub-16",
    category: "SPORTS",
    categoryLabel: "Desporto Escolar",
    description: "Treinos técnicos de drible, passe, lançamento e condicionamento físico no pavilhão da instituição.",
    instructorName: "Prof. Victorino Morais (Treinador Nível II)",
    instructorPhone: "+244 912 770 099",
    scheduleDays: "Segundas, Quartas e Sextas",
    scheduleTime: "16:00 - 17:30",
    location: "Pavilhão Gimnodesportivo Principal",
    targetGrades: "7ª à 11ª Classe",
    maxCapacity: 25,
    enrolledCount: 3,
    isActive: true,
  },
  {
    id: "act-04",
    code: "ACT-FUT-01",
    name: "Futebol 7 Escolar MindSchool",
    category: "SPORTS",
    categoryLabel: "Desporto Escolar",
    description: "Escolinha de futebol com foco em espírito desportivo, disciplina colectiva, táctica e preparação física.",
    instructorName: "Prof. Manuel Caxita",
    instructorPhone: "+244 945 223 344",
    scheduleDays: "Terças e Quintas-feiras",
    scheduleTime: "16:00 - 17:30",
    location: "Campo Sintético MindSchool",
    targetGrades: "6ª à 10ª Classe",
    maxCapacity: 30,
    enrolledCount: 2,
    isActive: true,
  },
  {
    id: "act-05",
    code: "ACT-TEA-01",
    name: "Oficina de Teatro, Oratória & Poesia Angolana",
    category: "ARTS_CULTURE",
    categoryLabel: "Artes & Cultura",
    description: "Expressão corporal, dramatização de clássicos da literatura angolana (Agostinho Neto, Pepetela) e treino de oratória e comunicação em público.",
    instructorName: "Dra. Esperança de Lemos",
    instructorPhone: "+244 924 990 112",
    scheduleDays: "Sextas-feiras",
    scheduleTime: "14:30 - 16:30",
    location: "Auditório Central da Escola",
    targetGrades: "7ª à 12ª Classe",
    maxCapacity: 25,
    enrolledCount: 2,
    isActive: true,
  },
  {
    id: "act-06",
    code: "ACT-DAN-01",
    name: "Dança Tradicional Angolana & Percussão",
    category: "ARTS_CULTURE",
    categoryLabel: "Artes & Cultura",
    description: "Valorização das danças folclóricas das províncias de Angola (Semba, Kilapanga, Kabetula) e ritmos tradicionais.",
    instructorName: "Mestre Banza Cabral",
    instructorPhone: "+244 933 441 556",
    scheduleDays: "Quartas-feiras",
    scheduleTime: "15:00 - 16:30",
    location: "Sala de Expressão Artística",
    targetGrades: "5ª à 9ª Classe",
    maxCapacity: 20,
    enrolledCount: 1,
    isActive: true,
  },
];

const INITIAL_ENROLLMENTS: ActivityEnrollment[] = [
  {
    id: "enr-01",
    activityId: "act-01",
    activityName: "Clube de Robótica & Programação STEAM",
    studentId: "stu-01",
    studentNumber: "MS-2026-0042",
    studentName: "Nzuzi Maria Afonso",
    classLevel: "10ª Classe",
    sectionName: "Turma 10A",
    guardianName: "Ana Paula Afonso",
    guardianPhone: "+244 923 456 789",
    enrolledAt: "2026-01-20",
    status: "ACTIVE",
    achievements: ["Projecto Vencedor: Sensor de Rega Inteligente"],
  },
  {
    id: "enr-02",
    activityId: "act-01",
    activityName: "Clube de Robótica & Programação STEAM",
    studentId: "stu-02",
    studentNumber: "MS-2026-0089",
    studentName: "Mauro António Gaspar",
    classLevel: "11ª Classe",
    sectionName: "Turma 11B",
    guardianName: "António Gaspar",
    guardianPhone: "+244 931 112 233",
    enrolledAt: "2026-01-22",
    status: "ACTIVE",
  },
  {
    id: "enr-03",
    activityId: "act-02",
    activityName: "Academia de Xadrez Escolar MindSchool",
    studentId: "stu-04",
    studentNumber: "MS-2026-0120",
    studentName: "Joaquim Bernardo Silva",
    classLevel: "7ª Classe",
    sectionName: "Turma 7C",
    guardianName: "Helena Silva",
    guardianPhone: "+244 912 345 678",
    enrolledAt: "2026-01-25",
    status: "ACTIVE",
    achievements: ["Vice-Campeão do Torneio Relâmpago de Abertura"],
  },
  {
    id: "enr-04",
    activityId: "act-03",
    activityName: "Escola de Basquetebol Sub-14 & Sub-16",
    studentId: "stu-03",
    studentNumber: "MS-2026-0105",
    studentName: "Esperança Domingos",
    classLevel: "8ª Classe",
    sectionName: "Turma 8A",
    guardianName: "Teresa Manuel Domingos",
    guardianPhone: "+244 945 889 900",
    enrolledAt: "2026-01-28",
    status: "ACTIVE",
  },
];

const INITIAL_ATTENDANCE: ActivityAttendanceRecord[] = [
  {
    id: "att-01",
    activityId: "act-01",
    date: "2026-03-04",
    sessionTopic: "Montagem de circuito com sensor ultrassónico e LED",
    studentId: "stu-01",
    studentName: "Nzuzi Maria Afonso",
    studentNumber: "MS-2026-0042",
    isPresent: true,
    recordedBy: "Eng. Sílvio Ndalu",
  },
  {
    id: "att-02",
    activityId: "act-01",
    date: "2026-03-04",
    sessionTopic: "Montagem de circuito com sensor ultrassónico e LED",
    studentId: "stu-02",
    studentName: "Mauro António Gaspar",
    studentNumber: "MS-2026-0089",
    isPresent: true,
    recordedBy: "Eng. Sílvio Ndalu",
  },
  {
    id: "att-03",
    activityId: "act-02",
    date: "2026-03-03",
    sessionTopic: "Finais de Peões e Regra do Quadrado",
    studentId: "stu-04",
    studentName: "Joaquim Bernardo Silva",
    studentNumber: "MS-2026-0120",
    isPresent: true,
    recordedBy: "Mestre Domingos Neves",
  },
];

export const useExtracurricularStore = create<ExtracurricularState>()(
  persist(
    (set, get) => ({
      activities: INITIAL_ACTIVITIES,
      enrollments: INITIAL_ENROLLMENTS,
      attendanceLogs: INITIAL_ATTENDANCE,
      selectedCategory: "ALL",
      searchQuery: "",

      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      addActivity: (activityData) => {
        const newAct: ExtracurricularActivity = {
          ...activityData,
          id: `act-${Date.now()}`,
          enrolledCount: 0,
        };
        set((state) => ({ activities: [...state.activities, newAct] }));
        return newAct;
      },

      updateActivity: (id, data) => {
        set((state) => ({
          activities: state.activities.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }));
      },

      enrollStudent: (data) => {
        const newEnrollment: ActivityEnrollment = {
          ...data,
          id: `enr-${Date.now()}`,
          enrolledAt: new Date().toISOString().split("T")[0],
          status: "ACTIVE",
        };

        set((state) => {
          const updatedActivities = state.activities.map((act) => {
            if (act.id === data.activityId) {
              return { ...act, enrolledCount: act.enrolledCount + 1 };
            }
            return act;
          });

          return {
            enrollments: [...state.enrollments, newEnrollment],
            activities: updatedActivities,
          };
        });

        return newEnrollment;
      },

      updateEnrollmentStatus: (id, status) => {
        set((state) => ({
          enrollments: state.enrollments.map((e) => (e.id === id ? { ...e, status } : e)),
        }));
      },

      addStudentAchievement: (enrollmentId, achievement) => {
        set((state) => ({
          enrollments: state.enrollments.map((e) => {
            if (e.id === enrollmentId) {
              return {
                ...e,
                achievements: [...(e.achievements || []), achievement],
              };
            }
            return e;
          }),
        }));
      },

      recordSessionAttendance: (records) => {
        const newRecords: ActivityAttendanceRecord[] = records.map((r, i) => ({
          ...r,
          id: `att-${Date.now()}-${i}`,
        }));

        set((state) => ({
          attendanceLogs: [...newRecords, ...state.attendanceLogs],
        }));
      },
    }),
    {
      name: "mindschool-extracurricular-storage",
    }
  )
);
