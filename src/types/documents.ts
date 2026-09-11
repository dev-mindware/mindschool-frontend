import { Client } from "./clients";
import { ItemData } from "./items";

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "OVERDUE"
  | string;

export type DownloadType = "pdf" | "thermal";

export type ContactInfo = {
  phone?: string;
  email?: string;
};

export type CompanyInfo = {
  name?: string;
  vatNumber?: string;
  address?: string;
  contact?: ContactInfo;
};

export type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  price?: string;
  total: number | string;
  invoiceId?: string;
  itemsId?: string;
  taxId?: string | null;
  item?: ItemData;
  tax?: string | number;
};

// ========================
// 💳 PAGAMENTO E PARCELAS
// ========================
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";
// Estado do pagamento
export type PaymentStatus = "unpaid" | "paid";

// Dados de pagamento (geral)
export type Payment = {
  method: PaymentMethod;
  bankDetails?: string;
  status?: PaymentStatus; // estado do pagamento
  totalPaid?: number; // soma já paga;
};

export type InvoicePayload = {
  issueDate: string;
  dueDate: string;
  client:
    | {
        id: string;
        name?: undefined;
        phone?: undefined;
        address?: undefined;
        vatNumber?: undefined;
      }
    | {
        name: string;
        phone: string | undefined;
        address: string | undefined;
        vatNumber?: string | undefined;
        id?: undefined;
      };
  items: (
    | {
        id: string;
        quantity: number;
        price?: number;
        name?: undefined;
        type?: undefined;
      }
    | {
        name: string | undefined;
        price: number;
        quantity: number;
        type: "PRODUCT" | "SERVICE";
        id?: undefined;
      }
  )[];
  total: number;
  taxAmount: number;
  discountAmount: number;
  subtotal?: number;
  retentionAmount?: number;
  currencyCode?: string;
  notes?: string;
  storeId?: string;
};

export type InvoiceReceiptPayload = {
  issueDate: string;
  client:
    | {
        id: string;
        name?: undefined;
        phone?: undefined;
        address?: undefined;
        email?: undefined;
      }
    | {
        name: string;
        phone: string | undefined;
        address: string | undefined;
        email?: string | undefined;
        id?: undefined;
      };
  items: (
    | {
        id: string;
        quantity: number;
        price?: number;
        name?: undefined;
        type?: undefined;
      }
    | {
        name: string | undefined;
        price: number;
        quantity: number;
        type: "PRODUCT" | "SERVICE";
        id?: undefined;
      }
  )[];
  total: number;
  taxAmount: number;
  discountAmount: number;
  subtotal?: number;
  retentionAmount?: number;
  storeId?: string;
  amountReceived?: number;
  change?: number;
};

// ========================
// 🧾 DOCUMENTOS
// ========================
export type InvoiceData = {
  id: string;
  number: string;
  invoiceType: string;
  status: string;
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  receivedValue: string;
  change?: number | string | null;
  changeAmount?: number | string | null;
  total: string;
  currencyCode: string;
  notes?: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  type: "PRODUCT" | "SERVICE";
  isPaid: boolean;
  proformaExpiresAt: string;
  originalInvoiceId: string;
  paymentMethodStr: string;
  companyId: string;
  storeId: string;
  userId: string;
  clientId: string;
  discountId: string;
  items: InvoiceItem[];
};

export type InvoiceFilters = {
  sortBy: string | null;
  sortOrder: string | null;
  status: InvoiceStatus | null;
  invoiceNumber: string | null;
  clientName: string | null;
  startDate: string | null;
  endDate: string | null;
  storeId?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
};

export type InvoiceResponse = InvoiceData & {
  id: string;
  client: Client;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreditNoteData = {
  id: string;
  number: string;
  invoiceNumber: string;
  reason: "CORRECTION" | "ANNULMENT";
  status: "DRAFT" | "ISSUED" | "CANCELLED";
  total: number;
  taxAmount: number;
  createdAt: string;
};

export type DocumentType =
  | "invoice"
  | "proforma"
  | "receipt"
  | "invoice-receipt"
  | "credit-note";

export type DocumentVerificationResponse = {
  id: string;
  number: string;
  type: DocumentType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  total: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  isPaid: boolean;
  company: {
    name: string;
    vatNumber?: string;
    address?: string;
  };
  client: {
    name: string;
    taxNumber?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};
