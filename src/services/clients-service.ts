import type { ClientData } from "@/types";
import { api } from "./api";

export const clientsService = {
  addClient: async (data: ClientData) => {
    return api.post<ClientData>("/clients", data);
  },
  updateClient: async (id: string, data: ClientData) => {
    return api.put<ClientData>(`/clients/${id}`, data);
  },
  deleteClient: async (id: string) => {
    return api.delete<ClientData>(`/clients/${id}`);
  },
  toggleStatusClient: async (id: string) => {
    return api.patch<ClientData>(`/clients/${id}/toggle-status`);
  },
};
