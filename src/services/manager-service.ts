import type { ManagerData } from "@/types";
import { api } from "./api";

export const managerService = {
  addManager: async (data: ManagerData) => {
    return api.post<ManagerData>("/auth/manager", data);
  },
  updateManager: async (id: string, data: ManagerData) => {
    return api.put<ManagerData>(`/users/${id}`, data);
  },
  deleteManager: async (id: string) => {
    return api.delete<ManagerData>(`/users/${id}`);
  },
  toggleStatusManager: async (id: string) => {
    return api.patch<ManagerData>(`/users/${id}/toggle-status`);
  },
};
