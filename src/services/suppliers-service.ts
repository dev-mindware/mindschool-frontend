import type { SupplierData, SupplierResponse } from "@/types";
import api from "./api";

export const suppliersService = {
  addSupplier: async (data: SupplierData) => {
    return api.post<SupplierResponse>("/suppliers", data);
  },
  updateSupplier: async (id: string, data: Partial<SupplierData>) => {
    return api.put<SupplierResponse>(`/suppliers/${id}`, data);
  },
  deleteSupplier: async (id: string) => {
    return api.delete(`/suppliers/${id}`);
  },
  getSupplierById: async (id: string) => {
    return api.get<SupplierResponse>(`/suppliers/${id}`);
  },
  addStockEntry: async (data: any) => {
    return api.post("/suppliers/stock-entry", data);
  },
  getStockEntries: async (supplierId: string, params?: Record<string, any>) => {
    return api.get(`/suppliers/${supplierId}/stock-entries`, { params });
  },
  deleteSupplierItemsBulk: async (supplierId: string, itemIds: string[]) => {
    return api.delete(`/suppliers/${supplierId}/items/bulk`, {
      data: { itemIds },
    });
  },
};
