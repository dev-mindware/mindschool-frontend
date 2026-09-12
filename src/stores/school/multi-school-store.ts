import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SchoolUnitSummary, MultiSchoolMetrics } from '@/types/multi-school';

interface MultiSchoolState {
  units: SchoolUnitSummary[];
  selectedUnitId: string | null;
  searchQuery: string;

  // Actions
  selectUnit: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  getMetrics: () => MultiSchoolMetrics;
}

const initialUnits: SchoolUnitSummary[] = [
  {
    id: 'unit-01',
    name: 'Complexo Escolar MindSchool - Talatona (Sede)',
    code: 'MS-TALATONA',
    province: 'Luanda',
    municipality: 'Talatona',
    address: 'Via AL14, Bairro Talatona',
    directorName: 'Dr.ª Maria Antónia Bento',
    totalStudents: 1240,
    totalTeachers: 48,
    totalSections: 32,
    attendanceRatePercentage: 96.2,
    passRatePercentage: 91.5,
    dropoutRiskCount: 14,
    capacityUtilizationPercentage: 94.0,
    activeStatus: 'ACTIVE',
  },
  {
    id: 'unit-02',
    name: 'Colégio MindSchool - Centralidade do Kilamba',
    code: 'MS-KILAMBA',
    province: 'Luanda',
    municipality: 'Belas',
    address: 'Bloco B, Centralidade do Kilamba',
    directorName: 'Prof. Mateus Kapuka',
    totalStudents: 980,
    totalTeachers: 38,
    totalSections: 26,
    attendanceRatePercentage: 94.8,
    passRatePercentage: 88.2,
    dropoutRiskCount: 22,
    capacityUtilizationPercentage: 89.0,
    activeStatus: 'ACTIVE',
  },
  {
    id: 'unit-03',
    name: 'Colégio MindSchool - Maianga',
    code: 'MS-MAIANGA',
    province: 'Luanda',
    municipality: 'Luanda',
    address: 'Bairro Cassenda, Rua Comandante Gika',
    directorName: 'Prof.ª Teresa Gonçalves',
    totalStudents: 820,
    totalTeachers: 32,
    totalSections: 22,
    attendanceRatePercentage: 95.5,
    passRatePercentage: 90.0,
    dropoutRiskCount: 9,
    capacityUtilizationPercentage: 92.5,
    activeStatus: 'ACTIVE',
  },
];

export const useMultiSchoolStore = create<MultiSchoolState>()(
  persist(
    (set, get) => ({
      units: initialUnits,
      selectedUnitId: null,
      searchQuery: '',

      selectUnit: (id) => set({ selectedUnitId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      getMetrics: () => {
        const { units } = get();
        const totalUnits = units.length;
        const networkTotalStudents = units.reduce((acc, u) => acc + u.totalStudents, 0);
        const networkTotalTeachers = units.reduce((acc, u) => acc + u.totalTeachers, 0);
        
        const avgPassRate = Number(
          (units.reduce((acc, u) => acc + u.passRatePercentage, 0) / (totalUnits || 1)).toFixed(1)
        );

        const avgAttendance = Number(
          (units.reduce((acc, u) => acc + u.attendanceRatePercentage, 0) / (totalUnits || 1)).toFixed(1)
        );

        const totalHighRiskStudents = units.reduce((acc, u) => acc + u.dropoutRiskCount, 0);

        return {
          totalUnits,
          networkTotalStudents,
          networkTotalTeachers,
          averagePassRate: avgPassRate,
          averageAttendanceRate: avgAttendance,
          totalHighRiskStudents,
        };
      },
    }),
    {
      name: 'mindschool-multi-school-storage',
    }
  )
);
