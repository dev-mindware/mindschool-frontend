import type { MenuItem } from "./menu-items";
import { MODULES, PAGES, type Audience, type ModuleId } from "./navigation-registry";

export type { ModuleId };

/**
 * Navegação modular. A estrutura (módulos → secções → páginas) vem do registo único (`navigation-registry.ts`); o que cada utilizador vê continua a
 * ser decidido por `getSidebarForUser` (papel/plano) e `buildNavigation` só arruma as páginas visíveis nos módulos.
 * Regras: no máximo `MAX_PAGES_PER_MODULE` páginas por módulo; «Início» é a dashboard do papel; «Configurações» é sempre
 * o último módulo e contém apenas a página de configurações.
 */


export interface NavModuleDef { id: ModuleId; label: string; icon: string }
interface StructureSection { label?: string; keys: string[] }
interface StructureModule extends NavModuleDef { sections: StructureSection[] }

export const MAX_PAGES_PER_MODULE = 8;
/** Limiares do modo `dual` (constantes: ajustar aqui). */
export const DUAL_MIN_MODULES = 3;
export const DUAL_MIN_PAGES = 15;
/** Lista de itens sem sub-páginas só ganha rótulos de grupo a partir deste tamanho. */
export const GROUPED_MIN_ITEMS = 8;

/** Chave de uma página: o URL, excepto /dashboard, que existe como «Dashboard» (escola) e «Início» (família). */
export const linkKey = (name: string, url: string) => (url === "/dashboard" ? `${url}:${name}` : url);

const structureOf = (audience: Audience): StructureModule[] =>
  MODULES.filter((m) => m.audience === audience).map(({ id, label, icon, sections }) => ({
    id, label, icon,
    sections: sections.map((s) => ({ ...(s.label ? { label: s.label } : {}), keys: PAGES.filter((p) => p.module === id && p.section === s.label).map((p) => linkKey(p.name, p.url)) })),
  }));

/** Escola (direcção, secretaria, professores, finanças...). A ordem é a do rail; «Configurações» fica no fundo. */
const SCHOOL_STRUCTURE: readonly StructureModule[] = structureOf("school");
/** Encarregado e aluno: grupos rotulados numa coluna única (poucas páginas, sem rail). */
const FAMILY_STRUCTURE: readonly StructureModule[] = structureOf("family");

const OTHERS: NavModuleDef = { id: "outros", label: "Outros", icon: "Ellipsis" };

export const NAV_MODULES: readonly NavModuleDef[] = [...SCHOOL_STRUCTURE, ...FAMILY_STRUCTURE].map(({ id, label, icon }) => ({ id, label, icon }));
/** Módulos mostrados no fundo do rail. */
export const RAIL_BOTTOM: readonly ModuleId[] = ["configuracoes"];

/** Todas as páginas declaradas na estrutura (para testes: nenhuma página do menu pode ficar de fora). */
export const PLACED_KEYS: ReadonlySet<string> = new Set([...SCHOOL_STRUCTURE, ...FAMILY_STRUCTURE].flatMap((m) => m.sections.flatMap((s) => s.keys)));

export type SidebarMode = "dual" | "grouped" | "flat";

export interface NavLink { key: string; name: string; url: string; icon: string; showUpgrade?: boolean }
export interface NavSection { id: string; label?: string; links: NavLink[] }
export interface NavModule extends NavModuleDef { sections: NavSection[]; links: NavLink[]; pageCount: number; defaultUrl: string }
export interface NavigationModel { mode: SidebarMode; modules: NavModule[]; pageCount: number }

/** Páginas visíveis (já filtradas por papel/plano), indexadas pela chave. */
function collectLinks(items: MenuItem[]): Map<string, NavLink> {
  const links = new Map<string, NavLink>();
  for (const item of items) {
    if (item.items?.length) {
      for (const sub of item.items) {
        links.set(linkKey(sub.name, sub.url), { key: linkKey(sub.name, sub.url), name: sub.name, url: sub.url, icon: sub.iconName ?? item.iconName ?? "Circle", ...(sub.showUpgrade ? { showUpgrade: true } : {}) });
      }
    } else if (item.url !== "#") {
      links.set(linkKey(item.name, item.url), { key: linkKey(item.name, item.url), name: item.name, url: item.url, icon: item.iconName ?? "Circle", ...(item.showUpgrade ? { showUpgrade: true } : {}) });
    }
  }
  return links;
}

/** Constrói o modelo a partir dos itens JÁ filtrados para o utilizador. */
export function buildNavigation(items: MenuItem[]): NavigationModel {
  const links = collectLinks(items);
  const structure = items.some((i) => i.url.startsWith("/familia")) ? FAMILY_STRUCTURE : SCHOOL_STRUCTURE;
  const placed = new Set<string>();

  const modules: NavModule[] = [];
  for (const def of structure) {
    const sections: NavSection[] = [];
    for (const [i, s] of def.sections.entries()) {
      const found = s.keys.map((k) => links.get(k)).filter((l): l is NavLink => Boolean(l));
      found.forEach((l) => placed.add(l.key));
      if (found.length) sections.push({ id: `${def.id}:${i}`, ...(s.label ? { label: s.label } : {}), links: found });
    }
    if (sections.length) modules.push(finish({ id: def.id, label: def.label, icon: def.icon }, sections));
  }
  // Rede de segurança: páginas novas ainda sem lugar na estrutura não desaparecem (um teste falha para as detectar).
  const rest = [...links.values()].filter((l) => !placed.has(l.key));
  if (rest.length) modules.push(finish(OTHERS, [{ id: "outros:0", links: rest }]));

  const pageCount = modules.reduce((a, m) => a + m.pageCount, 0);
  const allFlat = items.length > 0 && items.every((i) => !i.items?.length);
  const mode: SidebarMode = modules.length >= DUAL_MIN_MODULES && pageCount >= DUAL_MIN_PAGES && !allFlat ? "dual" : allFlat && items.length >= GROUPED_MIN_ITEMS ? "grouped" : "flat";
  return { mode, modules, pageCount };
}

function finish(def: NavModuleDef, sections: NavSection[]): NavModule {
  const links = sections.flatMap((s) => s.links);
  return { ...def, sections, links, pageCount: links.length, defaultUrl: links[0]!.url };
}

const matches = (pathname: string, url: string) => url !== "#" && (pathname === url || pathname.startsWith(`${url}/`));

/** Ligação mais específica (prefixo mais longo) para um caminho, dentro de um conjunto de módulos. */
export function findLink(modules: readonly NavModule[], pathname: string): { module: NavModule; section: NavSection; link: NavLink } | null {
  let best: { module: NavModule; section: NavSection; link: NavLink } | null = null;
  for (const mod of modules) {
    for (const section of mod.sections) {
      for (const link of section.links) {
        if (matches(pathname, link.url) && (!best || link.url.length > best.link.url.length)) best = { module: mod, section, link };
      }
    }
  }
  return best;
}

/**
 * Módulo ativo pelo caminho. Páginas fora do menu (ex.: «Ver todas» das notificações) não pertencem a nenhum módulo:
 * devolve `undefined` e a sidebar mostra só o rail, sem módulo destacado.
 */
export function activeModule(model: NavigationModel, pathname: string): NavModule | undefined {
  return findLink(model.modules, pathname)?.module;
}

export interface Crumb { label: string; href?: string }

/**
 * Breadcrumb derivado do registo:
 * - Página normal: no máximo 2 níveis: `Secção › Página` (ou `Módulo › Página` sem secção rotulada; ou só a página se o módulo tem uma única).
 * - Sub-página/detalhe: 3 níveis: `Secção › Página Principal (com link) › Detalhe`.
 * Nunca repete etiquetas iguais. Devolve `null` se o caminho não estiver no registo.
 */
export function deriveBreadcrumb(modules: readonly NavModule[], pathname: string, detail?: string): Crumb[] | null {
  const hit = findLink(modules, pathname);
  if (!hit) return null;
  const { module: mod, section, link } = hit;
  const group = section.label ?? (mod.pageCount > 1 ? mod.label : undefined);
  if (detail && pathname !== link.url) {
    return dedupeCrumbs([
      ...(group ? [{ label: group }] : []),
      { label: link.name, href: link.url },
      { label: detail },
    ]);
  }
  return dedupeCrumbs([...(group ? [{ label: group }] : []), { label: link.name }]);
}

/** Remove etiquetas consecutivas iguais (rede de segurança para páginas que ainda passam rótulos à mão). */
export function dedupeCrumbs(crumbs: Crumb[]): Crumb[] {
  return crumbs.filter((c, i) => i === 0 || c.label !== crumbs[i - 1]!.label);
}
