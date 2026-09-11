import { InvoiceResponse } from "@/types";
import { InvoiceDetails } from "@/types/credit-note";
import { create } from "zustand";

interface InvoiceStore {
  currentInvoice: InvoiceResponse | undefined,
  setCurrentInvoice: (invoice: InvoiceResponse) => void
}

export const currentInvoiceStore = create<InvoiceStore>((set) => ({
  currentInvoice: undefined,
  setCurrentInvoice: (invoice) => set({ currentInvoice: invoice})
}))

