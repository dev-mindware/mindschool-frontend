import api from "./api";
import {
  OfficialDocumentItem,
  OfficialDocumentType,
  DocumentMetrics,
  SecretaryRequest,
} from "@/types";

export const certificatesService = {
  // Documentos Oficiais (Certificados, Declarações)
  getOfficialDocuments: async (params?: {
    type?: OfficialDocumentType;
    studentId?: string;
    search?: string;
  }): Promise<OfficialDocumentItem[]> => {
    const response = await api.get<OfficialDocumentItem[]>("/certificates/documents", { params });
    return response.data;
  },

  issueDocument: async (
    data: Partial<OfficialDocumentItem>
  ): Promise<OfficialDocumentItem> => {
    const response = await api.post<OfficialDocumentItem>("/certificates/documents", data);
    return response.data;
  },

  markAsDelivered: async (documentId: string): Promise<OfficialDocumentItem> => {
    const response = await api.patch<OfficialDocumentItem>(
      `/certificates/documents/${documentId}/deliver`
    );
    return response.data;
  },

  verifyDocumentByCode: async (
    verificationCode: string
  ): Promise<OfficialDocumentItem> => {
    const response = await api.get<OfficialDocumentItem>(
      `/certificates/verify/${verificationCode}`
    );
    return response.data;
  },

  getMetrics: async (): Promise<DocumentMetrics> => {
    const response = await api.get<DocumentMetrics>("/certificates/metrics");
    return response.data;
  },

  // Pedidos de Secretaria & Protocolo
  getSecretaryRequests: async (params?: {
    status?: string;
    search?: string;
  }): Promise<SecretaryRequest[]> => {
    const response = await api.get<SecretaryRequest[]>("/secretary/requests", { params });
    return response.data;
  },

  createSecretaryRequest: async (
    data: Partial<SecretaryRequest>
  ): Promise<SecretaryRequest> => {
    const response = await api.post<SecretaryRequest>("/secretary/requests", data);
    return response.data;
  },

  updateRequestStatus: async (
    id: string,
    status: SecretaryRequest["status"],
    notes?: string
  ): Promise<SecretaryRequest> => {
    const response = await api.patch<SecretaryRequest>(`/secretary/requests/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },
};
