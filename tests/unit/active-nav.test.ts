import { activeNavUrl } from "@/lib/active-nav";

const urls = ["/tuition", "/tuition/payments", "/tuition/invoices", "/tuition/plans"];

describe("activeNavUrl", () => {
  it("destaca só a página atual, não o pai", () => {
    expect(activeNavUrl("/tuition/payments", urls)).toBe("/tuition/payments");
    expect(activeNavUrl("/tuition/invoices", urls)).toBe("/tuition/invoices");
  });
  it("destaca o pai quando é ele que está aberto", () => {
    expect(activeNavUrl("/tuition", urls)).toBe("/tuition");
  });
  it("uma subpágina sem link próprio destaca o pai mais próximo", () => {
    expect(activeNavUrl("/tuition/payments/123", urls)).toBe("/tuition/payments");
    expect(activeNavUrl("/tuition/other", urls)).toBe("/tuition");
  });
  it("nada fora do menu fica destacado", () => {
    expect(activeNavUrl("/students", urls)).toBeUndefined();
  });
});
