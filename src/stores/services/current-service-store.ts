import { ItemResponse as Service } from "@/types";
import { create } from "zustand";

interface ServiceStore {
  currentService: Service | undefined,
  setCurrentService: (service: Service) => void
}

export const currentServiceStore = create<ServiceStore>((set) => ({
  currentService: undefined,
  setCurrentService: (service) => set({ currentService: service})
}))

