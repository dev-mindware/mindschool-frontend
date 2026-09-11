import type {
  CreateStorePayload,
  StoreResponse,
  UpdateStorePayload,
} from "@/types";
import api from "./api";

export function normalizeStorePayload<T extends UpdateStorePayload>(data: T): T {
  if (data.code === undefined) return data;

  return {
    ...data,
    code: data.code.trim().toUpperCase() || "SEDE",
  };
}

export const storesService = {
  addStore: async (data: CreateStorePayload) => {
    return api.post<StoreResponse>("/stores", normalizeStorePayload(data));
  },
  updateStore: async (id: string, data: UpdateStorePayload) => {
    return api.put<StoreResponse>(
      `/stores/${id}`,
      normalizeStorePayload(data),
    );
  },
  deleteStore: async (id: string) => {
    return api.delete<void>(`/stores/${id}`);
  },
  getStores: async () => {
    return api.get("/stores");
  },
  toggleStatusStore: async (id: string) => {
    return api.patch<StoreResponse>(`/stores/${id}/toggle-status`);
  },
};
