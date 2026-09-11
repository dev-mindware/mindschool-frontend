export interface StockEntryItem {
  id: string;
  quantity: number;
  costAtEntry: number;
  previousCost: number;
  companyId: string;
  stockEntryId: string;
  itemsId: string;
  item: {
    name: string;
    sku: string;
  };
}

export interface StockEntry {
  id: string;
  number: string | null;
  totalAmount: number;
  notes: string | null;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  storeId: string;
  supplierId: string;
  items: StockEntryItem[];
  store: {
    name: string;
  };
}
