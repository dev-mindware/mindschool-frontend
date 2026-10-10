import { MODULES, PAGES, SCHOOL_ROLES } from "@/constants/navigation-registry";
import { linkKey } from "@/constants/navigation";

// O registo é a única fonte de verdade da navegação: estes testes impedem entradas inconsistentes.
jest.mock("@/components", () => ({ Icon: () => null }));

describe("registo único de navegação", () => {
  it("todas as páginas apontam para um módulo e uma secção que existem", () => {
    for (const p of PAGES) {
      const mod = MODULES.find((m) => m.id === p.module);
      expect({ page: p.url, module: p.module, ok: Boolean(mod) }).toEqual({ page: p.url, module: p.module, ok: true });
      if (p.section) expect({ page: p.url, section: p.section, ok: mod!.sections.some((s) => s.label === p.section) }).toEqual({ page: p.url, section: p.section, ok: true });
      else expect({ page: p.url, ok: mod!.sections.some((s) => !s.label) }).toEqual({ page: p.url, ok: true });
    }
  });

  it("não há páginas repetidas (a chave identifica a página; só /dashboard e /settings se repetem entre públicos)", () => {
    const seen = new Map<string, string>();
    for (const p of PAGES) {
      const k = `${linkKey(p.name, p.url)}|${MODULES.find((m) => m.id === p.module)!.audience}`;
      expect({ k, dup: seen.has(k) }).toEqual({ k, dup: false });
      seen.set(k, p.url);
    }
  });

  it("cada página tem papéis e ícone; a escola e a família não partilham papéis", () => {
    for (const p of PAGES) {
      expect({ url: p.url, roles: p.roles.length > 0, icon: Boolean(p.icon) }).toEqual({ url: p.url, roles: true, icon: true });
      const audience = MODULES.find((m) => m.id === p.module)!.audience;
      const family = p.roles.some((r) => r === "GUARDIAN" || r === "STUDENT");
      expect({ url: p.url, ok: family === (audience === "family") }).toEqual({ url: p.url, ok: true });
    }
    expect(SCHOOL_ROLES).not.toContain("GUARDIAN");
  });

  it("os módulos da escola terminam em Configurações e cada módulo declarado tem páginas", () => {
    const school = MODULES.filter((m) => m.audience === "school");
    expect(school[school.length - 1]!.id).toBe("configuracoes");
    for (const m of MODULES) expect({ id: m.id, pages: PAGES.some((p) => p.module === m.id) }).toEqual({ id: m.id, pages: true });
  });
});
