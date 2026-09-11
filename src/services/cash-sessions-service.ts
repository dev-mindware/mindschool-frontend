import {
  CashSession,
  CashSessionRequestFilters,
  CashSessionRequest,
  AuthorizeOpeningPayload,
} from "@/types";
import { api } from "./api";

export const cashSessionsService = {
  getOpeningRequests: async (filters?: CashSessionRequestFilters) => {
    const params = new URLSearchParams();

    if (filters?.storeId) params.append("storeId", filters.storeId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.userId) params.append("userId", filters.userId);

    const { data } = await api.get<CashSessionRequest[]>(
      `/cash-sessions/opening-requests?${params.toString()}`,
    );
    return data;
  },

  authorizeOpening: async (data: AuthorizeOpeningPayload) => {
    const response = await api.post("/cash-sessions/opening-sessions", data);
    return response.data;
  },

  rejectOpeningRequest: async (requestId: string) => {
    const response = await api.post(
      `/cash-sessions/opening-requests/${requestId}/reject`,
    );
    return response.data;
  },

  getCurrentSession: async (id: string | undefined) => {
    const { data } = await api.get<CashSession>("/cash-sessions/current", {
      params: id ? { storeId: id } : undefined,
    });
    return data;
  },

  getCashSessions: async (params: any) => {
    const { data } = await api.get("/cash-sessions", { params });
    return data;
  },

  requestOpening: async (data: { storeId?: string; message: string }) => {
    const response = await api.post("/cash-sessions/request-opening", data);
    return response.data;
  },

  registerExpense: async (data: {
    description: string;
    amount: number;
    cashSessionId: string;
  }) => {
    const response = await api.post("/cash-sessions/expenses", data);
    return response.data;
  },

  closeSession: async (
    id: string,
    data: { closingCash: number; totalSales: number; notes: string },
  ) => {
    const response = await api.patch(`/cash-sessions/${id}/close`, data);
    return response.data;
  },

  updateSession: async (id: string, data: any) => {
    const response = await api.put(`/cash-sessions/${id}`, data);
    return response.data;
  },

  deleteSession: async (id: string) => {
    const response = await api.delete(`/cash-sessions/${id}`);
    return response.data;
  },
};
