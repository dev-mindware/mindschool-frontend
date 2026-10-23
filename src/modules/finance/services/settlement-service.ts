import api from "@/services/api";
import { fetchAllPages } from "@/services/api-pagination";
import { settlementBody, type ApiCustomerOptions, type ApiFiscalDocumentRow, type ApiSettlement, type SettlementInput } from "@/modules/finance/settlement-model";

export * from "@/modules/finance/settlement-model";

const newKey = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `liq-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const settlementService = {
  /**
   * Marcar como pago (uma liquidação, uma factura-recibo). A chave de idempotência é do pedido: repetir o mesmo clique
   * não regista duas vezes (o chamador reutiliza a chave enquanto o pedido é o mesmo).
   */
  create: async (v: SettlementInput, key: string = newKey()): Promise<ApiSettlement> =>
    (await api.post<ApiSettlement>("/s/settlements", settlementBody(v), { headers: { "Idempotency-Key": key } })).data,

  customerOptions: async (studentId: string): Promise<ApiCustomerOptions> =>
    (await api.get<ApiCustomerOptions>("/s/settlements/customer-options", { params: { student_id: studentId } })).data,

  /** Consulta de NIF (o servidor consulta o MindGest; o browser nunca fala com ele). */
  lookupNif: async (nif: string): Promise<{ nif: string; name: string }> =>
    (await api.post<{ nif: string; name: string }>("/s/taxpayers/lookup", { nif })).data,

  saveGuardianNif: async (guardianId: string, nif: string | null): Promise<void> => {
    await api.patch(`/s/guardians/${guardianId}`, { nif });
  },
  saveStudentNif: async (studentId: string, nif: string | null): Promise<void> => {
    await api.patch(`/s/students/${studentId}`, { nif });
  },

  documents: (): Promise<ApiFiscalDocumentRow[]> => fetchAllPages<ApiFiscalDocumentRow>("/s/fiscal-documents"),
  reprocess: async (id: string): Promise<ApiFiscalDocumentRow> => (await api.post<ApiFiscalDocumentRow>(`/s/fiscal-documents/${id}/reprocess`)).data,
  pdfBlob: async (id: string): Promise<Blob> => (await api.get<Blob>(`/s/fiscal-documents/${id}/pdf`, { responseType: "blob" })).data,
};

