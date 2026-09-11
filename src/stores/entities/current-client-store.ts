import { ClientResponse } from "@/types";
import { create } from "zustand";

interface ClientStore {
  currentClient: ClientResponse | undefined,
  setCurrentClient: (client: ClientResponse) => void
}

export const currentClientStore = create<ClientStore>((set) => ({
  currentClient: undefined,
  setCurrentClient: (client) => set({ currentClient: client})
}))

