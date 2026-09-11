import { Bank } from "@/types";
import { create } from "zustand";

interface BankStore {
  currentBank: Bank | undefined;
  setCurrentBank: (bank: Bank | undefined) => void;
}

export const currentBankStore = create<BankStore>((set) => ({
  currentBank: undefined,
  setCurrentBank: (bank) => set({ currentBank: bank }),
}));
