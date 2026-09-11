import api from "./api";
import {
  StockCreateData,
  StockAdjustData,
  StockReserveData,
  StockUnreserveData,
} from "@/types/stock";

export const stockService = {
  getStock: async () => {
    return api.get("/stocks");
  },
  getSummary: async () => {
    return api.get("/stocks/summary");
  },
  addStock: async (data: StockCreateData) => {
    return api.post("/stocks", data);
  },
  updateStock: async (id: string, data: Partial<StockCreateData>) => {
    return api.put(`/stocks/${id}`, data);
  },
  deleteStock: async (id: string) => {
    return api.delete(`/stocks/${id}`);
  },
  adjustStock: async (id: string, data: StockAdjustData) => {
    return api.patch(`/stocks/${id}/adjust`, data);
  },
  unreserveStock: async (id: string, data: StockUnreserveData) => {
    return api.patch(`/stocks/${id}/unreserve`, data);
  },
};
