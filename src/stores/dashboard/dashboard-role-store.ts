import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, DashboardPeriodFilter, AcademicCycle } from "@/types";

interface DashboardRoleState {
  activeRoleOverride: Role | null;
  selectedPeriod: DashboardPeriodFilter;
  selectedCycle: "ALL" | AcademicCycle;
  academicYear: string;
  
  // Actions
  setRoleOverride: (role: Role | null) => void;
  setSelectedPeriod: (period: DashboardPeriodFilter) => void;
  setSelectedCycle: (cycle: "ALL" | AcademicCycle) => void;
  setAcademicYear: (year: string) => void;
  resetRoleOverride: () => void;
}

export const useDashboardRoleStore = create<DashboardRoleState>()(
  persist(
    (set) => ({
      activeRoleOverride: null,
      selectedPeriod: "1_TRIMESTRE",
      selectedCycle: "ALL",
      academicYear: "2025/2026",

      setRoleOverride: (role) => set({ activeRoleOverride: role }),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setSelectedCycle: (cycle) => set({ selectedCycle: cycle }),
      setAcademicYear: (year) => set({ academicYear: year }),
      resetRoleOverride: () => set({ activeRoleOverride: null }),
    }),
    {
      name: "mindschool-dashboard-role-storage",
      partialize: (state) => ({
        activeRoleOverride: state.activeRoleOverride,
        selectedPeriod: state.selectedPeriod,
        selectedCycle: state.selectedCycle,
        academicYear: state.academicYear,
      }),
    }
  )
);
