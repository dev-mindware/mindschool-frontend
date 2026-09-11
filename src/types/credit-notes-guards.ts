import { InvoiceDetails, ReceiptDetails } from "@/types/credit-note";

export function isInvoice(
  doc: InvoiceDetails | ReceiptDetails,
): doc is InvoiceDetails {
  return "invoiceNumber" in doc || "number" in doc;
}

export function isReceipt(
  doc: InvoiceDetails | ReceiptDetails,
): doc is ReceiptDetails {
  return "receiptNumber" in doc;
}
