import type { Role } from "@/types";
import { ROLE_HIERARCHY } from "@/constants/roles";

/** Papeis da API MindEscola (por escola) -> papeis do frontend. */
export const API_ROLE_MAP: Record<string, Role> = {
  titular: "DIRECTOR_GENERAL",
  direccao_pedagogica: "PEDAGOGIC_DIRECTOR",
  secretaria: "SECRETARY",
  professor: "TEACHER",
  financeiro: "FINANCIAL",
  encarregado: "GUARDIAN",
  aluno: "STUDENT",
  auditor_med: "MED_AUDITOR",
  admin_sistema: "SYSTEM_ADMIN",
};

export function mapApiRole(role: string): Role | null {
  return API_ROLE_MAP[role] ?? null;
}

/** O papel de maior autoridade entre os papeis do utilizador numa escola. */
export function pickPrimaryRole(apiRoles: string[]): Role | null {
  const mapped = apiRoles.map(mapApiRole).filter((r): r is Role => r !== null);
  if (mapped.length === 0) return null;
  return mapped.sort((a, b) => (ROLE_HIERARCHY[b] ?? 0) - (ROLE_HIERARCHY[a] ?? 0))[0]!;
}
