import { Client } from "./clients";
import { InvoiceStatus } from "./documents";
import { PaymentMethod } from "./receipt";

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDetails {
  id: string;
  invoiceNumber?: string;
  number?: string;
  invoiceType: string;
  status: string;
  isPaid: boolean;
  client: Client;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount?: number;
  total?: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReceiptDetails = {
  id: string;
  receiptNumber?: string;
  number?: string;
  receiptType: string;
  client: Client;
  issueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  retentionAmount: number;
  totalAmount?: number;
  total?: number;
  receivedValue: number;
  changeAmount?: number;
  change?: number;
  paymentMethod: PaymentMethod | string;
  originalInvoiceId: string | null;
  notes?: string | null;
  operatorId?: string;
  operatorName?: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceType = InvoiceDetails;

export interface CreditNotesResponse {
  id: string;
  number: string;
  reason: "CORRECTION" | "ANNULMENT";
  status: string;
  notes: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: ItemSimple[];
  client: Client;
  invoice: Invoice;
}

export interface ItemSimple {
  id: string;
  // Nome legível do item (art. 10.º n.º 1 c) — discriminação clara).
  // 🚩 Backend: a resposta de GET /credit-note deve incluir este campo.
  name?: string;
  quantity: number;
  price: string;
  total: string;
  invoiceId: string;
  itemsId: string;
  taxId: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: string;
  subtotal: string;
  taxAmount: string;
  retentionAmount: string;
  discountAmount: string;
  total: string;
  notes: string;
  paidAt: string;
  paymentMethod: PaymentMethod;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditNoteFilters {
  reason: "CORRECTION" | "RETURN" | "DISCOUNT" | "ANNULMENT" | string | null;
  status?: InvoiceStatus | null;
  creditNoteNumber: string | null;
  sortBy: string | null;
  sortOrder: string | null;
  startDate: string | null;
  endDate: string | null;
}

// criação de nota de credito

export interface InvoiceBody {
  client: Client;
  items: ItemBody[];
  issueDate: string;
  dueDate: string;
  total: number;
  taxAmount: number;
  subtotal: number;
  discountAmount: number;
  notes: string;
}

export interface ItemBody {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type FullItem = ItemSimple & {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  cost: number;
  type: string;
  minStock: number;
  maxStock: number;
  unit: string;
  weight: number;
  dimensions: string;
  image: string;
  hasExpiry: boolean;
  expiryDate: string;
  daysToExpiry: number;
};
