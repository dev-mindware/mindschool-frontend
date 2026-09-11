export interface CashSession {
  id: string;
  openingCash: number;
  storeId: string;
  userId: string;
  closingCash: number;
  totalSales: number;
  notes: string;
  openedAt: string;
  closedAt: string;
  expectedClosingCash: number;
  cashDifference: number;
  duration: string;
  isOpen: boolean;
  fundType: string;
  workTime: string;
  authorizedById: string;
  authorizedByName: string;
  remainingTime: string;
  store?: {
    name: string;
  };
  cashierName: string;
}

export interface CashSessionFilters {
  storeId?: string | null;
  search?: string | null;
  isOpen?: string | null; // "true", "false", or null for all
  sortBy?: string | null;
  sortOrder?: string | null;
  openedAfter?: string | null;
  openedBefore?: string | null;
  page?: number;
}

export interface CashSessionRequest {
  id: string;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  userId: string;
  storeId: string;
  createdAt: string;
  userName?: string;
}

export interface CashSessionRequestFilters {
  storeId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | null;
  userId?: string;
}

export interface AuthorizeOpeningPayload {
  initialCapital: string;
  workTime: string;
  storeId: string;
  fundType: "COIN" | string;
  cashierIds: string[];
  managerBarcode: string;
}
