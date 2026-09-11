import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceService, invoiceReceiptService } from "@/services";
import { InvoicePayload, InvoiceResponse } from "@/types";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

type ConversionType = "invoice" | "invoice-receipt";

function mapItems(
  items: InvoiceResponse["items"],
  defaultType: "PRODUCT" | "SERVICE" = "PRODUCT",
): InvoicePayload["items"] {
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

async function createDocument(type: ConversionType, proforma: InvoiceResponse) {
  const issueDate = new Date().toISOString();
  const client = proforma.client?.id
    ? { id: proforma.client.id }
    : {
        name: proforma.client?.name ?? "",
        phone: proforma.client?.phone ?? undefined,
        address: proforma.client?.address ?? undefined,
      };

  const total = Number(proforma.total);
  const taxAmount = Number(proforma.taxAmount || 0);
  const discountAmount = Number(proforma.discountAmount || 0);
  const retentionAmount = Number((proforma as any).retentionAmount || 0);

  // Calculate subtotal accurately if not explicitly present on the proforma object
  const subtotal = Number(
    proforma.subtotal ?? (total - taxAmount + discountAmount + retentionAmount)
  );

  const basePayload = {
    issueDate,
    client,
    items: mapItems(proforma.items),
    subtotal: subtotal,
    total: total,
    taxAmount: taxAmount,
    discountAmount: discountAmount,
    retentionAmount: retentionAmount,
    notes: proforma.notes || undefined,
  };

  if (type === "invoice") {
    return invoiceService.createInvoice({
      ...basePayload,
      dueDate: issueDate,
    });
  }

  return invoiceReceiptService.createInvoiceReceipt(basePayload);
}

export function useConvertProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proforma,
      type,
    }: {
      proforma: InvoiceResponse;
      type: ConversionType;
    }) => {
      const res = await createDocument(type, proforma);
      const id = res.data?.id ?? res.data?.data?.id;
      return { id, type };
    },
    onSuccess: (result, { type }) => {
      const label = type === "invoice" ? "Factura" : "Factura-recibo";
      SucessMessage(`Proforma convertida em ${label} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["invoice-proforma"] });
      queryClient.invalidateQueries({
        queryKey: [type === "invoice" ? "invoice" : "invoice-receipt"],
      });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Erro ao converter proforma";
      ErrorMessage(msg);
    },
  });
}
