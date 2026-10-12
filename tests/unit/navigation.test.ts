import { menuItems } from "@/constants/menu-items";
import { MAX_PAGES_PER_MODULE, PLACED_KEYS, activeModule, buildNavigation, dedupeCrumbs, deriveBreadcrumb, findLink, linkKey } from "@/constants/navigation";
import { findMatchingMenuItem } from "@/lib/find-menu-item";
import { getSidebarForUser } from "@/lib/get-sidebar-for-user";
import type { Role } from "@/types";

// O registo importa o barrel de componentes (Icon); aqui só interessa a estrutura.
jest.mock("@/components", () => ({ Icon: () => null }));

const ROLES = ["DIRECTOR_GENERAL", "OWNER", "MANAGER", "PEDAGOGIC_DIRECTOR", "SECRETARY", "FINANCIAL", "TEACHER", "MED_AUDITOR", "GUARDIAN", "STUDENT", "SYSTEM_ADMIN", "ADMIN"] as const;
const visible = (role: Role) => getSidebarForUser(menuItems.items, role, undefined, undefined);
const forRole = (role: Role) => buildNavigation(visible(role));

describe("navegação modular", () => {
  it("todas as páginas do menu têm lugar na estrutura (nada cai em «Outros»)", () => {
    const keys = menuItems.items.flatMap((i) => (i.items?.length ? i.items.map((s) => linkKey(s.name, s.url)) : i.url !== "#" ? [linkKey(i.name, i.url)] : []));
    expect(keys.filter((k) => !PLACED_KEYS.has(k))).toEqual([]);
    for (const role of ROLES) expect(forRole(role as Role).modules.some((m) => m.id === "outros")).toBe(false);
  });

  it.each(ROLES)("%s: nenhum módulo passa de %d páginas", (role) => {
    for (const m of forRole(role as Role).modules) expect({ id: m.id, ok: m.pageCount <= MAX_PAGES_PER_MODULE }).toEqual({ id: m.id, ok: true });
  });

  it.each(ROLES)("%s tem Configurações", (role) => {
    expect(forRole(role as Role).modules.flatMap((m) => m.links).some((l) => l.url === "/settings")).toBe(true);
  });

  it.each([
    ["DIRECTOR_GENERAL", "dual"], ["OWNER", "dual"], ["ADMIN", "dual"], ["MANAGER", "dual"], ["PEDAGOGIC_DIRECTOR", "dual"], ["SECRETARY", "dual"], ["TEACHER", "dual"],
    ["FINANCIAL", "flat"], ["MED_AUDITOR", "flat"], ["SYSTEM_ADMIN", "flat"],
    ["GUARDIAN", "grouped"], ["STUDENT", "grouped"],
  ] as const)("%s usa o modo %s", (role, mode) => {
    expect(forRole(role as Role).mode).toBe(mode);
  });

  it("administrador de sistema: não vê menus de escola (a administração vive no painel próprio) e sem menus de escola", () => {
    const items = visible("SYSTEM_ADMIN");
    expect(items.every((i) => !i.items?.length)).toBe(true);
    expect(items.map((i) => i.url)).toEqual(["/dashboard", "/settings"]);
    expect(items.some((i) => i.name === "Alunos & Matrículas")).toBe(false);
  });

  it.each(ROLES)("%s tem dashboard", (role) => {
    expect(forRole(role as Role).modules.flatMap((m) => m.links).some((l) => l.url === "/dashboard")).toBe(true);
  });

  it.each(["DIRECTOR_GENERAL", "OWNER", "MANAGER", "PEDAGOGIC_DIRECTOR", "SECRETARY", "TEACHER", "ADMIN"] as const)(
    "%s (modular): Início só tem a dashboard do papel",
    (role) => {
      const mods = forRole(role as Role).modules;
      expect(mods[0]!.id).toBe("inicio");
      expect(mods[0]!.links.map((l) => l.url)).toEqual(["/dashboard"]);
    },
  );

  it.each(["DIRECTOR_GENERAL", "OWNER", "MANAGER", "PEDAGOGIC_DIRECTOR", "SECRETARY", "TEACHER", "ADMIN"] as const)(
    "%s (modular): Configurações é o último módulo, só com a página de configurações",
    (role) => {
      const mods = forRole(role as Role).modules;
      const last = mods[mods.length - 1]!;
      expect(last.id).toBe("configuracoes");
      expect(last.links.map((l) => l.url)).toEqual(["/settings"]);
    },
  );

  it("o director vê as páginas repartidas por módulos pela ordem do rail", () => {
    const nav = forRole("DIRECTOR_GENERAL");
    expect(nav.modules.map((m) => m.id)).toEqual(["inicio", "secretaria", "academico", "avaliacao", "vida", "financeiro", "relatorios", "configuracoes"]);
    expect(nav.pageCount).toBe(nav.modules.reduce((a, m) => a + m.pageCount, 0));
    expect(nav.modules.find((m) => m.id === "academico")!.pageCount).toBe(8);
  });

  it("encarregado e aluno ficam em três grupos rotulados, com Configurações em «Conta»", () => {
    const nav = forRole("GUARDIAN");
    expect(nav.modules.map((m) => m.label)).toEqual(["Acompanhamento", "Serviços", "Conta"]);
    expect(nav.modules[2]!.links.map((l) => l.url)).toEqual(["/settings"]);
  });

  it("cada ligação de um módulo tem ícone (a sidebar colapsada só mostra ícones)", () => {
    for (const m of forRole("DIRECTOR_GENERAL").modules) for (const l of m.links) expect(l.icon).toBeTruthy();
  });

  // Regressão: «Início» (família) e «Dashboard» (escola) partilham /dashboard; o controlo de acesso por rota não pode recusar
  // ao papel certo uma página que o próprio menu lhe mostra.
  it.each(ROLES)("%s pode abrir todas as páginas do seu menu (acesso por rota)", (role) => {
    for (const m of forRole(role as Role).modules) {
      for (const l of m.links) {
        const item = findMatchingMenuItem(l.url, role as Role);
        expect({ url: l.url, ok: !item?.roles || item.roles.includes(role as Role) }).toEqual({ url: l.url, ok: true });
      }
    }
  });

  it("páginas fora do menu (notificações) não pertencem a nenhum módulo: nada fica activo", () => {
    const nav = forRole("DIRECTOR_GENERAL");
    expect(activeModule(nav, "/notifications")).toBeUndefined();
    expect(activeModule(nav, "/academic/classes")!.id).toBe("academico");
  });

  describe("breadcrumb", () => {
    const modules = forRole("DIRECTOR_GENERAL").modules;

    it("deriva Secção › Página (2 níveis, sem o módulo)", () => {
      expect(deriveBreadcrumb(modules, "/grades/reviews")!.map((c) => c.label)).toEqual(["Avaliações & Pautas", "Reapreciação de Notas"]);
      expect(deriveBreadcrumb(modules, "/academic/classes")!.map((c) => c.label)).toEqual(["Gestão Académica", "Turmas"]);
      expect(deriveBreadcrumb(modules, "/academic/library")!.map((c) => c.label)).toEqual(["Serviços ao aluno", "Biblioteca Escolar"]);
    });

    it.each(ROLES)("%s: nenhuma página tem mais de 2 níveis de breadcrumb", (role) => {
      const mods = forRole(role as Role).modules;
      for (const m of mods) for (const l of m.links) {
        expect({ url: l.url, ok: deriveBreadcrumb(mods, l.url)!.length <= 2 }).toEqual({ url: l.url, ok: true });
        expect({ url: l.url, ok: deriveBreadcrumb(mods, `${l.url}/detalhe`, "Detalhe")!.length <= 2 }).toEqual({ url: l.url, ok: true });
      }
    });

    it("módulos de uma só página mostram só a página (Dashboard, Configurações)", () => {
      expect(deriveBreadcrumb(modules, "/dashboard")!.map((c) => c.label)).toEqual(["Dashboard"]);
      expect(deriveBreadcrumb(modules, "/settings")!.map((c) => c.label)).toEqual(["Configurações"]);
    });

    it("o detalhe só conta em sub-páginas e passa a «Página › Detalhe»; nunca repete etiquetas", () => {
      expect(deriveBreadcrumb(modules, "/tuition/payments", "Propinas")!.map((c) => c.label)).toEqual(["Propinas & Finanças", "Propinas"]);
      expect(deriveBreadcrumb(modules, "/tuition/invoices/123", "Detalhe")!.map((c) => c.label)).toEqual(["Facturas", "Detalhe"]);
    });

    it("não duplica «Financeiro › Financeiro» na área da família", () => {
      const family = forRole("GUARDIAN").modules;
      expect(deriveBreadcrumb(family, "/familia/financeiro", "Financeiro")!.map((c) => c.label)).toEqual(["Serviços", "Financeiro"]);
      expect(deriveBreadcrumb(family, "/familia/provas/abc", "Realizar prova")!.map((c) => c.label)).toEqual(["Provas Online", "Realizar prova"]);
    });

    it("caminhos fora do registo devolvem null e dedupeCrumbs limpa repetidos", () => {
      expect(deriveBreadcrumb(modules, "/rota/inexistente")).toBeNull();
      expect(dedupeCrumbs([{ label: "A" }, { label: "A" }, { label: "B" }]).map((c) => c.label)).toEqual(["A", "B"]);
    });

    it("usa a ligação mais específica", () => {
      expect(findLink(modules, "/tuition/submissions")!.link.name).toBe("Comprovativos");
      expect(findLink(modules, "/tuition")!.link.name).toBe("Visão geral");
    });
  });
});
