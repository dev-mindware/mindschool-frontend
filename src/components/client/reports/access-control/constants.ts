import { AuditTrailAction, AuditTrailEntity } from "@/types";
import { icons } from "lucide-react";

export interface ActionBadgeConfig {
  variant: "success" | "secondary" | "destructive" | "default" | "outline" | "pending";
  label: string;
  icon: keyof typeof icons;
}

export const ACTION_BADGES: Record<AuditTrailAction, ActionBadgeConfig> = {
  CREATE: { variant: "success", label: "Criação", icon: "CirclePlus" },
  UPDATE: { variant: "secondary", label: "Actualização", icon: "Pen" },
  DELETE: { variant: "destructive", label: "Eliminação", icon: "Trash2" },
  LOGIN: { variant: "success", label: "Login", icon: "LogIn" },
  LOGOUT: { variant: "secondary", label: "Logout", icon: "LogOut" },
  SALE: { variant: "success", label: "Venda", icon: "DollarSign" },
  REFUND: { variant: "destructive", label: "Reembolso", icon: "RotateCcw" },
};

export const ENTITY_LABELS: Record<AuditTrailEntity, string> = {
  USER: "Utilizador",
  ITEMS: "Produto / Item",
  INVOICE: "Factura",
  TRANSACTION: "Transacção",
  CLIENT: "Cliente",
  COMPANY: "Empresa",
  STORE: "Loja",
  CATEGORY: "Categoria",
  STOCK: "Stock",
  CASH_SESSION: "Sessão de Caixa",
  SUBSCRIPTION: "Assinatura",
  STOCK_RESERVATION: "Reserva de stock",
};

export const ENTITY_OPTIONS = Object.entries(ENTITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const ACTION_OPTIONS = Object.entries(ACTION_BADGES).map(([value, badge]) => ({
  value,
  label: badge.label,
}));
