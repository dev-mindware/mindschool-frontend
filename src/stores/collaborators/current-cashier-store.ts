import { CashierResponse } from "@/types";
import { create } from "zustand";

interface CashierStore {
  currentCashier: CashierResponse | undefined,
  setCurrentCashier: (cashier: CashierResponse) => void
}

export const currentCashierStore = create<CashierStore>((set) => ({
  currentCashier: undefined,
  setCurrentCashier: (cashier) => set({ currentCashier: cashier}) 
}))

