import { api } from "./api";
import type { DownloadType } from "@/types";
import { CreditNoteFormData } from "@/schemas";

export const invoiceService = {
  downloadInvoice: (id: string, type: DownloadType) => {
    const endpointMap: Record<DownloadType, string> = {
      pdf: `/invoice/invoice-receipt/${id}/download-pdf`,
      thermal: `/invoice/invoice-receipt/${id}/download-thermal`,
    };

    return api.get(endpointMap[type], {
      responseType: "blob",
    });
  },

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
