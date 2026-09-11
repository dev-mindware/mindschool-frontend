import { create } from "zustand";
import { InvoiceReceiptPayload } from "@/types";

interface InvoiceReceiptStore {
  currentInvoiceReceipt: InvoiceReceiptPayload | undefined,
  setCurrentInvoiceReceipt: (invoiceReceipt: InvoiceReceiptPayload) => void
}

export const currentInvoiceReceiptStore = create<InvoiceReceiptStore>((set) => ({
  currentInvoiceReceipt: undefined,
  setCurrentInvoiceReceipt: (invoiceReceipt) => set({ currentInvoiceReceipt: invoiceReceipt})
}))