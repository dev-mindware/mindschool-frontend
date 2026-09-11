import type { BankData, BankResponse } from "@/types";
import api from "./api";

const normalizeIban = (iban: string) => {
  const normalized = iban.replace(/[.\s]/g, "").toUpperCase();
  return normalized.startsWith("AO06")
    ? normalized.slice(4)
    : normalized.startsWith("AO")
      ? normalized.slice(2)
      : normalized;
};

export const banksService = {
  addBank: async (data: BankData) => {
    const cleanIbanBody = normalizeIban(data.iban);
    return api.post<BankResponse>("/bank-accounts", {
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      iban: "AO06" + cleanIbanBody,
      phone: data.phone,
      isDefault: data.isDefault,
    });
  },
  updateBank: async (id: string, data: Partial<BankData>) => {
    const updateData = { ...data };
    if (updateData.iban) {
      const cleanIbanBody = normalizeIban(updateData.iban);
      updateData.iban = "AO06" + cleanIbanBody;
    }
    return api.patch<BankResponse>(`/bank-accounts/${id}`, updateData);
  },
  deleteBank: async (id: string) => {
    return api.delete<void>(`/bank-accounts/${id}`);
  },
  getBanks: async () => {
    return api.get("/bank-accounts");
  },
};
