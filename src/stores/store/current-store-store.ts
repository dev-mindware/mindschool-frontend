import { StoreResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrentStoreState {
  currentStore: StoreResponse | undefined;
  setCurrentStore: (store: StoreResponse | undefined) => void;
}

export const currentStoreStore = create<CurrentStoreState>()(
  persist(
    (set) => ({
      currentStore: undefined,
      setCurrentStore: (store) => set({ currentStore: store }),
    }),
    {
      name: "current-store",
    },
  ),
);
