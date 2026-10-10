import { menuItems, type MenuItem } from "@/constants/menu-items";
import type { Role } from "@/types";

const flattenMenu = (items: MenuItem[]): MenuItem[] =>
  items.reduce<MenuItem[]>((acc, item) => {
    acc.push(item);
    if (item.items) acc.push(...flattenMenu(item.items));
    return acc;
  }, []);

const allMenuItems = flattenMenu(menuItems.items);

/**
 * Item do menu que governa um caminho: o de URL mais específico. Vários itens podem partilhar o mesmo URL com papéis
 * diferentes (ex.: «Início» da família e «Dashboard» da escola em /dashboard), por isso, entre os empatados, vale o
 * que admite o papel do utilizador.
 */
export function findMatchingMenuItem(pathname: string, role?: Role): MenuItem | undefined {
  const candidates = allMenuItems.filter((item) => item.url !== "#" && item.url !== "/" && (pathname === item.url || pathname.startsWith(item.url + "/")));
  if (candidates.length === 0) return undefined;
  const longest = Math.max(...candidates.map((i) => i.url.length));
  const top = candidates.filter((i) => i.url.length === longest);
  return top.find((i) => !i.roles || (role !== undefined && i.roles.includes(role))) ?? top[0];
}
