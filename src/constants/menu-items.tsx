import { Icon } from "@/components";
import type { Role, PlanType } from "@/types";
import { MODULES, PAGES, PAGE_PERMISSION, type PageDef } from "./navigation-registry";

export type SubMenuItem = {
  name: string;
  url: string;
  /** Nome do ícone (a sidebar colapsada só mostra ícones). */
  iconName?: string;
  roles?: Role[];
  /** Permissões da API que dão acesso de leitura (qualquer uma): ver `PAGE_PERMISSION`. */
  permissions?: readonly string[];
  minPlan?: PlanType;
  feature?: string;
  teaser?: boolean;
  /** Visível mas acima do plano contratado (montra de upgrade). */
  showUpgrade?: boolean;
};

export type MenuItem = {
  name: string;
  url: string;
  icon?: React.ReactNode;
  iconName?: string;
  permissions?: readonly string[];
  roles?: Role[];
  minPlan?: PlanType;
  feature?: string;
  teaser?: boolean;
  showMoreIcon?: boolean;
  showUpgrade?: boolean;
  items?: SubMenuItem[];
};

export type MenuStructure = {
  items: MenuItem[];
};

const asSub = (p: PageDef): SubMenuItem => ({ name: p.name, url: p.url, iconName: p.icon, roles: [...p.roles], ...(PAGE_PERMISSION[p.url] ? { permissions: PAGE_PERMISSION[p.url] } : {}), ...(p.minPlan ? { minPlan: p.minPlan } : {}), ...(p.feature ? { feature: p.feature } : {}), ...(p.teaser ? { teaser: true } : {}) });
const asLeaf = (p: PageDef): MenuItem => ({ ...asSub(p), icon: <Icon name={p.icon} className="w-5 h-5" /> });

/**
 * Menu em árvore, DERIVADO do registo único (`navigation-registry.ts`): uma secção rotulada vira um grupo com sub-páginas
 * (acordeão); uma secção sem rótulo, ou marcada `loose`, deixa as páginas soltas.
 */
function buildMenuTree(): MenuItem[] {
  const items: MenuItem[] = [];
  for (const mod of MODULES) {
    for (const section of mod.sections) {
      const pages = PAGES.filter((p) => p.module === mod.id && p.section === section.label);
      if (pages.length === 0) continue;
      if (!section.label || section.loose) {
        items.push(...pages.map(asLeaf));
        continue;
      }
      const union = [...new Set(pages.flatMap((p) => p.roles))];
      items.push({
        name: section.label,
        url: "#",
        icon: <Icon name={section.icon ?? mod.icon} className="w-5 h-5" />,
        roles: [...(section.groupRoles ?? union)],
        items: pages.map(asSub),
      });
    }
  }
  return items;
}

export const menuItems: MenuStructure = { items: buildMenuTree() };
