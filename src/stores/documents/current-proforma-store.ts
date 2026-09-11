import { InvoiceResponse } from "@/types";
import { create } from "zustand";

interface ProformaStore {
  currentProforma: InvoiceResponse | undefined,
  setCurrentProforma: (proforma: InvoiceResponse) => void
}

export const currentProformaStore = create<ProformaStore>((set) => ({
  currentProforma: undefined,
  setCurrentProforma: (proforma) => set({ currentProforma: proforma})
}))

