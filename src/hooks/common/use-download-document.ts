import { DownloadType } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { triggerBrowserDownload } from "@/utils/donwload.file";
import { downloadDocument } from "@/services/download-invoice-service";
import type { DocumentType } from "@/types/documents";

type Payload = {
  id: string;
  documentType: DocumentType;
  format: DownloadType;
  filename: string;
};

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({
      id,
      documentType,
      format,
      filename,
    }: Payload) => {
      const response = await downloadDocument(id, documentType, format);
      triggerBrowserDownload(response, filename);
    },
  });
}
