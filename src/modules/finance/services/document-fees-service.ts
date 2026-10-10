import api from "@/services/api";
import { patchSettings, readRawSettings } from "@/services/school-settings-service";
import type { RequestType } from "@/services/secretary-requests-service";

export type DocumentFees = Partial<Record<RequestType, string>>;

export const documentFeesService = {
  /** Escola: tabela completa (inclui tipos gratuitos como ausentes). */
  read: async (): Promise<DocumentFees> => {
    const finance = (await readRawSettings())["finance"] as { document_fees?: DocumentFees } | undefined;
    return finance?.document_fees ?? {};
  },
  /** Grava a tabela inteira (valor 0 = gratuito). */
  save: (fees: Record<RequestType, number>) =>
    patchSettings({ finance: { document_fees: Object.fromEntries(Object.entries(fees).map(([k, v]) => [k, v.toFixed(2)])) } }),

  /** Portal: so os tipos com preço. */
  portal: async (): Promise<{ currency: string; fees: DocumentFees }> => (await api.get<{ currency: string; fees: DocumentFees }>("/s/portal/requests/fees")).data,
};
