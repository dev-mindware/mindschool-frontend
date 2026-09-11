import type { CreateItemData } from "@/types";
import { BarCode } from "@/types/bar-code";
import { api } from "./api";

export const itemsService = {
  addItem: async (data: CreateItemData) => {
    return api.post<CreateItemData>("/items", data);
  },
  updateItem: async (id: string, data: Partial<CreateItemData>) => {
    return api.put<CreateItemData>(`/items/${id}`, data);
  },

  toggleStatusItem: async (id: string) => {
    return api.patch<CreateItemData>(`/items/${id}/toggle-status`);
  },

  deleteItem: async (id: string) => {
    return api.delete<CreateItemData>(`/items/${id}`);
  },

  checkBarcode: async (barcode: string) => {
    const response = await api.get<BarCode>("/items/check-barcode", {
      params: { barcode },
    });
    return response.data;
  },
};
