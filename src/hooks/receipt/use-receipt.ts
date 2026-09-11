import { SucessMessage } from "@/utils/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceReceiptService } from "@/services/invoice-receipt-service";
import { InvoiceReceiptPayload } from "@/types";

export function useCreateInvoiceReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvoiceReceiptPayload) =>
      invoiceReceiptService.createInvoiceReceipt(data),
    onSuccess: (response) => {
      SucessMessage("Factura-recibo criada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["invoice-receipt"] });
      return response.data;
    },
  });
}
