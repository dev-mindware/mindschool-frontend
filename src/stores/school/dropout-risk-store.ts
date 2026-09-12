import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  DropoutRiskAlert, 
  DropoutMetrics, 
  RiskLevel, 
  AlertStatus, 
  ActionType 
} from '@/types/dropout-risk';

interface DropoutRiskState {
  alerts: DropoutRiskAlert[];
  isLoading: boolean;
  selectedAlertId: string | null;
  filterRiskLevel: RiskLevel | 'ALL';
  filterStatus: AlertStatus | 'ALL';
  searchQuery: string;

  // Actions
  selectAlert: (id: string | null) => void;
  setRiskFilter: (level: RiskLevel | 'ALL') => void;
  setStatusFilter: (status: AlertStatus | 'ALL') => void;
  setSearchQuery: (query: string) => void;
  addInterventionAction: (
    alertId: string, 
    actionData: { 
      actionType: ActionType; 
      title: string; 
      notes: string; 
      recordedBy: string; 
      nextFollowUpDate?: string; 
      newStatus?: AlertStatus;
    }
  ) => void;
  updateAlertStatus: (alertId: string, newStatus: AlertStatus, note?: string) => void;
  getMetrics: () => DropoutMetrics;
}

const initialAlerts: DropoutRiskAlert[] = [
  {
    id: 'risk-001',
    studentId: 'std-luanda-004',
    studentName: 'Mauro Sebastião Afonso',
    studentNumber: 'MS-2026/089',
    classId: 'cls-8a',
    className: '8ª Classe - Turma A (Manhã)',
    cycle: 'I_CICLO',
    guardianName: 'Dr. Sebastião Afonso',
    guardianPhone: '+244 923 112 233',
    riskLevel: 'HIGH',
    compositeRiskScore: 88,
    signals: {
      consecutiveAbsences: 9,
      absencePercentage: 24.5,
      gradeDropSubjects: ['Matemática', 'Física', 'Língua Portuguesa'],
      currentAverage: 7.4,
      failingSubjectsCount: 4,
      tuitionOverdueMonths: 2,
    },
    status: 'OPEN',
    openedAt: '2026-09-02',
    actionsHistory: [
      {
        id: 'act-001',
        actionType: 'GUARDIAN_CONTACT',
        title: 'Tentativa de contacto telefónico',
        notes: 'Ligação não atendida pelo encarregado. Enviada mensagem formal por WhatsApp solicitando comparência à Direcção Pedagógica.',
        recordedBy: 'Prof.ª Teresa Gonçalves (Coord. Pedagógica)',
        recordedAt: '2026-09-04 10:15',
        nextFollowUpDate: '2026-09-12',
      },
    ],
  },
  {
    id: 'risk-002',
    studentId: 'std-luanda-012',
    studentName: 'Esperança Neves Kiala',
    studentNumber: 'MS-2026/114',
    classId: 'cls-9b',
    className: '9ª Classe - Turma B (Tarde)',
    cycle: 'I_CICLO',
    guardianName: 'Eng.ª Neves Kiala',
    guardianPhone: '+244 931 445 566',
    riskLevel: 'HIGH',
    compositeRiskScore: 82,
    signals: {
      consecutiveAbsences: 7,
      absencePercentage: 18.0,
      gradeDropSubjects: ['Química', 'Matemática'],
      currentAverage: 8.1,
      failingSubjectsCount: 3,
      tuitionOverdueMonths: 1,
    },
    status: 'IN_PROGRESS',
    openedAt: '2026-08-28',
    lastActionAt: '2026-09-08',
    assignedToPedagogue: 'Prof. Adão Miranda',
    actionsHistory: [
      {
        id: 'act-002',
        actionType: 'PEDAGOGIC_MEETING',
        title: 'Reunião Presencial com Encarregada',
        notes: 'Encarregada informou sobre problemas de transporte na rota Viana-Kilamba e período de convalescença da aluna. Acordado plano de reforço.',
        recordedBy: 'Prof. Adão Miranda',
        recordedAt: '2026-09-08 14:30',
        nextFollowUpDate: '2026-09-18',
      },
      {
        id: 'act-003',
        actionType: 'RECOVERY_PLAN',
        title: 'Atribuição de Apoio Pedagógico em Matemática',
        notes: 'Aluna inscrita nas aulas de apoio dos sábados de manhã das 08h30 às 10h30.',
        recordedBy: 'Prof. Adão Miranda',
        recordedAt: '2026-09-09 09:00',
        nextFollowUpDate: '2026-09-25',
      },
    ],
  },
  {
    id: 'risk-003',
    studentId: 'std-luanda-023',
    studentName: 'Domingos Mateus Galiano',
    studentNumber: 'MS-2026/045',
    classId: 'cls-7a',
    className: '7ª Classe - Turma A (Manhã)',
    cycle: 'I_CICLO',
    guardianName: 'Sr. Mateus Galiano',
    guardianPhone: '+244 944 889 900',
    riskLevel: 'MODERATE',
    compositeRiskScore: 58,
    signals: {
      consecutiveAbsences: 4,
      absencePercentage: 11.2,
      gradeDropSubjects: ['Língua Portuguesa', 'História'],
      currentAverage: 9.3,
      failingSubjectsCount: 2,
      tuitionOverdueMonths: 0,
    },
    status: 'IN_PROGRESS',
    openedAt: '2026-09-05',
    lastActionAt: '2026-09-09',
    actionsHistory: [
      {
        id: 'act-004',
        actionType: 'TUTORING_ASSIGNED',
        title: 'Sessão com Diretor de Turma',
        notes: 'Aluno com dificuldades de adaptação ao 1º ciclo. Diretor de turma acordou acompanhamento semanal dos cadernos.',
        recordedBy: 'Prof. Henrique Dala',
        recordedAt: '2026-09-09 11:45',
        nextFollowUpDate: '2026-09-20',
      },
    ],
  },
  {
    id: 'risk-004',
    studentId: 'std-luanda-034',
    studentName: 'Yola Conceição Ferreira',
    studentNumber: 'MS-2026/077',
    classId: 'cls-6b',
    className: '6ª Classe - Turma B (Tarde)',
    cycle: 'PRIMARIO',
    guardianName: 'D. Conceição Ferreira',
    guardianPhone: '+244 922 667 788',
    riskLevel: 'MODERATE',
    compositeRiskScore: 52,
    signals: {
      consecutiveAbsences: 3,
      absencePercentage: 8.5,
      gradeDropSubjects: ['Ciências da Natureza'],
      currentAverage: 9.8,
      failingSubjectsCount: 1,
      tuitionOverdueMonths: 0,
    },
    status: 'RESOLVED',
    openedAt: '2026-08-15',
    lastActionAt: '2026-09-01',
    actionsHistory: [
      {
        id: 'act-005',
        actionType: 'GUARDIAN_CONTACT',
        title: 'Contacto de Alinhamento',
        notes: 'Mãe confirmou que faltas deveram-se a consulta médica especializada comprovada por atestado.',
        recordedBy: 'Secretaria Escolar',
        recordedAt: '2026-08-20 12:00',
      },
      {
        id: 'act-006',
        actionType: 'RECOVERY_PLAN',
        title: 'Provas em atraso realizadas',
        notes: 'Aluna realizou as avaliações com nota 14 valores em Ciências. Situação regularizada.',
        recordedBy: 'Prof.ª Isabel Santos',
        recordedAt: '2026-09-01 16:00',
      },
    ],
  },
  {
    id: 'risk-005',
    studentId: 'std-luanda-049',
    studentName: 'Bruno Miguel de Oliveira',
    studentNumber: 'MS-2026/131',
    classId: 'cls-11a',
    className: '11ª Classe - CFB (Manhã)',
    cycle: 'II_CICLO',
    guardianName: 'Eng. Miguel de Oliveira',
    guardianPhone: '+244 939 778 899',
    riskLevel: 'LOW',
    compositeRiskScore: 28,
    signals: {
      consecutiveAbsences: 1,
      absencePercentage: 4.1,
      gradeDropSubjects: [],
      currentAverage: 12.8,
      failingSubjectsCount: 0,
      tuitionOverdueMonths: 0,
    },
    status: 'RESOLVED',
    openedAt: '2026-08-10',
    actionsHistory: [],
  },
];

export const useDropoutRiskStore = create<DropoutRiskState>()(
  persist(
    (set, get) => ({
      alerts: initialAlerts,
      isLoading: false,
      selectedAlertId: null,
      filterRiskLevel: 'ALL',
      filterStatus: 'ALL',
      searchQuery: '',

      selectAlert: (id) => set({ selectedAlertId: id }),

      setRiskFilter: (level) => set({ filterRiskLevel: level }),

      setStatusFilter: (status) => set({ filterStatus: status }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      addInterventionAction: (alertId, actionData) => {
        const now = new Date();
        const dateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        set((state) => ({
          alerts: state.alerts.map((alert) => {
            if (alert.id !== alertId) return alert;

            const newAction: DropoutRiskAlert['actionsHistory'][0] = {
              id: `act-${Date.now()}`,
              actionType: actionData.actionType,
              title: actionData.title,
              notes: actionData.notes,
              recordedBy: actionData.recordedBy,
              recordedAt: dateStr,
              nextFollowUpDate: actionData.nextFollowUpDate,
            };

            const updatedStatus = actionData.newStatus || (alert.status === 'OPEN' ? 'IN_PROGRESS' : alert.status);

            return {
              ...alert,
              status: updatedStatus,
              lastActionAt: dateStr,
              actionsHistory: [newAction, ...alert.actionsHistory],
            };
          }),
        }));
      },

      updateAlertStatus: (alertId, newStatus, note) => {
        const now = new Date();
        const dateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        set((state) => ({
          alerts: state.alerts.map((alert) => {
            if (alert.id !== alertId) return alert;

            let updatedHistory = [...alert.actionsHistory];
            if (note) {
              updatedHistory.unshift({
                id: `act-${Date.now()}`,
                actionType: 'PEDAGOGIC_MEETING',
                title: `Alteração de Estado para ${newStatus}`,
                notes: note,
                recordedBy: 'Direcção Pedagógica',
                recordedAt: dateStr,
              });
            }

            return {
              ...alert,
              status: newStatus,
              lastActionAt: dateStr,
              actionsHistory: updatedHistory,
            };
          }),
        }));
      },

      getMetrics: () => {
        const { alerts } = get();
        const totalMonitored = alerts.length;
        const highRiskCount = alerts.filter((a) => a.riskLevel === 'HIGH' && a.status !== 'RESOLVED').length;
        const moderateRiskCount = alerts.filter((a) => a.riskLevel === 'MODERATE' && a.status !== 'RESOLVED').length;
        const lowRiskCount = alerts.filter((a) => a.riskLevel === 'LOW' || a.status === 'RESOLVED').length;
        const activeInterventionsCount = alerts.filter((a) => a.status === 'IN_PROGRESS').length;
        const resolvedCasesCount = alerts.filter((a) => a.status === 'RESOLVED').length;

        const totalActiveCases = highRiskCount + moderateRiskCount + resolvedCasesCount;
        const retentionRatePercentage = totalActiveCases > 0 
          ? Math.round((resolvedCasesCount / totalActiveCases) * 100)
          : 94;

        return {
          totalMonitored,
          highRiskCount,
          moderateRiskCount,
          lowRiskCount,
          activeInterventionsCount,
          resolvedCasesCount,
          retentionRatePercentage,
        };
      },
    }),
    {
      name: 'mindschool-dropout-risk-storage',
    }
  )
);
