import { icons } from "lucide-react";

export interface SummaryCard {
  title: string;
  value?: number | string;
  type: "default" | "action" | "interactive";
  icon: keyof typeof icons;
  description: string;
  modalId?: string;
  color?: string;
}

export const summaryCards: SummaryCard[] = [
  {
    title: "Receitas",
    type: "default",
    icon: "TrendingUp",
    description: "Receitas totais do dia",
  },
  {
    title: "Despesas",
    type: "default",
    icon: "TrendingDown",
    description: "Despesas totais do dia",
  },
  {
    title: "Pedidos",
    type: "interactive",
    modalId: "pos-requests",
    icon: "Bell",
    description: "Consultar pedidos pendentes",
  },
  {
    title: "Gerir caixas",
    type: "action",
    modalId: "opening-cashier",
    icon: "Info",
    description: "Seleccione para gerir as sessões",
  },
];
