import { formatIsoDay } from "@/utils/format-date";

describe("formatIsoDay", () => {
  it("passa AAAA-MM-DD para DD/MM/AAAA sem mexer em fusos horários", () => {
    expect(formatIsoDay("2010-01-01")).toBe("01/01/2010");
    expect(formatIsoDay("2026-10-12T23:30:00.000Z")).toBe("12/10/2026");
  });

  it("devolve o que não for data como está, e um traço quando não há valor", () => {
    expect(formatIsoDay("n/d")).toBe("n/d");
    expect(formatIsoDay(null)).toBe("—");
    expect(formatIsoDay(undefined)).toBe("—");
  });
});
