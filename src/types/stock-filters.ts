export type stockFilters = {
  sortBy?: string | null;
  sortOrder?: string | null;
  itemsId?: string | null;
  storeId?: string | null;
  minQuantity?: number | null;
  maxQuantity?: number | null; 
  minAvailable?: number | null;
  maxAvailable?: number | null;
  hasReserved?: boolean | null;
  lowStock?: boolean | null;
  outOfStock?: boolean | null;
  includeItem?: boolean | null;
  includeStore?: boolean | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
};
