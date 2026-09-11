import { api } from "./api";
import type { DownloadType, InvoicePayload } from "@/types";
import { CreditNoteFormData } from "@/schemas";
import { ReceiptData } from "@/types/receipt";

export const invoiceService = {
  createInvoice: (data: InvoicePayload) => api.post("/invoice/normal", data),

  downloadInvoice: (id: string, type: DownloadType) => {
    const endpointMap: Record<DownloadType, string> = {
      pdf: `/invoice/normal/${id}/download-pdf`,
      thermal: `/invoice/normal/${id}/download-thermal`,
    };

    return api.get(endpointMap[type], {
      responseType: "blob",
    });
  },

  generateReceipt: (data: ReceiptData) => api.post(`/invoice/receipt`, data),

  cancelInvoice: (id: string) => api.patch(`/invoice/normal/${id}/cancel`),

  createCreditNote: (id: string, data: CreditNoteFormData) =>
    api.post(`/credit-note/${id}/correction`, data),

  annulationNote: (
    id: string,
    reason: string,
    notes?: string,
    managerBarcode?: string,
  ) =>
    api.delete(`/credit-note/${id}/annulment`, {
      data: { reason, notes, managerBarcode },
    }),
};
