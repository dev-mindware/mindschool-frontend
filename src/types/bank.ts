export interface Bank {
  id: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export type BankData = Omit<
  Bank,
  "id" | "createdAt" | "updatedAt" | "companyId"
>;

export interface BankResponse {
  data: Bank[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
