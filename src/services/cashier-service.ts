import type { CashierData } from "@/types";
import { api } from "./api";

export const cashierService = {
  addCashier: async (data: CashierData) => {
    return api.post<CashierData>("/auth/register/user", data);
  },
  updateCashier: async (id: string, data: CashierData) => {
    return api.put<CashierData>(`/users/${id}`, data);
  },
  deleteCashier: async (id: string) => {
    return api.delete<CashierData>(`/users/${id}`);
  },
  toggleStatusCashier: async (id: string) => {
    return api.patch<CashierData>(`/users/${id}/toggle-status`);
  },
};
