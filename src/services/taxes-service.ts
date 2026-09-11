import type { Tax, CreateTaxData } from "@/types";
import { api } from "./api";

export const taxesService = {
  get: async () => {
    const response = await api.get<Tax[]>("/taxes");
    return response.data;
  },

  create: async (data: CreateTaxData) => {
    const response = await api.post<Tax>("/taxes", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTaxData>) => {
    const response = await api.put<Tax>(`/taxes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    return api.delete(`/taxes/${id}`);
  },

  toggleStatus: async (id: string) => {
    return api.patch(`/taxes/${id}/toggle-status`);
  },
};
