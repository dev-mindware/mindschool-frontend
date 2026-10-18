import { create } from "zustand";
import { PlanType } from "@/types";

interface PlanUpgradeModalState {
  isOpen: boolean;
  requiredPlan: PlanType;
  featureName?: string;
  description?: string;
  open: (options?: { requiredPlan?: PlanType; featureName?: string; description?: string }) => void;
  close: () => void;
}

export const usePlanUpgradeModal = create<PlanUpgradeModalState>((set) => ({
  isOpen: false,
  requiredPlan: "profissional",
  featureName: undefined,
  description: undefined,
  open: (options) =>
    set({
      isOpen: true,
      requiredPlan: options?.requiredPlan ?? "profissional",
      featureName: options?.featureName,
      description: options?.description,
    }),
  close: () => set({ isOpen: false }),
}));

export function isPlanRestrictedError(error: unknown): boolean {
  if (!error) return false;
  const err = error as any;
  const code = err?.response?.data?.code || err?.code;
  const message = (err?.response?.data?.message || err?.message || "").toString().toLowerCase();
  const detail = (err?.response?.data?.detail || "").toString().toLowerCase();

  if (code === "ENTITLEMENT_REQUIRED" || code === "SUBSCRIPTION_SUSPENDED") {
    return true;
  }
  if (
    message.includes("plano") ||
    message.includes("subscrição") ||
    message.includes("recurso") ||
    message.includes("entitlement")
  ) {
    return true;
  }
  if (detail.includes("plano") || detail.includes("subscrição")) {
    return true;
  }
  return false;
}
