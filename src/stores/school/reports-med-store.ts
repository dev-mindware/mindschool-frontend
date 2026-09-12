import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  MedStatisticalReport, 
  MedSnapshotCut, 
  MedMetrics,
  ClassStatisticalRow 
} from '@/types/reports-med';

interface ReportsMedState {
  reports: MedStatisticalReport[];
  selectedReportId: string | null;
  filterCut: MedSnapshotCut | 'ALL';
  searchQuery: string;

  // Actions
  selectReport: (id: string | null) => void;
  setCutFilter: (cut: MedSnapshotCut | 'ALL') => void;
  setSearchQuery: (query: string) => void;
  generateSnapshot: (cut: MedSnapshotCut, academicYear?: string) => MedStatisticalReport;
  markAsSubmittedToMED: (reportId: string, protocolNumber: string) => void;
  getMetrics: () => MedMetrics;
}

const mockRowsTerm1: ClassStatisticalRow[] = [
  {
    id: 'row-7a',
    classLevel: '7ª Classe',
    sectionName: 'Turma A',
    shift: 'MANHÃ',
    cycle: 'I_CICLO',
    enrolledStudents: { male: 22, female: 23, total: 45 },
    evaluatedStudents: { male: 22, female: 23, total: 45 },
    passedStudents: { male: 19, female: 21, total: 40 },
    failedStudents: { male: 3, female: 2, total: 5 },
    dropoutStudents: { male: 0, female: 0, total: 0 },
    gradeDistribution: {
      veryGood: { male: 3, female: 5, total: 8 },
      good: { male: 9, female: 10, total: 19 },
      sufficient: { male: 7, female: 6, total: 13 },
      mediocre: { male: 2, female: 2, total: 4 },
      poor: { male: 1, female: 0, total: 1 },
    },
    passRatePercentage: 88.9,
  },
  {
    id: 'row-7b',
    classLevel: '7ª Classe',
    sectionName: 'Turma B',
    shift: 'TARDE',
    cycle: 'I_CICLO',
    enrolledStudents: { male: 24, female: 20, total: 44 },
    evaluatedStudents: { male: 23, female: 20, total: 43 },
    passedStudents: { male: 18, female: 19, total: 37 },
    failedStudents: { male: 5, female: 1, total: 6 },
    dropoutStudents: { male: 1, female: 0, total: 1 },
    gradeDistribution: {
      veryGood: { male: 2, female: 4, total: 6 },
      good: { male: 8, female: 9, total: 17 },
      sufficient: { male: 8, female: 6, total: 14 },
      mediocre: { male: 4, female: 1, total: 5 },
      poor: { male: 1, female: 0, total: 1 },
    },
    passRatePercentage: 86.0,
  },
  {
    id: 'row-8a',
    classLevel: '8ª Classe',
    sectionName: 'Turma A',
    shift: 'MANHÃ',
    cycle: 'I_CICLO',
    enrolledStudents: { male: 21, female: 21, total: 42 },
    evaluatedStudents: { male: 21, female: 21, total: 42 },
    passedStudents: { male: 19, female: 20, total: 39 },
    failedStudents: { male: 2, female: 1, total: 3 },
    dropoutStudents: { male: 0, female: 0, total: 0 },
    gradeDistribution: {
      veryGood: { male: 4, female: 6, total: 10 },
      good: { male: 10, female: 9, total: 19 },
      sufficient: { male: 5, female: 5, total: 10 },
      mediocre: { male: 2, female: 1, total: 3 },
      poor: { male: 0, female: 0, total: 0 },
    },
    passRatePercentage: 92.9,
  },
  {
    id: 'row-9a',
    classLevel: '9ª Classe',
    sectionName: 'Turma A',
    shift: 'MANHÃ',
    cycle: 'I_CICLO',
    enrolledStudents: { male: 20, female: 25, total: 45 },
    evaluatedStudents: { male: 20, female: 25, total: 45 },
    passedStudents: { male: 18, female: 23, total: 41 },
    failedStudents: { male: 2, female: 2, total: 4 },
    dropoutStudents: { male: 0, female: 0, total: 0 },
    gradeDistribution: {
      veryGood: { male: 5, female: 7, total: 12 },
      good: { male: 8, female: 11, total: 19 },
      sufficient: { male: 5, female: 5, total: 10 },
      mediocre: { male: 1, female: 2, total: 3 },
      poor: { male: 1, female: 0, total: 1 },
    },
    passRatePercentage: 91.1,
  },
  {
    id: 'row-10a',
    classLevel: '10ª Classe',
    sectionName: 'CFB Turma A',
    shift: 'MANHÃ',
    cycle: 'II_CICLO',
    enrolledStudents: { male: 18, female: 22, total: 40 },
    evaluatedStudents: { male: 18, female: 22, total: 40 },
    passedStudents: { male: 15, female: 20, total: 35 },
    failedStudents: { male: 3, female: 2, total: 5 },
    dropoutStudents: { male: 0, female: 0, total: 0 },
    gradeDistribution: {
      veryGood: { male: 3, female: 5, total: 8 },
      good: { male: 7, female: 9, total: 16 },
      sufficient: { male: 5, female: 6, total: 11 },
      mediocre: { male: 2, female: 2, total: 4 },
      poor: { male: 1, female: 0, total: 1 },
    },
    passRatePercentage: 87.5,
  },
];

const initialReports: MedStatisticalReport[] = [
  {
    id: 'med-rep-001',
    reportCode: 'MED-MAP-2026/01',
    schoolId: 'dev-school-1',
    schoolName: 'Complexo Escolar MindSchool',
    provincialDirectorate: 'Direcção Provincial da Educação de Luanda',
    municipalDirectorate: 'Repartição Municipal de Educação de Belas',
    academicYear: '2025/2026',
    snapshotCut: 'TERM_1_CLOSE',
    generatedAt: '2026-09-08 14:00',
    generatedBy: 'Director Pedagógico - Dr. Nelson Vunge',
    status: 'OFFICIALLY_SUBMITTED',
    submissionDate: '2026-09-10',
    submissionProtocolNumber: 'PROT-MED/DPE-LUANDA/2026/04882',
    totalStudents: { male: 105, female: 111, total: 216 },
    totalPassed: { male: 89, female: 104, total: 193 },
    totalFailed: { male: 16, female: 7, total: 23 },
    overallPassRate: 89.4,
    rows: mockRowsTerm1,
  },
  {
    id: 'med-rep-002',
    reportCode: 'MED-MAP-2025/03',
    schoolId: 'dev-school-1',
    schoolName: 'Complexo Escolar MindSchool',
    provincialDirectorate: 'Direcção Provincial da Educação de Luanda',
    municipalDirectorate: 'Repartição Municipal de Educação de Belas',
    academicYear: '2024/2025',
    snapshotCut: 'FINAL_YEAR',
    generatedAt: '2025-07-20 11:30',
    generatedBy: 'Secretaria Geral',
    status: 'OFFICIALLY_SUBMITTED',
    submissionDate: '2025-07-24',
    submissionProtocolNumber: 'PROT-MED/DPE-LUANDA/2025/11904',
    totalStudents: { male: 98, female: 102, total: 200 },
    totalPassed: { male: 88, female: 96, total: 184 },
    totalFailed: { male: 10, female: 6, total: 16 },
    overallPassRate: 92.0,
    rows: mockRowsTerm1,
  },
];

export const useReportsMedStore = create<ReportsMedState>()(
  persist(
    (set, get) => ({
      reports: initialReports,
      selectedReportId: null,
      filterCut: 'ALL',
      searchQuery: '',

      selectReport: (id) => set({ selectedReportId: id }),

      setCutFilter: (cut) => set({ filterCut: cut }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      generateSnapshot: (cut, academicYear = '2025/2026') => {
        const { reports } = get();
        const code = `MED-MAP-2026/${(reports.length + 1).toString().padStart(2, '0')}`;
        const now = `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const newReport: MedStatisticalReport = {
          id: `med-${Date.now()}`,
          reportCode: code,
          schoolId: 'dev-school-1',
          schoolName: 'Complexo Escolar MindSchool',
          provincialDirectorate: 'Direcção Provincial da Educação de Luanda',
          municipalDirectorate: 'Repartição Municipal de Educação de Belas',
          academicYear,
          snapshotCut: cut,
          generatedAt: now,
          generatedBy: 'Direcção Pedagógica Geral',
          status: 'DRAFT',
          totalStudents: { male: 105, female: 111, total: 216 },
          totalPassed: { male: 89, female: 104, total: 193 },
          totalFailed: { male: 16, female: 7, total: 23 },
          overallPassRate: 89.4,
          rows: mockRowsTerm1,
        };

        set({ reports: [newReport, ...reports] });
        return newReport;
      },

      markAsSubmittedToMED: (reportId, protocolNumber) => {
        const today = new Date().toISOString().slice(0, 10);
        set((state) => ({
          reports: state.reports.map((rep) =>
            rep.id === reportId
              ? {
                  ...rep,
                  status: 'OFFICIALLY_SUBMITTED',
                  submissionDate: today,
                  submissionProtocolNumber: protocolNumber || `PROT-MED/DPE/${Date.now()}`,
                }
              : rep
          ),
        }));
      },

      getMetrics: () => {
        const { reports } = get();
        const totalSnapshots = reports.length;
        const officialSubmissionsCount = reports.filter((r) => r.status === 'OFFICIALLY_SUBMITTED').length;

        const latest = reports[0];
        const overallSuccessRatePercentage = latest ? latest.overallPassRate : 89.4;
        const femaleRatio = latest && latest.totalStudents.total > 0
          ? Math.round((latest.totalStudents.female / latest.totalStudents.total) * 100)
          : 51;

        return {
          totalSnapshots,
          officialSubmissionsCount,
          femaleStudentRatioPercentage: femaleRatio,
          overallSuccessRatePercentage,
          lastSnapshotDate: latest ? latest.generatedAt : 'Hoje',
        };
      },
    }),
    {
      name: 'mindschool-reports-med-storage',
    }
  )
);
