import { Company, Store } from "./company";
import type { Subscription } from "./subscription";

export interface LoginResponse {
  message: string;
  user: User;
  tokens: Tokens;
}

export type Role = 'ADMIN' | 'OWNER' | 'MANAGER' | "CASHIER"

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string,
  barcode?: string | null;
  company: Company;
  store?: Store;
  subscription?: Subscription;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}