export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  trialEndsAt: string;
  periodStartsAt: string;
  periodEndsAt: string;
  canceledAt: string;
  createdAt?: string;
  updatedAt?: string;
  billingInterval: string;
  paymentProvider: string;
  providerClientId: string;
  providerSubscriptionId: string;
  billingPeriodInMonths: string | null;
  plan: Plan;
  /** Chaves das features contratadas (plano + add-ons), como a API as resolve. `undefined` = ainda não carregadas. */
  entitledFeatures?: readonly string[];
}

/** Código do plano, tal como na API (`plan.code`). */
export type PlanType = "essencial" | "profissional" | "enterprise";

export const PLAN_HIERARCHY: Record<PlanType, number> = {
  essencial: 0,
  profissional: 1,
  enterprise: 2,
};

export const PLAN_LABEL: Record<PlanType, string> = {
  essencial: "Essencial",
  profissional: "Profissional",
  enterprise: "Enterprise",
};

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
}

/** O plano da subscrição activa: `name` é o código da API (`essencial`, `profissional`, `enterprise`). O catálogo completo vem de `subscription-service`. */
export interface Plan {
  id: string;
  name: PlanType;
}
