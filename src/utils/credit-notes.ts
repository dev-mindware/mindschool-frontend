import { InvoiceDetails, ReceiptDetails } from "@/types/credit-note";
import { CreditNoteFormData } from "@/schemas";
import { isInvoice } from "@/types/credit-notes-guards";

// Dados genéricos do consumidor final (factura sem cliente registado).
// O NIF tem de ter 10 dígitos para passar a validação (pessoa colectiva);
// 9999999999 é a convenção de "consumidor final".
export const CONSUMIDOR_FINAL_CLIENT = {
  id: "",
  name: "Consumidor Final",
  phone: "999999999",
  email: "consumidor@gmail.com",
  address: "Não aplicável",
  taxNumber: "9999999999",
};

export function mapDocumentToCreditNoteDefaults(
  doc: InvoiceDetails | ReceiptDetails,
): CreditNoteFormData {
  if (isInvoice(doc)) {
    const defaultInvoiceBody = {
      // Cliente registado da factura ou, na sua ausência, o consumidor final.
      client: doc.client
        ? {
            id: doc.client.id || "",
            name: doc.client.name || "",
            phone: (doc.client as any).phone || "",
            email: (doc.client as any).email || "",
            address: (doc.client as any).address || "",
            taxNumber: (doc.client as any).taxNumber || "",
          }
        : { ...CONSUMIDOR_FINAL_CLIENT },
      items: doc.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.unitPrice,
        type: "PRODUCT" as const, // default
        // Taxa de imposto por item (em %), quando o backend a devolver — usada
        // para o cálculo separado por taxa (art. 10.º n.º 2 do D.P. 71/25).
        tax: (item as any).tax != null ? Number((item as any).tax) : undefined,
        taxId: (item as any).taxId ?? undefined,
      })),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: doc.dueDate ? doc.dueDate.split("T")[0] : undefined,
      subtotal: doc.subtotal,
      taxAmount: doc.taxAmount,
      discountAmount: doc.discountAmount,
      total: doc.total ?? doc.totalAmount ?? 0,
      notes: "",
    };

    return {
      reason: "CORRECTION",
      notes: "",
      managerBarcode: "",
      invoiceBody: defaultInvoiceBody,
      creditNote: {
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        total: 0,
        items: [],
      },
    };
  }

  return {
    reason: "ANNULMENT",
    notes: "",
    managerBarcode: "",
  };
}
