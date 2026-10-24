import { suggestAcademicYear, validateAcademicYear, type AcademicYearDraft } from "@/lib/academic-year";

const ok: AcademicYearDraft = {
  name: "2026/2027",
  start_date: "2026-09-01",
  end_date: "2027-07-31",
  enrollment_open_date: "2026-06-01",
  enrollment_close_date: "2026-10-31",
};

describe("suggestAcademicYear", () => {
  it("de Agosto em diante sugere o ano que começa nesse ano", () => {
    expect(suggestAcademicYear(new Date(2026, 9, 24)).name).toBe("2026/2027"); // 24 de Outubro
    expect(suggestAcademicYear(new Date(2026, 7, 1)).name).toBe("2026/2027"); // 1 de Agosto
  });

  it("antes de Agosto sugere o ano que está a decorrer", () => {
    expect(suggestAcademicYear(new Date(2027, 2, 10)).name).toBe("2026/2027"); // 10 de Março
    expect(suggestAcademicYear(new Date(2027, 6, 31)).name).toBe("2026/2027"); // 31 de Julho
  });

  it("a sugestão é válida", () => {
    expect(validateAcademicYear(suggestAcademicYear(new Date(2026, 9, 24)))).toEqual({});
  });
});

describe("validateAcademicYear", () => {
  it("aceita um ano completo e coerente", () => {
    expect(validateAcademicYear(ok)).toEqual({});
  });

  it("recusa nome fora de AAAA/AAAA ou com anos não seguidos", () => {
    expect(validateAcademicYear({ ...ok, name: "2026" }).name).toMatch(/AAAA\/AAAA/);
    expect(validateAcademicYear({ ...ok, name: "2026/2028" }).name).toMatch(/seguinte/);
  });

  it("exige todas as datas", () => {
    const e = validateAcademicYear({ ...ok, start_date: "", enrollment_open_date: "" });
    expect(e.start_date).toBeDefined();
    expect(e.enrollment_open_date).toBeDefined();
  });

  it("o fim tem de ser depois do início", () => {
    expect(validateAcademicYear({ ...ok, end_date: "2026-09-01" }).end_date).toBeDefined();
  });

  it("as matrículas abrem antes de fechar e fecham até ao fim do ano", () => {
    expect(validateAcademicYear({ ...ok, enrollment_close_date: "2026-05-01" }).enrollment_close_date).toMatch(/antes da abertura/);
    expect(validateAcademicYear({ ...ok, enrollment_close_date: "2027-08-15" }).enrollment_close_date).toMatch(/fim do ano/);
  });
});
