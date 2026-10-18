import { MenuItem, SubMenuItem } from "@/constants/menu-items";
import { isEntitled } from "@/lib/plan-access";
import { Role, Subscription, SubscriptionStatus } from "@/types";

/**
 * Menu do utilizador: filtra por papel e por plano. Uma página acima do plano some, excepto as marcadas `teaser`, que
 * ficam com cadeado (`showUpgrade`) como montra de upgrade. Sem subscrição (encarregado/aluno) o plano não filtra: a API
 * continua a ser a barreira final.
 */
export function getSidebarForUser(items: MenuItem[], role: Role, subscription: Subscription | undefined): MenuItem[] {
  // Subscrição por pagar: conta só o plano escolhido (as features contratadas ainda não existem).
  const sub = subscription?.status === SubscriptionStatus.PENDING ? { ...subscription, entitledFeatures: undefined } : subscription;

  const resolve = <T extends MenuItem | SubMenuItem>(item: T): T | null => {
    if (item.roles && !item.roles.includes(role)) return null;
    if (isEntitled(item, sub)) return item;
    return item.teaser ? { ...item, showUpgrade: true } : null;
  };

  return items
    .map((item): MenuItem | null => {
      const self = resolve(item);
      if (!self) return null;
      return { ...self, items: item.items?.map(resolve).filter((s): s is SubMenuItem => s !== null) };
    })
    .filter((item): item is MenuItem => item !== null)
    .filter((item) => !(item.url === "#" && Array.isArray(item.items) && item.items.length === 0));
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
