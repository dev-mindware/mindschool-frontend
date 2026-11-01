import { absencesBySubject, dayMark, recordedDays, summarizeStudents, weekdaysOfMonth } from "@/lib/absence-reports";
import type { AttendanceReportData } from "@/services/coordination-service";

const data: AttendanceReportData = {
  section: { id: "s", name: "A", class_level: "7.ª Classe" },
  from: "2026-10-01",
  to: "2026-10-31",
  students: [
    { enrollment_id: "a", full_name: "Ana", process_number: "1" },
    { enrollment_id: "b", full_name: "Bruno", process_number: null },
  ],
  subjects: [
    { section_subject_id: "lp", name: "Português" },
    { section_subject_id: "mat", name: "Matemática" },
  ],
  records: [
    { enrollment_id: "a", section_subject_id: "lp", date: "2026-10-05", status: "falta_injustificada" },
    { enrollment_id: "a", section_subject_id: "mat", date: "2026-10-05", status: "falta_justificada" },
    { enrollment_id: "a", section_subject_id: "lp", date: "2026-10-06", status: "presente" },
    { enrollment_id: "a", section_subject_id: "mat", date: "2026-10-06", status: "atraso" },
    { enrollment_id: "b", section_subject_id: "lp", date: "2026-10-05", status: "presente" },
    { enrollment_id: "b", section_subject_id: "lp", date: "2026-10-06", status: "atraso" },
  ],
};

describe("summarizeStudents", () => {
  it("conta só o que foi registado e marca em risco a partir de 20% de faltas", () => {
    const [ana, bruno] = summarizeStudents(data);
    expect(ana).toMatchObject({ lessons: 4, justified: 1, unjustified: 1, late: 1, present: 1, absenceRate: 50, atRisk: true });
    expect(bruno).toMatchObject({ lessons: 2, late: 1, absenceRate: 0, atRisk: false, processNumber: "" });
  });

  it("aluno sem registos não está em risco (os dias futuros ou sem chamada não contam como falta)", () => {
    const empty = summarizeStudents({ ...data, records: [] });
    expect(empty.every((s) => s.lessons === 0 && s.absenceRate === 0 && !s.atRisk)).toBe(true);
  });
});

describe("mapa diário", () => {
  it("lista os dias registados por ordem e resume cada dia por aluno", () => {
    expect(recordedDays(data)).toEqual(["2026-10-05", "2026-10-06"]);
    expect(dayMark(data, "a", "2026-10-05")).toBe("F"); // injustificada tem prioridade sobre justificada
    expect(dayMark(data, "a", "2026-10-06")).toBe("At");
    expect(dayMark(data, "b", "2026-10-05")).toBe("P");
    expect(dayMark(data, "b", "2026-10-07")).toBe("");
  });
});

describe("faltas por disciplina", () => {
  it("soma justificadas e injustificadas por disciplina; atrasos não são faltas", () => {
    const [ana, bruno] = absencesBySubject(data);
    expect(ana.perSubject).toEqual({ lp: 1, mat: 1 });
    expect(ana.total).toBe(2);
    expect(bruno.total).toBe(0);
  });
});

describe("weekdaysOfMonth", () => {
  it("devolve só os dias úteis do mês (Outubro de 2026 tem 22)", () => {
    const days = weekdaysOfMonth("2026-10");
    expect(days).toHaveLength(22);
    expect(days[0]).toBe("2026-10-01");
    expect(days.includes("2026-10-03")).toBe(false); // sábado
  });
});
