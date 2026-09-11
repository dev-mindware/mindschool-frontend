export enum ServiceStatus {
  Activo = "Activo",
  Pendente = "Pendente",
  Inactivo = "Inactivo",
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  status: ServiceStatus;
  description?: string;
  isActive?: boolean
}