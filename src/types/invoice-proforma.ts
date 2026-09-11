type Client =
  | {
      id: string;
      name?: undefined;
      phone?: undefined;
      address?: undefined;
      taxNumber?: undefined;
    }
  | {
      name: string;
      phone: string | undefined;
      address: string | undefined;
      taxNumber: string | undefined;
      id?: any;
    };

type SimpleItem = {
  name: string;
  price: number;
  quantity: number;
  type: "PRODUCT" | "SERVICE";
};

export interface ProformData {
  client: Client;
  items: SimpleItem[];
  issueDate: string;
  total: number;
  taxAmount: number;
  discountAmount: number;
  retentionAmount: number;
  paymentMethod?: string;
  subtotal?: number;
  proformaExpiresAt?: string;
  notes?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  price: number;
  quantity: number;
  type: string;
  cost: number;
  minStock: number;
  maxStock: number;
  unit: string;
  weight: number;
  dimensions: string;
  image: string;
  storeId: string;
  categoryId: string;
  hasExpiry: boolean;
  expiryDate: string;
  daysToExpiry: number;
}
