import { ManagerResponse } from "@/types";
import { create } from "zustand";

interface ManagerStore {
  currentManager: ManagerResponse | undefined,
  setCurrentManager: (manager: ManagerResponse) => void
}

export const currentManagerStore = create<ManagerStore>((set) => ({
  currentManager: undefined,
  setCurrentManager: (manager) => set({ currentManager: manager})
}))

