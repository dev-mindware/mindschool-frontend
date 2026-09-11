import { Cashier } from "@/types/cashier";

export const getStatusColor = (status: Cashier["status"]): string => {
  switch (status) {
    case "Ativo":
      return "text-green-700 bg-green-100 border-green-200";
    case "Inativo":
      return "text-gray-700 bg-gray-100 border-gray-200";
    case "Pausado":
      return "text-yellow-700 bg-yellow-100 border-yellow-200";
    case "Fechado":
      return "text-red-700 bg-red-100 border-red-200";
    default:
      return "text-gray-700 bg-gray-100 border-gray-200";
  }
};

export const getStatusDot = (status: Cashier["status"]): string => {
  switch (status) {
    case "Ativo":
      return "bg-green-500";
    case "Inativo":
      return "bg-gray-500";
    case "Pausado":
      return "bg-yellow-500";
    case "Fechado":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};