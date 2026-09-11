import { User } from "./auth"
import { Client } from "./clients"
import { Company } from "./company"
import { ItemData } from "./items"

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER"

export interface ReceiptResponse {
  id: string
  number: string
  status: string
  subtotal: string
  taxAmount: string
  retentionAmount: string
  discountAmount: string
  total: string
  notes: string
  dueDate: string
  paidAt: string
  createdAt: string
  updatedAt: string
  paymentMethod: PaymentMethod
  type: string
  isPaid: boolean
  proformaExpiresAt: string
  originalInvoiceId: string
  receivedValue: string
  paymentMethodStr: string
  companyId: string
  storeId: string
  userId: string
  clientId: string
  discountId: string
  client: Client
  user: User
  company: Company
  items: ItemData[]
}

export type ReceiptData = {
  issueDate: string
  total: number
  taxAmount: number
  discountAmount: number
  retentionAmount: number
  paymentMethod: PaymentMethod
  originalInvoiceId: string
  notes?: string
}

