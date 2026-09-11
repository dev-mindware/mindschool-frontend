export interface Tax {
  id: string;
  name: string;
  type: string;
  rate: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxData {
  name: string;
  type: string;
  rate: number;
  description: string;
}
