import { Role } from "@/types";

export const getUserRole = (role: Role) => {
  const roleMap: Record<Role, string> = {
    OWNER: "Proprietário",
    MANAGER: "Gerente",
    ADMIN: "Administrador",
    CASHIER: "Caixa",
  };
  return roleMap[role] || role;
};

