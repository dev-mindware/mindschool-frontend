export type ManagerData = {
  name: string;
  email?: string;
  password?: string;
  barcode?: string;
  phone: string;
  role?: string;
  companyId?: string;
  storeId?: string;
  storeIds?: string[];
};

export type ManagerResponse = ManagerData & {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  stores?: { id: string; name: string }[];
};

export type CashierData = {
  name: string;
  email?: string;
  password?: string;
  barcode?: string;
  phone: string;
  role: string;
  companyId?: string;
  storeId?: string;
};

export type CashierResponse = CashierData & {
  id: string;
  status: any;
  createdAt: string;
  updatedAt: string;
};

export type CashierFilters = {
  sortBy?: string | null;
  status?: string | null;
  sortOrder?: string | null;
  search?: string | null;
};

export type SupplierData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  companyId?: string;
};

export type SupplierResponse = SupplierData & {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
