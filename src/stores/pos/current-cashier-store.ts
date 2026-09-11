import { create } from "zustand";
import { Cashier } from "@/types/cashier";

interface CurrentCashierState {
  currentCashier: any | null;
  setCurrentCashier: (cashier: any | null) => void;
}

export const useCurrentCashierStore = create<CurrentCashierState>((set) => ({
  currentCashier: null,
  setCurrentCashier: (cashier) => set({ currentCashier: cashier }),
}));
