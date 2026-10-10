import { Icon } from "@/components";
import { MenuItem } from "@/constants/menu-items";
import { Role, PlanType, Subscription, SubscriptionStatus, PLAN_HIERARCHY } from "@/types";

/**
 * Modulos que ainda NAO tem API (biblioteca, saude, transporte, extracurriculares, pedidos da secretaria): ficam escondidos
 * do menu para nao mostrar dados de demonstracao como se fossem reais.  mostra-os.
 */
const UNLINKED_URLS: string[] = [];

function pruneUnlinked(items: MenuItem[]): MenuItem[] {
  if (process.env.NEXT_PUBLIC_SHOW_UNLINKED_MODULES === "true") return items;
  return items.map((i) => ({ ...i, items: i.items?.filter((sub) => !UNLINKED_URLS.includes(sub.url)) })).filter((i) => !UNLINKED_URLS.includes(i.url));
}

export function getSidebarForUser(
  items: MenuItem[],
  role: Role,
  subscription: Subscription | undefined,
  plan?: PlanType,
): MenuItem[] {

  if (subscription?.status === SubscriptionStatus.PENDING) {
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
  // Sem acesso a subscricao (ex.: encarregado/aluno) o plano nao filtra o menu: a API continua a ser a barreira.
  const currentPlanLevel = !subscription ? Number.POSITIVE_INFINITY : plan ? PLAN_HIERARCHY[plan] : 0;

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
    }))
    .filter((item) => {
      if (item.url === "#" && Array.isArray(item.items) && item.items.length === 0) {
        return false;
      }
      return true;
    });
}

/**
 * Esconde as páginas cuja permissão de leitura o utilizador não tem (as que a API recusaria). Sem lista de permissões
 * (sessão antiga) nada se esconde. Grupos que ficam vazios desaparecem.
 */
export function filterByPermissions(items: MenuItem[], permissions: readonly string[] | undefined): MenuItem[] {
  if (!permissions) return items;
  const ok = (needed?: readonly string[]) => !needed || needed.some((p) => permissions.includes(p));
  return items
    .map((i) => (i.items ? { ...i, items: i.items.filter((s) => ok(s.permissions)) } : i))
    .filter((i) => (i.items ? i.items.length > 0 : ok(i.permissions)));
}
