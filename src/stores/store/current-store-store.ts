import { StoreResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrentStoreState {
  currentStore: StoreResponse | undefined;
  setCurrentStore: (store: StoreResponse | undefined) => void;
}

const DEV_DEFAULT_STORE: StoreResponse | undefined =
  process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
    ? ({
        id: "store-1",
        name: "Campus Central",
        address: "Luanda, Angola",
        phone: "923000000",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)
    : undefined;

export const currentStoreStore = create<CurrentStoreState>()(
  persist(
    (set) => ({
      currentStore: DEV_DEFAULT_STORE,
      setCurrentStore: (store) => set({ currentStore: store }),
    }),
    {
      name: "current-store",
    },
  ),
);
