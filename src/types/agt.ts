export type AgtDocumentType = "FT" | "FR" | "RC" | "NC" | "RG";

export interface AgtSeries {
  id: string;
  seriesCode: string;
  documentType: string;
  seriesYear: string;
  establishmentNumber: string;
  currentSequence: number;
  lastDocumentNo: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface AgtInvoice {
  id: string;
  type: string;
  number: string;
  date: string;
  status: string;
  statusDescription: string;
  total: number;
}

export interface AgtInvoiceListResponse {
  items: AgtInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AgtConfigStatus {
  hasKey: boolean;
}

export interface AgtConsultDocument {
  id?: string;
  documentNo: string;
  documentType?: string;
  documentDate?: string;
  documentStatus?: string;
  documentStatusDescription?: string;
  taxRegistrationNumber?: string;
  netTotal?: string | number;
}

export interface AgtConsultError {
  descriptionError?: string;
}

export interface AgtConsultResponse {
  statusResult?: {
    documentNo?: string;
    documentResult?: AgtConsultDocument;
  };
  documentNo?: string;
  documentResult?: AgtConsultDocument;
  errorList?: AgtConsultError[];
}

export interface AgtInvoiceFilters {
  queryStartDate: string | null;
  queryEndDate: string | null;
  documentType: string | null;
}

export type AgtFiscalStatus =
  | "PENDING_SUBMISSION"
  | "SUBMITTED"
  | "VALIDATED"
  | "REJECTED"
  | "TECHNICAL_ERROR";

export interface AgtError {
  id: string;
  invoiceId?: string | null;
  creditNoteId?: string | null;
  requestId?: string | null;
  code: string;
  message: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  action: "RETRY" | "MANUAL_FIX" | "CONTACT_SUPPORT" | "NONE" | string;
  origin: "SUBMISSION" | "VALIDATION" | "POLLING" | string;
  retryable: boolean;
  payloadSent?: any;
  agtResponse?: any;
  agtVersion?: string | null;
  tenantId?: string | null;
  createdAt: string;
  invoice?: {
    id: string;
    number: string;
    type: string;
    status: string;
    total: number | string;
    agtStatus?: string | null;
  } | null;
  creditNote?: {
    id: string;
    number: string;
    status: string;
    total: number | string;
    agtStatus?: string | null;
  } | null;
}

export interface AgtErrorsListResponse {
  items: AgtError[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AgtErrorFilters {
  search?: string;
  origin?: string;
  severity?: string;
  page?: number;
  limit?: number;
}

export interface AgtActionResponse {
  message: string;
}

export type AgtTab = "series" | "repository" | "consultation" | "errors" | "settings";


