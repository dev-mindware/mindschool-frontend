import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AttendanceStatus,
  StudentAttendanceRecord,
  AbsenceJustification,
  DisciplinaryOccurrence,
  StudentAttendanceStats,
} from "@/types";

export interface StudentProfileItem {
  id: string;
  name: string;
  number: string;
  classId: string;
  className: string;
  gender: "M" | "F";
}

interface StudentAttendanceState {
  records: StudentAttendanceRecord[];
  justifications: AbsenceJustification[];
  disciplinaryOccurrences: DisciplinaryOccurrence[];

  selectedClassId: string;
  selectedDate: string;
  selectedSlotNumber: number;
  selectedSubjectId: string;

  students: StudentProfileItem[];

  // Actions
  setSelectedClassId: (classId: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlotNumber: (slotNumber: number) => void;
  setSelectedSubjectId: (subjectId: string) => void;

  markAttendance: (
    studentId: string,
    status: AttendanceStatus,
    notes?: string
  ) => void;

  markAllPresent: (
    classId: string,
    subjectId: string,
    subjectName: string,
    date: string,
    slotNumber: number,
    recordedBy: string
  ) => void;

  submitJustification: (
    data: Omit<AbsenceJustification, "id" | "submittedAt" | "status">
  ) => void;

  reviewJustification: (
    id: string,
    status: "APPROVED" | "REJECTED",
    reviewedBy: string,
    reviewNotes?: string
  ) => void;

  addDisciplinaryOccurrence: (
    data: Omit<DisciplinaryOccurrence, "id" | "status">
  ) => void;

  resolveDisciplinaryOccurrence: (id: string) => void;

  getStudentStats: (classId: string) => StudentAttendanceStats[];
  getClassAttendanceRate: (classId: string) => number;
}

const DEFAULT_STUDENTS: StudentProfileItem[] = [
  { id: "std-01", name: "Afonso Sebastião Bento", number: "Nº 01", classId: "sec-1", className: "9ª Classe A", gender: "M" },
  { id: "std-02", name: "Ana Beatriz Domingos", number: "Nº 02", classId: "sec-1", className: "9ª Classe A", gender: "F" },
  { id: "std-03", name: "Carlos Daniel Kiala", number: "Nº 03", classId: "sec-1", className: "9ª Classe A", gender: "M" },
  { id: "std-04", name: "Domingas Teresa Manuel", number: "Nº 04", classId: "sec-1", className: "9ª Classe A", gender: "F" },
  { id: "std-05", name: "Eduardo José Van-Dúnem", number: "Nº 05", classId: "sec-1", className: "9ª Classe A", gender: "M" },
  { id: "std-06", name: "Esperança Maria Morais", number: "Nº 06", classId: "sec-1", className: "9ª Classe A", gender: "F" },
  { id: "std-07", name: "Geraldo Pascoal António", number: "Nº 07", classId: "sec-1", className: "9ª Classe A", gender: "M" },
  { id: "std-08", name: "Helena Luísa Kapita", number: "Nº 08", classId: "sec-1", className: "9ª Classe A", gender: "F" },
  { id: "std-09", name: "Ismael Quaresma Silva", number: "Nº 09", classId: "sec-1", className: "9ª Classe A", gender: "M" },
  { id: "std-10", name: "Joana Francisca Neto", number: "Nº 10", classId: "sec-1", className: "9ª Classe A", gender: "F" },
  { id: "std-11", name: "Manuel António Costa", number: "Nº 11", classId: "sec-1", className: "9ª Classe A", gender: "M" },
  { id: "std-12", name: "Teresa Madalena Varela", number: "Nº 12", classId: "sec-1", className: "9ª Classe A", gender: "F" },
];

const INITIAL_RECORDS: StudentAttendanceRecord[] = [
  // Session today
  {
    id: "att-01",
    studentId: "std-01",
    studentName: "Afonso Sebastião Bento",
    studentNumber: "Nº 01",
    classId: "sec-1",
    className: "9ª Classe A",
    subjectId: "sub-1",
    subjectName: "Matemática",
    date: "2026-03-09",
    slotNumber: 1,
    status: "PRESENT",
    recordedBy: "Prof. Manuel dos Santos",
    recordedAt: "2026-03-09 07:35",
  },
  {
    id: "att-02",
    studentId: "std-02",
    studentName: "Ana Beatriz Domingos",
    studentNumber: "Nº 02",
    classId: "sec-1",
    className: "9ª Classe A",
    subjectId: "sub-1",
    subjectName: "Matemática",
    date: "2026-03-09",
    slotNumber: 1,
    status: "PRESENT",
    recordedBy: "Prof. Manuel dos Santos",
    recordedAt: "2026-03-09 07:35",
  },
  {
    id: "att-03",
    studentId: "std-03",
    studentName: "Carlos Daniel Kiala",
    studentNumber: "Nº 03",
    classId: "sec-1",
    className: "9ª Classe A",
    subjectId: "sub-1",
    subjectName: "Matemática",
    date: "2026-03-09",
    slotNumber: 1,
    status: "ABSENT_UNJUSTIFIED",
    notes: "Não compareceu nem apresentou aviso prévio",
    recordedBy: "Prof. Manuel dos Santos",
    recordedAt: "2026-03-09 07:35",
  },
  {
    id: "att-04",
    studentId: "std-04",
    studentName: "Domingas Teresa Manuel",
    studentNumber: "Nº 04",
    classId: "sec-1",
    className: "9ª Classe A",
    subjectId: "sub-1",
    subjectName: "Matemática",
    date: "2026-03-09",
    slotNumber: 1,
    status: "ABSENT_JUSTIFIED",
    notes: "Atestado médico entregue na secretaria",
    recordedBy: "Prof. Manuel dos Santos",
    recordedAt: "2026-03-09 07:35",
  },
  {
    id: "att-05",
    studentId: "std-05",
    studentName: "Eduardo José Van-Dúnem",
    studentNumber: "Nº 05",
    classId: "sec-1",
    className: "9ª Classe A",
    subjectId: "sub-1",
    subjectName: "Matemática",
    date: "2026-03-09",
    slotNumber: 1,
    status: "LATE",
    notes: "Entrou com 15 min de atraso devido ao trânsito",
    recordedBy: "Prof. Manuel dos Santos",
    recordedAt: "2026-03-09 07:45",
  },
  {
    id: "att-06",
    studentId: "std-06",
    studentName: "Esperança Maria Morais",
    studentNumber: "Nº 06",
    classId: "sec-1",
    className: "9ª Classe A",
    subjectId: "sub-1",
    subjectName: "Matemática",
    date: "2026-03-09",
    slotNumber: 1,
    status: "PRESENT",
    recordedBy: "Prof. Manuel dos Santos",
    recordedAt: "2026-03-09 07:35",
  },
];

const INITIAL_JUSTIFICATIONS: AbsenceJustification[] = [
  {
    id: "just-01",
    studentId: "std-04",
    studentName: "Domingas Teresa Manuel",
    className: "9ª Classe A",
    startDate: "2026-03-08",
    endDate: "2026-03-10",
    reason: "MEDICAL",
    reasonLabel: "Consulta Médica / Baixa Hospitalar",
    documentRef: "AM-9082-CLINICA-GIRASSOL",
    description: "Tratamento de gastroenterite aguda conforme prescrição médica.",
    status: "APPROVED",
    submittedAt: "2026-03-08 14:20",
    reviewedBy: "Profª. Maria Teresa Diogo da Silva (Directora Pedagógica)",
    reviewedAt: "2026-03-09 08:00",
    reviewNotes: "Documento original verificado e arquivado no processo individual.",
  },
  {
    id: "just-02",
    studentId: "std-09",
    studentName: "Ismael Quaresma Silva",
    className: "9ª Classe A",
    startDate: "2026-03-12",
    endDate: "2026-03-13",
    reason: "OFFICIAL_CONVOCATION",
    reasonLabel: "Representação Desportiva Oficial",
    documentRef: "FED-BASQUETEBOL-04/26",
    description: "Convocatória para estágio da Selecção Provincial de Juvenis de Basquetebol.",
    status: "PENDING",
    submittedAt: "2026-03-09 10:15",
  },
];

const INITIAL_DISCIPLINE: DisciplinaryOccurrence[] = [
  {
    id: "disc-01",
    studentId: "std-03",
    studentName: "Carlos Daniel Kiala",
    className: "9ª Classe A",
    date: "2026-03-05",
    severity: "MEDIUM",
    category: "DISRUPTIVE_BEHAVIOR",
    title: "Uso indevido de telemóvel e perturbação durante a aula",
    description: "O aluno insistiu em utilizar auscultadores e gravar vídeos na sala durante a explicação do professor.",
    reportedBy: "Prof. Manuel dos Santos",
    actionTaken: "Aparelho retido e entregue na Coordenação de Turno. Convocação do encarregado de educação.",
    parentNotified: true,
    status: "RESOLVED",
    resolvedAt: "2026-03-06",
  },
  {
    id: "disc-02",
    studentId: "std-11",
    studentName: "Manuel António Costa",
    className: "9ª Classe A",
    date: "2026-03-08",
    severity: "LOW",
    category: "UNIFORM_INFRACTION",
    title: "Uniforme incompleto e falta de calçado regulamentar",
    description: "Aluno apresentou-se com chinelos e camisola desportiva sem identificação da escola.",
    reportedBy: "Vigilante João Baptista",
    actionTaken: "Advertência verbal registada e termo de compromisso para regularização.",
    parentNotified: false,
    status: "OPEN",
  },
];

export const useStudentAttendanceStore = create<StudentAttendanceState>()(
  persist(
    (set, get) => ({
      records: INITIAL_RECORDS,
      justifications: INITIAL_JUSTIFICATIONS,
      disciplinaryOccurrences: INITIAL_DISCIPLINE,

      selectedClassId: "sec-1",
      selectedDate: "2026-03-09",
      selectedSlotNumber: 1,
      selectedSubjectId: "sub-1",

      students: DEFAULT_STUDENTS,

      setSelectedClassId: (classId) => set({ selectedClassId: classId }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedSlotNumber: (slotNumber) => set({ selectedSlotNumber: slotNumber }),
      setSelectedSubjectId: (subjectId) => set({ selectedSubjectId: subjectId }),

      markAttendance: (studentId, status, notes) => {
        const { records, selectedClassId, selectedDate, selectedSlotNumber, selectedSubjectId, students } = get();
        const student = students.find((s) => s.id === studentId);
        if (!student) return;

        const existingIndex = records.findIndex(
          (r) =>
            r.studentId === studentId &&
            r.classId === selectedClassId &&
            r.date === selectedDate &&
            r.slotNumber === selectedSlotNumber
        );

        if (existingIndex >= 0) {
          const updated = [...records];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status,
            notes: notes !== undefined ? notes : updated[existingIndex].notes,
            recordedAt: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          };
          set({ records: updated });
        } else {
          const newRecord: StudentAttendanceRecord = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            studentId,
            studentName: student.name,
            studentNumber: student.number,
            classId: selectedClassId,
            className: student.className,
            subjectId: selectedSubjectId,
            subjectName: "Matemática", // Or based on slot
            date: selectedDate,
            slotNumber: selectedSlotNumber,
            status,
            notes,
            recordedBy: "Docente em Serviço",
            recordedAt: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          };
          set({ records: [...records, newRecord] });
        }
      },

      markAllPresent: (classId, subjectId, subjectName, date, slotNumber, recordedBy) => {
        const { records, students } = get();
        const classStudents = students.filter((s) => s.classId === classId);

        const newRecords = classStudents.map((std) => {
          const existing = records.find(
            (r) =>
              r.studentId === std.id &&
              r.classId === classId &&
              r.date === date &&
              r.slotNumber === slotNumber
          );

          if (existing) {
            return {
              ...existing,
              status: "PRESENT" as AttendanceStatus,
              recordedBy,
              recordedAt: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
            };
          }

          return {
            id: `att-${Date.now()}-${std.id}`,
            studentId: std.id,
            studentName: std.name,
            studentNumber: std.number,
            classId,
            className: std.className,
            subjectId,
            subjectName,
            date,
            slotNumber,
            status: "PRESENT" as AttendanceStatus,
            recordedBy,
            recordedAt: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          };
        });

        // Filter out old records for this session and append updated/new ones
        const filteredOld = records.filter(
          (r) => !(r.classId === classId && r.date === date && r.slotNumber === slotNumber)
        );

        set({ records: [...filteredOld, ...newRecords] });
      },

      submitJustification: (data) => {
        const newJustification: AbsenceJustification = {
          ...data,
          id: `just-${Date.now()}`,
          status: "PENDING",
          submittedAt: new Date().toLocaleDateString("pt-PT") + " " + new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        };

        set((state) => ({
          justifications: [newJustification, ...state.justifications],
        }));
      },

      reviewJustification: (id, status, reviewedBy, reviewNotes) => {
        set((state) => ({
          justifications: state.justifications.map((j) => {
            if (j.id !== id) return j;
            return {
              ...j,
              status,
              reviewedBy,
              reviewedAt: new Date().toLocaleDateString("pt-PT"),
              reviewNotes,
            };
          }),
        }));
      },

      addDisciplinaryOccurrence: (data) => {
        const newOccurrence: DisciplinaryOccurrence = {
          ...data,
          id: `disc-${Date.now()}`,
          status: "OPEN",
        };

        set((state) => ({
          disciplinaryOccurrences: [newOccurrence, ...state.disciplinaryOccurrences],
        }));
      },

      resolveDisciplinaryOccurrence: (id) => {
        set((state) => ({
          disciplinaryOccurrences: state.disciplinaryOccurrences.map((d) =>
            d.id === id
              ? { ...d, status: "RESOLVED" as const, resolvedAt: new Date().toLocaleDateString("pt-PT") }
              : d
          ),
        }));
      },

      getStudentStats: (classId) => {
        const { students, records } = get();
        const classStudents = students.filter((s) => s.classId === classId);

        return classStudents.map((std) => {
          const studentRecords = records.filter((r) => r.studentId === std.id && r.classId === classId);
          // Baseline simulated total classes for semester: 40 classes
          const totalClasses = Math.max(studentRecords.length, 30);
          const presentCount = studentRecords.filter((r) => r.status === "PRESENT").length + 22;
          const unjustifiedCount = studentRecords.filter((r) => r.status === "ABSENT_UNJUSTIFIED").length + (std.id === "std-03" ? 7 : 1);
          const justifiedCount = studentRecords.filter((r) => r.status === "ABSENT_JUSTIFIED").length;
          const lateCount = studentRecords.filter((r) => r.status === "LATE").length;

          const attendanceRate = Math.round(((presentCount + lateCount) / totalClasses) * 100);
          const unjustifiedAbsenceRate = Math.round((unjustifiedCount / totalClasses) * 100);

          let medLimitRisk: "NORMAL" | "WARNING" | "AT_RISK" | "DISQUALIFIED" = "NORMAL";
          if (unjustifiedAbsenceRate >= 25) {
            medLimitRisk = "DISQUALIFIED"; // Perda de frequência (Regulamento MED)
          } else if (unjustifiedAbsenceRate >= 20) {
            medLimitRisk = "AT_RISK";
          } else if (unjustifiedAbsenceRate >= 12) {
            medLimitRisk = "WARNING";
          }

          return {
            studentId: std.id,
            studentName: std.name,
            studentNumber: std.number,
            totalClasses,
            presentCount,
            unjustifiedCount,
            justifiedCount,
            lateCount,
            attendanceRate: Math.min(100, attendanceRate),
            unjustifiedAbsenceRate,
            medLimitRisk,
          };
        });
      },

      getClassAttendanceRate: (classId) => {
        const stats = get().getStudentStats(classId);
        if (!stats.length) return 94;
        const sum = stats.reduce((acc, s) => acc + s.attendanceRate, 0);
        return Math.round(sum / stats.length);
      },
    }),
    {
      name: "mindschool-student-attendance-storage",
    }
  )
);
