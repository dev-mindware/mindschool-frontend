import { api } from "./api";
import type {
  AgtConfigStatus,
  AgtConsultResponse,
  AgtInvoiceListResponse,
  AgtSeries,
} from "@/types";
import type {
  RequestAgtSeriesFormData,
  ValidateAgtDocumentFormData,
} from "@/schemas/agt-schema";

export const agtService = {
  getStatus: async (): Promise<AgtConfigStatus> => {
    const response = await api.get<AgtConfigStatus>("/agt/config/status");
    return response.data;
  },

  updatePrivateKey: async (privateKey: string) => {
    const response = await api.post("/agt/config/private-key", { privateKey });
    return response.data;
  },

  getSeries: async (): Promise<AgtSeries[]> => {
    const response = await api.get<AgtSeries[]>("/agt/series");
    return response.data;
  },

  requestSeries: async (data: RequestAgtSeriesFormData) => {
    const response = await api.post("/agt/series/solicitar", {
      documentType: data.documentType,
      seriesYear: data.seriesYear,
      storeId: data.storeId || undefined,
      establishmentNumber: data.establishmentNumber || undefined,
    });
    return response.data;
  },

  listInvoices: async (params: {
    queryStartDate: string;
    queryEndDate: string;
    documentType?: string;
    page?: number;
    limit?: number;
  }): Promise<AgtInvoiceListResponse> => {
    const response = await api.get<AgtInvoiceListResponse>("/agt/invoices", {
      params,
    });
    return response.data;
  },

  consultInvoice: async (documentNo: string): Promise<AgtConsultResponse> => {
    const response = await api.get<AgtConsultResponse>("/agt/invoice", {
      params: { documentNo: documentNo.trim() },
    });
    return response.data;
  },


  validateDocument: async (data: ValidateAgtDocumentFormData) => {
    const response = await api.post("/agt/invoice/validate", data);
    return response.data;
  },

  submitDocument: async (
    id: string,
    type: "invoice" | "creditNote" = "invoice",
  ) => {
    const response = await api.post<{ message: string }>(
      `/agt/submit/${id}`,
      {},
      { params: { type } },
    );
    return response.data;
  },

  pollDocument: async (
    id: string,
    type: "invoice" | "creditNote" = "invoice",
  ) => {
    const response = await api.post<{ message: string }>(
      `/agt/poll/${id}`,
      {},
      { params: { type } },
    );
    return response.data;
  },


  getErrors: async (params?: {
    page?: number;
    limit?: number;
    invoiceId?: string;
    search?: string;
    origin?: string;
    severity?: string;
  }): Promise<import("@/types").AgtErrorsListResponse> => {
    const response = await api.get<import("@/types").AgtErrorsListResponse>(
      "/agt/errors",
      { params },
    );
    return response.data;
  },
};


