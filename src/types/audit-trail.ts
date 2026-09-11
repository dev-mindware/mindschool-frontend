export type AuditTrailAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "SALE"
  | "REFUND";

export type AuditTrailEntity =
  | "USER"
  | "ITEMS"
  | "INVOICE"
  | "TRANSACTION"
  | "CLIENT"
  | "COMPANY"
  | "STORE"
  | "CATEGORY"
  | "STOCK"
  | "CASH_SESSION"
  | "SUBSCRIPTION"
  | "STOCK_RESERVATION";

export interface AuditTrailUser {
  id: string;
  name: string;
  email: string;
}

export interface AuditTrailResponse {
  id: string;
  action: AuditTrailAction;
  entity: AuditTrailEntity;
  entityId: string;
  userId: string;
  companyId: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  changes: Record<string, { from: any; to: any }> | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  user?: AuditTrailUser;
}

export interface PaginatedAuditTrailResponse {
  data: AuditTrailResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditTrailFilters {
  entity?: AuditTrailEntity;
  action?: AuditTrailAction;
  userId?: string;
  entityId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
