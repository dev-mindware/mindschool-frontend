export interface Cashier {
  id: number;
  name: string;
  cashNumber: string;
  totalSold: number;
  activityTime: string;
  progress: number;
  status: "Ativo" | "Inativo" | "Pausado" | "Fechado";
}

export interface OpenCashRegister {
  id: number;
  name: string;
  cashNumber: string;
}

export interface CashierCardProps {
  cashier: Cashier;
  onAdd: (cashier: Pick<Cashier, "name" | "cashNumber">) => void;
}

export interface CashOpeningFormProps {
  openCashRegisters: OpenCashRegister[];
  onRemove: (id: number) => void;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}