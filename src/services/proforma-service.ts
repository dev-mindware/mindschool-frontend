import { api } from "./api";
import type { EditProformaFormData } from "@/schemas";
import type { ProformData } from "@/types";

export const proformaService = {
  createProforma: async (data: ProformData) => {
    return api.post("/invoice/proforma", data);
  },
  deleteProforma: async (id: string) => {
    return api.delete(`/invoice/proforma/${id}`);
  },
  updateProforma: async (id: string, data: EditProformaFormData) => {
    return api.put(`/invoice/proforma/${id}`, data);
  },
};
