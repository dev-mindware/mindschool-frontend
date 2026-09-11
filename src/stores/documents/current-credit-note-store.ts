import { CreditNotesResponse } from "@/types/credit-note";
import { create } from "zustand";

interface InvoiceStore {
  currentCreditNote: CreditNotesResponse | undefined,
  setCurrentCreditNote: (invoice: CreditNotesResponse) => void
}

export const currentCreditNoteStore = create<InvoiceStore>((set) => ({
  currentCreditNote: undefined,
  setCurrentCreditNote: (invoice) => set({ currentCreditNote: invoice})
}))

