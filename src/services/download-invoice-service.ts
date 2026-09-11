import { api } from "./api";
import type { DownloadType } from "@/types";
import type { DocumentType } from "@/types/documents";

const DOCUMENT_BASE_PATH: Record<DocumentType, string> = {
  invoice: "/invoice/normal",
  proforma: "/invoice/proforma",
  receipt: "/invoice/receipt",
  "invoice-receipt": "/invoice/invoice-receipt",
  "credit-note": "/credit-note",
};

export async function downloadDocument(
  id: string,
  documentType: DocumentType,
  format: DownloadType
) {
  const basePath = DOCUMENT_BASE_PATH[documentType];

  return api.get(`${basePath}/${id}/download-${format}`, {
    responseType: "blob",
  });
}
