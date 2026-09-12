import { Role } from "@/types";
import { ROLE_LABELS } from "@/constants/roles";

export const getUserRole = (role: Role): string => {
  return ROLE_LABELS[role] || role;
};

