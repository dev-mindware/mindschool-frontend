import { PlanType, PLAN_HIERARCHY } from "@/types";

export function hasPlanAccess(
  userPlan: PlanType,
  requiredPlan: PlanType,
): boolean {
  const currentLevel = PLAN_HIERARCHY[userPlan] || 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
  return currentLevel >= requiredLevel;
}
