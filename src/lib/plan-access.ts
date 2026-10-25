import { PLAN_HIERARCHY, type PlanType, type Subscription } from "@/types";

/** O que uma página (ou ação) exige do plano: a feature da API tem prioridade; `minPlan` serve de rótulo e de recurso. */
export interface PlanRequirement {
  minPlan?: PlanType;
  /** Chave de `FEATURES` da API (ex.: `rooms`). Resolve add-ons e overrides; só vale quando a sessão já a conhece. */
  feature?: string;
}

/**
 * A escola tem acesso? Sem subscrição (encarregado/aluno) nada se restringe: a API continua a ser a barreira final.
 * Com a lista de features contratadas decide a feature; sem ela, a hierarquia de planos.
 */
export function isEntitled(req: PlanRequirement, subscription: Subscription | undefined): boolean {
  if (!subscription) return true;
  if (req.feature && subscription.entitledFeatures) return subscription.entitledFeatures.includes(req.feature);
  if (!req.minPlan) return true;
  return (PLAN_HIERARCHY[subscription.plan.name] ?? 0) >= PLAN_HIERARCHY[req.minPlan];
}
