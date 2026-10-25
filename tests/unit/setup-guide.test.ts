import { setupSteps } from "@/components/client/dashboard/setup-guide";

const done = (s: ReturnType<typeof setupSteps>) => s.map((x) => x.done);

describe("setupSteps (guia de arranque do dashboard)", () => {
  it("escola nova: nada feito, o próximo passo é o ano letivo", () => {
    const steps = setupSteps({ hasYear: false, sections: 0, subjects: 0, students: 0, enrolled: 0 });
    expect(done(steps)).toEqual([false, false, false, false, false]);
    expect(steps.find((s) => !s.done)?.key).toBe("year");
  });
  it("com ano e turmas, falta ainda registar disciplinas", () => {
    const steps = setupSteps({ hasYear: true, sections: 2, subjects: 0, students: 0, enrolled: 0 });
    expect(steps.find((s) => !s.done)?.key).toBe("subjects");
  });
  it("tudo feito: nenhum passo por fazer", () => {
    const steps = setupSteps({ hasYear: true, sections: 1, subjects: 3, students: 20, enrolled: 18 });
    expect(steps.every((s) => s.done)).toBe(true);
  });
});
