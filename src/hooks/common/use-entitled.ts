"use client";

import { useAuthStore } from "@/stores";
import { isEntitled, type PlanRequirement } from "@/lib/plan-access";

/** A escola ativa tem a capacidade? Serve para não pedir à API (nem mostrar) o que o plano contratado não inclui. */
export function useEntitled(req: PlanRequirement): boolean {
  const subscription = useAuthStore((s) => s.user?.company?.subscription);
  return isEntitled(req, subscription);
}
