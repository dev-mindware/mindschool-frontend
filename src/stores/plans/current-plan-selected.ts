import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Plan } from "@/types";

interface PlanStore {
  currentPlanSelected: Plan | null;
  setCurrentPlanSelected: (plan: Plan | null) => void;
}

export const useCurrentPlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      currentPlanSelected: null,
      setCurrentPlanSelected: (plan) => set({ currentPlanSelected: plan }),
    }),
    {
      name: "MGEST-PLAN-STORE",
    },
  ),
);
