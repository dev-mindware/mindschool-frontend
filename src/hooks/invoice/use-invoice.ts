import { SucessMessage } from "@/utils/messages";
import { invoiceService } from "@/services/invoice-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditNoteFormData } from "@/schemas";
import { ReceiptData } from "@/types/receipt";
import { DownloadType, InvoicePayload } from "@/types";
import { triggerBrowserDownload } from "@/utils/donwload.file";

type DownloadInvoiceProps = {
  id: string;
  type: DownloadType;
  filename: string;
};

export function useGenerateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReceiptData) => invoiceService.generateReceipt(data),
    onSuccess: () => {
      SucessMessage("Recibo gerado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["invoice-receipt"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-normal"] });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.cancelInvoice(id),
    onSuccess: () => {
      SucessMessage("Factura cancelada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["invoice-normal"] });
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvoicePayload) => invoiceService.createInvoice(data),
    onSuccess: (response) => {
      SucessMessage("Factura criada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["invoice-normal"] });
      return response.data;
    },
  });
}

export function useCreateCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreditNoteFormData }) =>
      invoiceService.createCreditNote(id, data),
    onSuccess: () => {
      SucessMessage("Nota de crédito criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["invoice-normal"] });
    },
  });
}

export function useAnnulationNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
      notes,
      managerBarcode,
    }: {
      id: string;
      reason: string;
      notes: string;
      managerBarcode?: string;
    }) => invoiceService.annulationNote(id, reason, notes, managerBarcode),
    onSuccess: () => {
      SucessMessage("Documento anulado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["invoice-normal"] });
    },
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async ({ id, type, filename }: DownloadInvoiceProps) => {
      const response = await invoiceService.downloadInvoice(id, type);
      triggerBrowserDownload(response, `${filename}.${type}`);
    },
    onSuccess: () => {
      SucessMessage("Documento baixado com sucesso!");
    },
  });
}
