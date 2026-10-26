import { currentTerm } from "@/lib/current-term";

const terms = [
  { sequence: 1, start_date: "2026-09-01", end_date: "2026-12-18" },
  { sequence: 2, start_date: "2027-01-11", end_date: "2027-04-02" },
  { sequence: 3, start_date: "2027-04-12", end_date: "2027-07-09" },
];

describe("currentTerm", () => {
  it("escolhe o trimestre em que a data cai", () => {
    expect(currentTerm(terms, "2026-10-26")).toBe("TRIMESTER_1");
    expect(currentTerm(terms, "2027-02-01")).toBe("TRIMESTER_2");
    expect(currentTerm(terms, "2027-05-01")).toBe("TRIMESTER_3");
  });

  it("nas pausas fica o último que já começou, e antes do ano o primeiro", () => {
    expect(currentTerm(terms, "2026-12-25")).toBe("TRIMESTER_1");
    expect(currentTerm(terms, "2026-08-01")).toBe("TRIMESTER_1");
  });

  it("sem trimestres devolve o primeiro", () => {
    expect(currentTerm([], "2026-10-26")).toBe("TRIMESTER_1");
  });
});
