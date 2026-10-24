import { lastTerm } from "@/lib/terms";

const terms = [
  { sequence: 1, start_date: "2026-09-01" },
  { sequence: 2, start_date: "2027-01-05" },
  { sequence: 3, start_date: "2027-04-12" },
];

describe("lastTerm", () => {
  it("devolve o último período já iniciado", () => {
    expect(lastTerm(terms, new Date("2026-10-24"))?.sequence).toBe(1);
    expect(lastTerm(terms, new Date("2027-02-10"))?.sequence).toBe(2);
    expect(lastTerm(terms, new Date("2027-06-01"))?.sequence).toBe(3);
  });

  it("antes de qualquer período começar, devolve o último por ordem", () => {
    expect(lastTerm(terms, new Date("2026-08-01"))?.sequence).toBe(3);
  });

  it("sem períodos devolve undefined", () => {
    expect(lastTerm([], new Date("2026-10-24"))).toBeUndefined();
  });
});
