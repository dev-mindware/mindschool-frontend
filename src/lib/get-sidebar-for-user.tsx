import { Icon } from "@/components";
import { MenuItem } from "@/constants/menu-items";
import { Role, PlanType, Subscription, SubscriptionStatus, PLAN_HIERARCHY } from "@/types";

export function getSidebarForUser(
  items: MenuItem[],
  role: Role,
  subscription: Subscription,
  plan?: PlanType,
): MenuItem[] {

  if (subscription.status === SubscriptionStatus.PENDING) {
    // Filter by the pending plan so Base/Smart pending users don't see Pro menus
    const pendingPlanLevel = plan ? PLAN_HIERARCHY[plan] : 0;

    return items
      .filter((item) => !item.roles || item.roles.includes(role))
      .map((item) => {
        const isPlans = item.url === "/plans";
        const isSettings = item.url === "/settings";

        if (isPlans || isSettings) return item;

        const itemPlanLevel = item.minPlan ? PLAN_HIERARCHY[item.minPlan] : 0;
        const planOk = itemPlanLevel <= pendingPlanLevel;

        if (!planOk) return null;

        return {
          ...item,
          showUpgrade: true,
          items: item.items?.filter((sub) => {
            const subPlanLevel = sub.minPlan ? PLAN_HIERARCHY[sub.minPlan] : 0;
            return subPlanLevel <= pendingPlanLevel;
          }),
        };
      })
      .filter(Boolean) as typeof items;
  }

  // Fallback to Base level conceptually if no plan is provided
  const currentPlanLevel = plan ? PLAN_HIERARCHY[plan] : 0;

  return items
    .filter((item) => {
      const roleOk = !item.roles || item.roles.includes(role);
      const itemPlanLevel = item.minPlan ? PLAN_HIERARCHY[item.minPlan] : 0;
      const planOk = !item.minPlan || currentPlanLevel >= itemPlanLevel;

      if (!planOk && item.showUpgrade) return roleOk;

      return roleOk && planOk;
    })
    .map((item) => ({
      ...item,
      items: item.items?.filter((sub) => {
        const roleOk = !sub.roles || sub.roles.includes(role);
        const subPlanLevel = sub.minPlan ? PLAN_HIERARCHY[sub.minPlan] : 0;
        const planOk = !sub.minPlan || currentPlanLevel >= subPlanLevel;
        return roleOk && planOk;
      }),
    }));
}
