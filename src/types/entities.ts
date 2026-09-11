import { Category } from "./category";

export type ClientData = {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  taxNumber: string;
  companyId?: string;
  iban?: string;
};

export type ClientResponse = ClientData & {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface StoresResponse {
  data: Stores[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Stores {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  code: string;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
}
