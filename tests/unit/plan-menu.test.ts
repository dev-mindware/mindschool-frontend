import { menuItems } from "@/constants/menu-items";
import { PAGES } from "@/constants/navigation-registry";
import { getSidebarForUser } from "@/lib/get-sidebar-for-user";
import { isEntitled } from "@/lib/plan-access";
import { SubscriptionStatus, type PlanType, type Subscription } from "@/types";

// O registo importa o barrel de componentes (Icon); aqui só interessa a estrutura.
jest.mock("@/components", () => ({ Icon: () => null }));

const sub = (plan: PlanType, extra: Partial<Subscription> = {}) =>
  ({ status: SubscriptionStatus.ACTIVE, plan: { name: plan }, ...extra }) as unknown as Subscription;

type State = "oculto" | "cadeado" | "aberto";

/** Estado de cada URL no menu do director para a subscrição dada. */
const states = (s: Subscription | undefined, urls: string[]): Record<string, State> => {
  const list = getSidebarForUser(menuItems.items, "DIRECTOR_GENERAL", s).flatMap((i) => (i.items?.length ? i.items : [i]));
  return Object.fromEntries(
    urls.map((url) => {
      const page = list.find((p) => p.url === url);
      return [url, !page ? "oculto" : page.showUpgrade ? "cadeado" : "aberto"] as const;
    }),
  );
};
const all = (urls: string[], state: State) => Object.fromEntries(urls.map((u) => [u, state]));

// O calendário é núcleo: no Essencial mostra dias lectivos e feriados; o calendário geral é do Profissional (decidido na página).
const CORE = ["/students/list", "/tuition/payments", "/academic/timetables", "/academic/calendar", "/academic/library", "/plans"];
const TEASERS = ["/academic/lessons", "/dropout-risk", "/online-exams"];
const PRO_ONLY = ["/teachers-attendance", "/academic/health-psychology", "/academic/transport", "/academic/extracurricular"];
const ENTERPRISE_ONLY = ["/tuition/collections", "/reports/multi-school", "/reports/bi", "/certificates/archive"];

describe("menu por plano", () => {
  it("Essencial: núcleo aberto, montras com cadeado, o resto oculto", () => {
    expect(states(sub("essencial"), CORE)).toEqual(all(CORE, "aberto"));
    expect(states(sub("essencial"), TEASERS)).toEqual(all(TEASERS, "cadeado"));
    expect(states(sub("essencial"), [...PRO_ONLY, ...ENTERPRISE_ONLY])).toEqual(all([...PRO_ONLY, ...ENTERPRISE_ONLY], "oculto"));
  });

  it("Profissional: abre montras e serviços escolares; cobrança por e-mail e multi-escola continuam ocultas", () => {
    expect(states(sub("profissional"), [...TEASERS, ...PRO_ONLY])).toEqual(all([...TEASERS, ...PRO_ONLY], "aberto"));
    expect(states(sub("profissional"), ENTERPRISE_ONLY)).toEqual(all(ENTERPRISE_ONLY, "oculto"));
  });

  it("Enterprise vê tudo, sem cadeados", () => {
    const urls = [...CORE, ...TEASERS, ...PRO_ONLY, ...ENTERPRISE_ONLY];
    expect(states(sub("enterprise"), urls)).toEqual(all(urls, "aberto"));
  });

  it("um add-on ganha à hierarquia: Essencial com email_collections vê a cobrança por e-mail", () => {
    const s = sub("essencial", { entitledFeatures: ["portal", "email_collections"] });
    expect(states(s, ["/tuition/collections", "/reports/multi-school"])).toEqual({ "/tuition/collections": "aberto", "/reports/multi-school": "oculto" });
  });

  it("sem subscrição (família) o plano não filtra", () => {
    expect(isEntitled({ minPlan: "enterprise", feature: "multi_school" }, undefined)).toBe(true);
  });

  it("subscrição por pagar: conta só o plano escolhido, ignorando features ainda inexistentes", () => {
    const s = sub("essencial", { status: SubscriptionStatus.PENDING, entitledFeatures: ["teacher_attendance"] });
    expect(states(s, ["/teachers-attendance"])).toEqual({ "/teachers-attendance": "oculto" });
  });

  it("o registo só usa códigos de plano da API (nada de Base/Smart/Pro)", () => {
    const used = [...new Set(PAGES.map((p) => p.minPlan).filter(Boolean))];
    expect(used.filter((p) => !["essencial", "profissional", "enterprise"].includes(p as string))).toEqual([]);
  });
});
