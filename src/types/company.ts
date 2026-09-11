import { Subscription } from "./subscription";

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  website?: string | null;
  logo?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  subscription: Subscription;
}

export interface Store {
  id: string;
  name: string;
}

export type CompanyData = {
  email: string;
  name: string;
  password: string;
  phone: string;
  affiliateCode?: string;
  company: Omit<
    Company,
    "id" | "isActive" | "createdAt" | "updatedAt" | "subscription"
  >;
};
