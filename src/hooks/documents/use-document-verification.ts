import { useQuery } from "@tanstack/react-query";
import { verifyDocument } from "@/services/document-verification-service";
import type { DocumentVerificationResponse } from "@/types/documents";

export function useDocumentVerification(token: string) {
  return useQuery<DocumentVerificationResponse>({
    queryKey: ["document-verification", token],
    queryFn: async () => {
      const response = await verifyDocument(token);
      return response.data;
    },
    enabled: !!token,
    retry: 1,
    staleTime: 300_000, // 5 minutes
  });
}
