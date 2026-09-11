import { useMutation } from "@tanstack/react-query";
import { downloadPublicDocument } from "@/services/document-verification-service";
import { triggerBrowserDownload } from "@/utils/donwload.file";

type DownloadPayload = {
  token: string;
  filename: string;
};

export function usePublicDocumentDownload() {
  return useMutation({
    mutationFn: async ({ token, filename }: DownloadPayload) => {
      const response = await downloadPublicDocument(token);
      triggerBrowserDownload(response, filename);
    },
  });
}
