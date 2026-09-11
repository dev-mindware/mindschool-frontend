export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  quantity: number;
  image?: string;
  barcode?: string;

  // Preços
  price?: number;
  retailPrice?: {
    min: number;
    max: number;
  };
  wholesalePrice?: {
    min: number;
    max: number;
  };

  // Stock
  reserved: number;
  minstock?: number;
  location?: string;
  variants?: number;

  // Gestão e Fornecimento
  supplier?: string;
  measurement?: string;
  expirydate?: Date;
  tax?: {
    id: string;
    name: string;
    rate: number;
  };
  warranty?: number;
  salesperday?: number;
  repositiontime?: number;

  // Exibição
  description?: string;
  isActive?: boolean;
  status?: ProductStatus;
}

export interface ProductCard {
  id: string;
  title: string;
  sku: string;
  category: string;
  subcategory: string;
  retailPrice: {
    min: number;
    max: number;
  };
  wholesalePrice: {
    min: number;
    max: number;
  };
  stock: number;
  location: string;
  variants: number;
  isActive: boolean;
}
export enum ProductStatus {
  Disponível = "Disponível",
  Pendente = "Pendente",
  Esgotado = "Esgotado",
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

// POS Cart Types
export type CartType = "invoice" | "proforma";

export interface CartItem extends Product {
  qty: number;
}
