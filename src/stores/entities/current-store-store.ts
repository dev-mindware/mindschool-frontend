import { StoreResponse } from "@/types";
import { create } from "zustand";

interface StoreStore {
  currentStore: StoreResponse | undefined;
  setCurrentStore: (store: StoreResponse) => void;
}

export const currentStoreStore = create<StoreStore>((set) => ({
  currentStore: undefined,
  setCurrentStore: (store) => set({ currentStore: store }),
}));
