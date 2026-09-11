export type ItemType = "SERVICE" | "PRODUCT";
export type ItemStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export type ItemsFilters = {
  sortBy: string | null;
  categoryId: string | null;
  supplierId: string | null;
  status: ItemStatus | null;
  sortOrder: string | null;
  search?: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  minStock: string | null;
  maxStock: string | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
  type?: ItemType | null;
};

export type ItemData = {
  id: string;
  name: string;
  description: string;
  company: string;
  sku: string;
  barcode: string;
  price: number;
  cost: number;
  status: string;
  minStock: number;
  maxStock: number;
  unit: string;
  quantity: number;
  weight: number;
  dimensions: string;
  image: string;
  hasExpiry: boolean;
  expiryDate: string;
  daysToExpiry: number;
  createdAt: string;
  updatedAt: string;
  type?: string;
  companyId: string;
  storeId: string;
  categoryId: string;
  taxId: string;
  supplierName: string | null;
  supplierId?: string;
};

export type CreateItemData = {
  name: string;
  type: "PRODUCT" | "SERVICE";
  categoryId: string;
  companyId?: string;
  price: number;
  cost?: number;
  description?: string;
  image?: string;
  storeId?: string;
  sku?: string;
  barcode?: string;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  weight?: number;
  dimensions?: string;
  hasExpiry?: boolean;
  expiryDate?: string;
  daysToExpiry?: string;
  taxId: string;
};

import { Tax } from "./tax";

export type ItemResponse = ItemData & {
  id: string;
  category: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  tax: Tax;
};

export type ViewMode = "card" | "table";
