import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  TeacherAttendanceLog, 
  TeacherQrCredential, 
  TeacherAttendanceMetrics,
  TeacherDayStatus
} from '@/types/teacher-attendance';

interface TeacherAttendanceState {
  attendanceLogs: TeacherAttendanceLog[];
  credentials: TeacherQrCredential[];
  selectedTeacherId: string | null;
  filterStatus: TeacherDayStatus | 'ALL';
  searchQuery: string;

  // Actions
  selectTeacher: (id: string | null) => void;
  setStatusFilter: (status: TeacherDayStatus | 'ALL') => void;
  setSearchQuery: (query: string) => void;
  registerScan: (qrCodeValue: string, terminalId?: string) => { 
    success: boolean; 
    type: 'CHECK_IN' | 'CHECK_OUT'; 
    teacherName: string; 
    time: string; 
    message: string;
  };
  justifyAbsence: (teacherId: string, reason: string, docName?: string) => void;
  toggleCardPrinted: (teacherId: string) => void;
  getMetrics: () => TeacherAttendanceMetrics;
}

const initialTeachers: { id: string; name: string; code: string; dept: string }[] = [
  { id: 'tch-01', name: 'Prof. Mateus Kapuka', code: 'DOC-1001', dept: 'Matemática & Física' },
  { id: 'tch-02', name: 'Prof.ª Teresa Gonçalves', code: 'DOC-1002', dept: 'Língua Portuguesa' },
  { id: 'tch-03', name: 'Prof. Dr. Nelson Vunge', code: 'DOC-1003', dept: 'Química & Biologia' },
  { id: 'tch-04', name: 'Prof. Henrique Dala', code: 'DOC-1004', dept: 'História & Filosofia' },
  { id: 'tch-05', name: 'Prof.ª Isabel Santos', code: 'DOC-1005', dept: 'Ciências Sociais' },
  { id: 'tch-06', name: 'Prof. Adão Miranda', code: 'DOC-1006', dept: 'Educação Física' },
  { id: 'tch-07', name: 'Prof.ª Beatriz Samakaka', code: 'DOC-1007', dept: 'Informática & TIC' },
  { id: 'tch-08', name: 'Prof. Lourenço Bartolomeu', code: 'DOC-1008', dept: 'Geografia' },
];

const todayDate = new Date().toISOString().slice(0, 10);

const initialAttendanceLogs: TeacherAttendanceLog[] = [
  {
    id: 'log-001',
    teacherId: 'tch-01',
    teacherName: 'Prof. Mateus Kapuka',
    teacherCode: 'DOC-1001',
    department: 'Matemática & Física',
    date: todayDate,
    checkInTime: '07:22:15',
    status: 'PRESENT',
    checkInMethod: 'QR_DYNAMIC_APP',
    terminalId: 'PORTAO-PRINCIPAL-01',
    scheduledClassesCount: 4,
    completedClassesCount: 4,
    delayMinutes: 0,
  },
  {
    id: 'log-002',
    teacherId: 'tch-02',
    teacherName: 'Prof.ª Teresa Gonçalves',
    teacherCode: 'DOC-1002',
    department: 'Língua Portuguesa',
    date: todayDate,
    checkInTime: '07:28:40',
    status: 'PRESENT',
    checkInMethod: 'QR_STATIC_CARD',
    terminalId: 'SECRETARIA-BALCAO-02',
    scheduledClassesCount: 5,
    completedClassesCount: 5,
    delayMinutes: 0,
  },
  {
    id: 'log-003',
    teacherId: 'tch-03',
    teacherName: 'Prof. Dr. Nelson Vunge',
    teacherCode: 'DOC-1003',
    department: 'Química & Biologia',
    date: todayDate,
    checkInTime: '08:05:10',
    status: 'LATE',
    checkInMethod: 'QR_DYNAMIC_APP',
    terminalId: 'PORTAO-PRINCIPAL-01',
    scheduledClassesCount: 4,
    completedClassesCount: 3,
    delayMinutes: 20,
  },
  {
    id: 'log-004',
    teacherId: 'tch-04',
    teacherName: 'Prof. Henrique Dala',
    teacherCode: 'DOC-1004',
    department: 'História & Filosofia',
    date: todayDate,
    checkInTime: '07:15:02',
    checkOutTime: '13:10:44',
    durationMinutes: 355,
    status: 'PRESENT',
    checkInMethod: 'QR_DYNAMIC_APP',
    checkOutMethod: 'QR_DYNAMIC_APP',
    terminalId: 'PORTAO-PRINCIPAL-01',
    scheduledClassesCount: 4,
    completedClassesCount: 4,
    delayMinutes: 0,
  },
  {
    id: 'log-005',
    teacherId: 'tch-05',
    teacherName: 'Prof.ª Isabel Santos',
    teacherCode: 'DOC-1005',
    department: 'Ciências Sociais',
    date: todayDate,
    status: 'JUSTIFIED_ABSENCE',
    scheduledClassesCount: 4,
    completedClassesCount: 0,
    justificationReason: 'Atestado Médico - Consulta Externa Hospital Militar de Luanda',
    justificationDocument: 'atestado-isabel-santos-11set.pdf',
  },
  {
    id: 'log-006',
    teacherId: 'tch-06',
    teacherName: 'Prof. Adão Miranda',
    teacherCode: 'DOC-1006',
    department: 'Educação Física',
    date: todayDate,
    checkInTime: '07:25:50',
    status: 'PRESENT',
    checkInMethod: 'QR_STATIC_CARD',
    terminalId: 'PORTAO-PRINCIPAL-01',
    scheduledClassesCount: 3,
    completedClassesCount: 3,
    delayMinutes: 0,
  },
  {
    id: 'log-007',
    teacherId: 'tch-07',
    teacherName: 'Prof.ª Beatriz Samakaka',
    teacherCode: 'DOC-1007',
    department: 'Informática & TIC',
    date: todayDate,
    checkInTime: '07:19:30',
    status: 'PRESENT',
    checkInMethod: 'QR_DYNAMIC_APP',
    terminalId: 'LAB-INFORMATICA-01',
    scheduledClassesCount: 4,
    completedClassesCount: 4,
    delayMinutes: 0,
  },
  {
    id: 'log-008',
    teacherId: 'tch-08',
    teacherName: 'Prof. Lourenço Bartolomeu',
    teacherCode: 'DOC-1008',
    department: 'Geografia',
    date: todayDate,
    status: 'ABSENT',
    scheduledClassesCount: 3,
    completedClassesCount: 0,
  },
];

const initialCredentials: TeacherQrCredential[] = initialTeachers.map((t) => ({
  id: `crd-${t.id}`,
  teacherId: t.id,
  teacherName: t.name,
  teacherCode: t.code,
  staticCardQr: `MINDSCHOOL:TEACHER:${t.code}:2026`,
  dynamicAppToken: `APP-TOKEN-${t.code}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  isCardPrinted: true,
  issuedAt: '2026-08-15',
  status: 'ACTIVE',
}));

export const useTeacherAttendanceStore = create<TeacherAttendanceState>()(
  persist(
    (set, get) => ({
      attendanceLogs: initialAttendanceLogs,
      credentials: initialCredentials,
      selectedTeacherId: null,
      filterStatus: 'ALL',
      searchQuery: '',

      selectTeacher: (id) => set({ selectedTeacherId: id }),

      setStatusFilter: (status) => set({ filterStatus: status }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      registerScan: (qrCodeValue, terminalId = 'TERMINAL-BALCAO-01') => {
        const { credentials, attendanceLogs } = get();
        const trimmed = qrCodeValue.trim();

        // Procura docente correspondente ao QR estático ou token dinâmico
        const cred = credentials.find(
          (c) =>
            c.staticCardQr === trimmed ||
            c.teacherCode === trimmed ||
            (c.dynamicAppToken && trimmed.includes(c.dynamicAppToken)) ||
            trimmed.includes(c.teacherCode)
        );

        if (!cred) {
          return {
            success: false,
            type: 'CHECK_IN',
            teacherName: '',
            time: '',
            message: 'Código QR não reconhecido ou docente não cadastrado no MindSchool.',
          };
        }

        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 8);
        const today = now.toISOString().slice(0, 10);

        // Procura log existente hoje
        const existingLogIndex = attendanceLogs.findIndex(
          (l) => l.teacherId === cred.teacherId && l.date === today
        );

        if (existingLogIndex === -1) {
          // Check-in inicial do dia
          const isLate = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 45);
          const delayMinutes = isLate ? (now.getHours() - 7) * 60 + now.getMinutes() - 45 : 0;

          const newLog: TeacherAttendanceLog = {
            id: `log-${Date.now()}`,
            teacherId: cred.teacherId,
            teacherName: cred.teacherName,
            teacherCode: cred.teacherCode,
            department: 'Corpo Docente',
            date: today,
            checkInTime: timeStr,
            status: isLate ? 'LATE' : 'PRESENT',
            checkInMethod: trimmed.startsWith('MINDSCHOOL:TEACHER') ? 'QR_STATIC_CARD' : 'QR_DYNAMIC_APP',
            terminalId,
            scheduledClassesCount: 4,
            completedClassesCount: isLate ? 3 : 4,
            delayMinutes,
          };

          set((state) => ({
            attendanceLogs: [newLog, ...state.attendanceLogs],
          }));

          return {
            success: true,
            type: 'CHECK_IN',
            teacherName: cred.teacherName,
            time: timeStr,
            message: isLate 
              ? `Entrada registada com atraso de ${delayMinutes} min (${timeStr}).` 
              : `Entrada registada com pontualidade (${timeStr}). Bom trabalho!`,
          };
        }

        const currentLog = attendanceLogs[existingLogIndex];

        if (!currentLog.checkOutTime) {
          // Check-out
          const updatedLog: TeacherAttendanceLog = {
            ...currentLog,
            checkOutTime: timeStr,
            checkOutMethod: trimmed.startsWith('MINDSCHOOL:TEACHER') ? 'QR_STATIC_CARD' : 'QR_DYNAMIC_APP',
            durationMinutes: 360,
          };

          const updatedLogs = [...attendanceLogs];
          updatedLogs[existingLogIndex] = updatedLog;

          set({ attendanceLogs: updatedLogs });

          return {
            success: true,
            type: 'CHECK_OUT',
            teacherName: cred.teacherName,
            time: timeStr,
            message: `Saída registada com sucesso às ${timeStr}. Até amanhã!`,
          };
        } else {
          // Já fez checkout hoje, registra nova saída ou substituição
          return {
            success: true,
            type: 'CHECK_OUT',
            teacherName: cred.teacherName,
            time: currentLog.checkOutTime,
            message: `Docente já realizou saída hoje às ${currentLog.checkOutTime}.`,
          };
        }
      },

      justifyAbsence: (teacherId, reason, docName) => {
        const today = new Date().toISOString().slice(0, 10);
        set((state) => ({
          attendanceLogs: state.attendanceLogs.map((log) => {
            if (log.teacherId === teacherId && log.date === today) {
              return {
                ...log,
                status: 'JUSTIFIED_ABSENCE',
                justificationReason: reason,
                justificationDocument: docName || 'atestado_justificativo.pdf',
              };
            }
            return log;
          }),
        }));
      },

      toggleCardPrinted: (teacherId) => {
        set((state) => ({
          credentials: state.credentials.map((c) =>
            c.teacherId === teacherId ? { ...c, isCardPrinted: !c.isCardPrinted } : c
          ),
        }));
      },

      getMetrics: () => {
        const { attendanceLogs, credentials } = get();
        const today = new Date().toISOString().slice(0, 10);
        const todayLogs = attendanceLogs.filter((l) => l.date === today);

        const totalTeachers = credentials.length;
        const presentToday = todayLogs.filter((l) => l.status === 'PRESENT' || l.status === 'LATE').length;
        const absentToday = totalTeachers - presentToday;
        const lateArrivalsToday = todayLogs.filter((l) => l.status === 'LATE').length;
        
        const punctualityRatePercentage = presentToday > 0 
          ? Math.round(((presentToday - lateArrivalsToday) / presentToday) * 100) 
          : 100;

        return {
          totalTeachers,
          presentToday,
          absentToday,
          lateArrivalsToday,
          punctualityRatePercentage,
          classesFulfillmentPercentage: 96,
        };
      },
    }),
    {
      name: 'mindschool-teacher-attendance-storage',
    }
  )
);
