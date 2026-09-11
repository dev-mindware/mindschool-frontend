import { api } from "./api";

export type CompanySetting = {
  id: string;
  companyId: string;
  type: string;
  key: string;
  value: unknown;
  category?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateCompanySettingsPayload = {
  invoiceNotes?: string;
  receiptFooter?: string;
  logo?: string;
  address?: string;
  defaultTaxRate?: number;
  currency?: string;
};

export const settingsService = {
  getCompanySettings: async () => {
    const response = await api.get<CompanySetting[]>("/settings/company");
    return response.data;
  },
  updateCompanySettings: async (data: UpdateCompanySettingsPayload) => {
    const response = await api.put<CompanySetting[]>("/settings/company", data);
    return response.data;
  },
};
