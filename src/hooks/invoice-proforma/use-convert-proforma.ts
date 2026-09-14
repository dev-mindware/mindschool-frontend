import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceReceiptService } from "@/services";
import { InvoiceResponse, InvoiceReceiptPayload } from "@/types";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

type ConversionType = "invoice-receipt";

function mapItems(
  items: InvoiceResponse["items"],
  defaultType: "PRODUCT" | "SERVICE" = "PRODUCT",
): InvoiceReceiptPayload["items"] {
  return items.map((item) => {
    const itemPrice = Number(item.unitPrice ?? item.price ?? 0);
    const taxId = item.taxId || item.item?.taxId || undefined;

    if (item.itemsId) {
      return {
        id: item.itemsId,
        quantity: item.quantity,
        price: itemPrice,
        ...(taxId && { taxId }),
      } as any;
    }
    return {
      name: item.name,
      price: itemPrice,
      quantity: item.quantity,
      type: (item.item?.type as "PRODUCT" | "SERVICE") || defaultType,
      ...(taxId && { taxId }),
    };
  });
}

async function createDocument(proforma: InvoiceResponse) {
  const issueDate = new Date().toISOString();
  const client = proforma.client?.id
    ? { id: proforma.client.id }
    : {
        name: proforma.client?.name ?? "",
        phone: proforma.client?.phone ?? undefined,
        address: proforma.client?.address ?? undefined,
        email: proforma.client?.email ?? undefined,
      };

  const total = Number(proforma.total);
  const taxAmount = Number(proforma.taxAmount || 0);
  const discountAmount = Number(proforma.discountAmount || 0);
  const retentionAmount = Number((proforma as any).retentionAmount || 0);

  const subtotal = Number(
    proforma.subtotal ?? (total - taxAmount + discountAmount + retentionAmount)
  );

  const basePayload: InvoiceReceiptPayload = {
    issueDate,
    client,
    items: mapItems(proforma.items),
    subtotal: subtotal,
    total: total,
    taxAmount: taxAmount,
    discountAmount: discountAmount,
    retentionAmount: retentionAmount,
    storeId: proforma.storeId ?? undefined,
  };

  return invoiceReceiptService.createInvoiceReceipt(basePayload);
}

export function useConvertProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proforma,
    }: {
      proforma: InvoiceResponse;
      type?: ConversionType;
    }) => {
      const res = await createDocument(proforma);
      const id = res.data?.id ?? res.data?.data?.id;
      return { id, type: "invoice-receipt" as const };
    },
    onSuccess: (result) => {
      SucessMessage("Proforma convertida em Factura-recibo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["invoice-proforma"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-receipt"] });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Erro ao converter proforma";
      ErrorMessage(msg);
    },
  });
}
