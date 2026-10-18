import { mapApiUser, mapApiSubscription, primaryRoleOf } from "@/utils/map-api-user";
import { pickPrimaryRole } from "@/utils/api-roles";

const me = {
  id: "u1",
  email: "a@escola.ao",
  full_name: "Ana Silva",
  mfa_enabled: false,
  memberships: [
    { school_id: "s1", school_name: "Colegio A", roles: ["professor", "direccao_pedagogica"] },
    { school_id: "s2", school_name: "Colegio B", roles: ["secretaria"] },
  ],
};

describe("papeis da API -> frontend", () => {
  it("escolhe o papel de maior autoridade", () => {
    expect(pickPrimaryRole(["professor", "direccao_pedagogica"])).toBe("PEDAGOGIC_DIRECTOR");
    expect(pickPrimaryRole(["desconhecido"])).toBeNull();
  });

  it("o papel depende da escola activa", () => {
    expect(primaryRoleOf(me, "s1")).toBe("PEDAGOGIC_DIRECTOR");
    expect(primaryRoleOf(me, "s2")).toBe("SECRETARY");
    expect(mapApiUser(me, "s2").company.name).toBe("Colegio B");
  });
});

describe("subscricao", () => {
  it("mapeia estado e plano", () => {
    const sub = mapApiSubscription({ subscription: { id: "x", status: "trial", plan: { code: "profissional", name: "Profissional" }, trial_ends_at: "2026-10-19", period_start: null, period_end: null } });
    expect(sub.status).toBe("TRIALING");
    expect(sub.plan.name).toBe("profissional");
  });

  it("guarda so as features contratadas e usa essencial para um codigo desconhecido", () => {
    const sub = mapApiSubscription({
      subscription: { id: "x", status: "active", plan: { code: "legado", name: "Legado" }, trial_ends_at: null, period_start: null, period_end: null },
      features: [{ key: "portal", entitled: true }, { key: "rooms", entitled: false }],
    });
    expect(sub.plan.name).toBe("essencial");
    expect(sub.entitledFeatures).toEqual(["portal"]);
  });
});
