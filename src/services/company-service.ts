import type { User as CompanyResponse, CompanyData } from "@/types";
import { api } from "./api";

export type UpdateCompanyPayload = Partial<CompanyData>;

export const companyService = {
  addCompany: async (data: CompanyData) => {
    return api.post<CompanyResponse>("/companies", data);
  },
  updateCompany: async (id: string, data: UpdateCompanyPayload) => {
    return api.put<CompanyResponse>(`/companies/${id}`, data);
  },
};
