import { create } from "zustand";
import {
  DayOfWeek,
  TimeSlotDefinition,
  ClassScheduleEntry,
  ScheduleConflictWarning,
  TeacherWeeklyLoad,
} from "@/types";
import { Shift } from "@/types/academic";

interface TimetableState {
  entries: ClassScheduleEntry[];
  morningSlots: TimeSlotDefinition[];
  afternoonSlots: TimeSlotDefinition[];
  selectedClassId: string;
  selectedShift: Shift;
  selectedTeacherId: string | null;
  activeView: "CLASS_GRID" | "TEACHER_SCHEDULE" | "ROOM_OCCUPANCY";

  // Actions
  setSelectedClassId: (classId: string) => void;
  setSelectedShift: (shift: Shift) => void;
  setSelectedTeacherId: (teacherId: string | null) => void;
  setActiveView: (view: "CLASS_GRID" | "TEACHER_SCHEDULE" | "ROOM_OCCUPANCY") => void;

  assignSlot: (entry: Omit<ClassScheduleEntry, "id">) => { success: boolean; conflict?: ScheduleConflictWarning };
  removeSlot: (entryId: string) => void;
  checkConflict: (
    classId: string,
    dayOfWeek: DayOfWeek,
    slotNumber: number,
    teacherId: string,
    roomId: string,
    ignoreEntryId?: string
  ) => ScheduleConflictWarning;
  getTeacherWeeklyLoad: (teacherId: string) => TeacherWeeklyLoad;
}

const MORNING_SLOTS: TimeSlotDefinition[] = [
  { id: "ms-1", slotNumber: 1, shift: "MORNING", startTime: "07:30", endTime: "08:15", label: "1º Tempo (07:30 - 08:15)" },
  { id: "ms-2", slotNumber: 2, shift: "MORNING", startTime: "08:20", endTime: "09:05", label: "2º Tempo (08:20 - 09:05)" },
  { id: "ms-3", slotNumber: 3, shift: "MORNING", startTime: "09:25", endTime: "10:10", label: "3º Tempo (09:25 - 10:10)" },
  { id: "ms-4", slotNumber: 4, shift: "MORNING", startTime: "10:15", endTime: "11:00", label: "4º Tempo (10:15 - 11:00)" },
  { id: "ms-5", slotNumber: 5, shift: "MORNING", startTime: "11:10", endTime: "11:55", label: "5º Tempo (11:10 - 11:55)" },
  { id: "ms-6", slotNumber: 6, shift: "MORNING", startTime: "12:00", endTime: "12:45", label: "6º Tempo (12:00 - 12:45)" },
];

const AFTERNOON_SLOTS: TimeSlotDefinition[] = [
  { id: "as-1", slotNumber: 1, shift: "AFTERNOON", startTime: "13:00", endTime: "13:45", label: "1º Tempo (13:00 - 13:45)" },
  { id: "as-2", slotNumber: 2, shift: "AFTERNOON", startTime: "13:50", endTime: "14:35", label: "2º Tempo (13:50 - 14:35)" },
  { id: "as-3", slotNumber: 3, shift: "AFTERNOON", startTime: "14:55", endTime: "15:40", label: "3º Tempo (14:55 - 15:40)" },
  { id: "as-4", slotNumber: 4, shift: "AFTERNOON", startTime: "15:45", endTime: "16:30", label: "4º Tempo (15:45 - 16:30)" },
  { id: "as-5", slotNumber: 5, shift: "AFTERNOON", startTime: "16:40", endTime: "17:25", label: "5º Tempo (16:40 - 17:25)" },
  { id: "as-6", slotNumber: 6, shift: "AFTERNOON", startTime: "17:30", endTime: "18:15", label: "6º Tempo (17:30 - 18:15)" },
];

const INITIAL_ENTRIES: ClassScheduleEntry[] = [
  // 9ª Classe A - Manhã
  {
    id: "sch-1",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 1, // Segunda
    slotNumber: 1,
    subjectId: "sub-1",
    subjectName: "Matemática",
    subjectColor: "bg-blue-500/15 border-blue-500/30 text-blue-800",
    teacherId: "tea-1",
    teacherName: "Prof. Manuel dos Santos",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-2",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 1, // Segunda
    slotNumber: 2,
    subjectId: "sub-1",
    subjectName: "Matemática",
    subjectColor: "bg-blue-500/15 border-blue-500/30 text-blue-800",
    teacherId: "tea-1",
    teacherName: "Prof. Manuel dos Santos",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-3",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 1, // Segunda
    slotNumber: 3,
    subjectId: "sub-2",
    subjectName: "Língua Portuguesa",
    subjectColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-800",
    teacherId: "tea-2",
    teacherName: "Profª. Teresa Silva",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-4",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 1, // Segunda
    slotNumber: 4,
    subjectId: "sub-3",
    subjectName: "Física",
    subjectColor: "bg-amber-500/15 border-amber-500/30 text-amber-800",
    teacherId: "tea-3",
    teacherName: "Prof. Alberto Silva",
    roomId: "room-lab1",
    roomName: "Laboratório de Ciências",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  // Terça
  {
    id: "sch-5",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 2, // Terça
    slotNumber: 1,
    subjectId: "sub-4",
    subjectName: "Química",
    subjectColor: "bg-purple-500/15 border-purple-500/30 text-purple-800",
    teacherId: "tea-4",
    teacherName: "Profª. Maria Afonso",
    roomId: "room-lab1",
    roomName: "Laboratório de Ciências",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-6",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 2, // Terça
    slotNumber: 2,
    subjectId: "sub-5",
    subjectName: "Biologia",
    subjectColor: "bg-teal-500/15 border-teal-500/30 text-teal-800",
    teacherId: "tea-5",
    teacherName: "Prof. Domingos Kiala",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-7",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 2, // Terça
    slotNumber: 3,
    subjectId: "sub-1",
    subjectName: "Matemática",
    subjectColor: "bg-blue-500/15 border-blue-500/30 text-blue-800",
    teacherId: "tea-1",
    teacherName: "Prof. Manuel dos Santos",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  // Quarta
  {
    id: "sch-8",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 3, // Quarta
    slotNumber: 1,
    subjectId: "sub-6",
    subjectName: "História",
    subjectColor: "bg-rose-500/15 border-rose-500/30 text-rose-800",
    teacherId: "tea-6",
    teacherName: "Profª. Ana Gaspar",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-9",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 3, // Quarta
    slotNumber: 2,
    subjectId: "sub-7",
    subjectName: "Geografia",
    subjectColor: "bg-indigo-500/15 border-indigo-500/30 text-indigo-800",
    teacherId: "tea-7",
    teacherName: "Prof. Lucas Varela",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-10",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 3, // Quarta
    slotNumber: 3,
    subjectId: "sub-2",
    subjectName: "Língua Portuguesa",
    subjectColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-800",
    teacherId: "tea-2",
    teacherName: "Profª. Teresa Silva",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  // Quinta
  {
    id: "sch-11",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 4, // Quinta
    slotNumber: 1,
    subjectId: "sub-8",
    subjectName: "Língua Inglesa",
    subjectColor: "bg-cyan-500/15 border-cyan-500/30 text-cyan-800",
    teacherId: "tea-8",
    teacherName: "Prof. John Doe",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-12",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 4, // Quinta
    slotNumber: 2,
    subjectId: "sub-9",
    subjectName: "Educação Física",
    subjectColor: "bg-orange-500/15 border-orange-500/30 text-orange-800",
    teacherId: "tea-9",
    teacherName: "Prof. Paulo Cassoma",
    roomId: "room-court",
    roomName: "Quadra Polidesportiva",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  // Sexta
  {
    id: "sch-13",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 5, // Sexta
    slotNumber: 1,
    subjectId: "sub-1",
    subjectName: "Matemática",
    subjectColor: "bg-blue-500/15 border-blue-500/30 text-blue-800",
    teacherId: "tea-1",
    teacherName: "Prof. Manuel dos Santos",
    roomId: "room-1",
    roomName: "Sala 14 - Bloco B",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
  {
    id: "sch-14",
    classId: "sec-1",
    className: "9ª Classe A",
    dayOfWeek: 5, // Sexta
    slotNumber: 2,
    subjectId: "sub-10",
    subjectName: "Informática & TIC",
    subjectColor: "bg-slate-500/15 border-slate-500/30 text-slate-800",
    teacherId: "tea-10",
    teacherName: "Prof. Carlos Kiala",
    roomId: "room-inf",
    roomName: "Laboratório de Informática",
    shift: "MORNING",
    academicYear: "2025/2026",
  },
];

export const useTimetableStore = create<TimetableState>((set, get) => ({
  entries: INITIAL_ENTRIES,
  morningSlots: MORNING_SLOTS,
  afternoonSlots: AFTERNOON_SLOTS,
  selectedClassId: "sec-1", // 9ª Classe A
  selectedShift: "MORNING",
  selectedTeacherId: null,
  activeView: "CLASS_GRID",

  setSelectedClassId: (classId) => set({ selectedClassId: classId }),
  setSelectedShift: (shift) => set({ selectedShift: shift }),
  setSelectedTeacherId: (teacherId) => set({ selectedTeacherId: teacherId }),
  setActiveView: (view) => set({ activeView: view }),

  checkConflict: (classId, dayOfWeek, slotNumber, teacherId, roomId, ignoreEntryId) => {
    const { entries } = get();

    // Check teacher overlap
    const teacherConflict = entries.find(
      (e) =>
        e.id !== ignoreEntryId &&
        e.dayOfWeek === dayOfWeek &&
        e.slotNumber === slotNumber &&
        e.teacherId === teacherId
    );

    if (teacherConflict) {
      return {
        hasConflict: true,
        type: "TEACHER_OVERLAP",
        conflictingEntry: teacherConflict,
        message: `Choque de Horário: O professor ${teacherConflict.teacherName} já está a leccionar na turma ${teacherConflict.className} neste mesmo tempo!`,
      };
    }

    // Check room overlap
    const roomConflict = entries.find(
      (e) =>
        e.id !== ignoreEntryId &&
        e.dayOfWeek === dayOfWeek &&
        e.slotNumber === slotNumber &&
        e.roomId === roomId
    );

    if (roomConflict) {
      return {
        hasConflict: true,
        type: "ROOM_OVERLAP",
        conflictingEntry: roomConflict,
        message: `Choque de Sala: A sala ${roomConflict.roomName} já está ocupada pela turma ${roomConflict.className} neste horário!`,
      };
    }

    return { hasConflict: false };
  },

  assignSlot: (entryData) => {
    const conflict = get().checkConflict(
      entryData.classId,
      entryData.dayOfWeek,
      entryData.slotNumber,
      entryData.teacherId,
      entryData.roomId
    );

    if (conflict.hasConflict) {
      return { success: false, conflict };
    }

    const newEntry: ClassScheduleEntry = {
      ...entryData,
      id: `sch-${Date.now()}`,
    };

    set((state) => {
      // Remove any existing entry in that same class slot if any
      const filtered = state.entries.filter(
        (e) =>
          !(
            e.classId === entryData.classId &&
            e.dayOfWeek === entryData.dayOfWeek &&
            e.slotNumber === entryData.slotNumber
          )
      );
      return { entries: [...filtered, newEntry] };
    });

    return { success: true };
  },

  removeSlot: (entryId) => {
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== entryId),
    }));
  },

  getTeacherWeeklyLoad: (teacherId) => {
    const { entries } = get();
    const teacherEntries = entries.filter((e) => e.teacherId === teacherId);
    const classesAssigned = Array.from(new Set(teacherEntries.map((e) => e.className)));
    const daysActive = Array.from(new Set(teacherEntries.map((e) => e.dayOfWeek))).sort();

    return {
      teacherId,
      teacherName: teacherEntries[0]?.teacherName || "",
      totalSlots: teacherEntries.length,
      classesAssigned,
      daysActive,
    };
  },
}));
