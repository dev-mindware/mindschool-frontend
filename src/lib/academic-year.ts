/**
 * Ano letivo a criar (corpo de `POST /academic-years`). As regras espelham as da API para o erro aparecer antes do pedido:
 * nome `AAAA/AAAA` com anos seguidos, fim depois do início e matrículas dentro do ano.
 */
export interface AcademicYearDraft {
  name: string;
  start_date: string;
  end_date: string;
  enrollment_open_date: string;
  enrollment_close_date: string;
}

export type AcademicYearErrors = Partial<Record<keyof AcademicYearDraft, string>>;

/** Ano letivo sugerido para hoje: começa a 1 de Setembro; de Agosto em diante já é o do ano que começa. */
export function suggestAcademicYear(today: Date = new Date()): AcademicYearDraft {
  const y = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  return {
    name: `${y}/${y + 1}`,
    start_date: `${y}-09-01`,
    end_date: `${y + 1}-07-31`,
    enrollment_open_date: `${y}-06-01`,
    enrollment_close_date: `${y}-10-31`,
  };
}

/** Datas ISO `AAAA-MM-DD` comparam-se como texto. */
export function validateAcademicYear(v: AcademicYearDraft): AcademicYearErrors {
  const e: AcademicYearErrors = {};
  const name = v.name.trim();
  if (!/^\d{4}\/\d{4}$/.test(name)) e.name = "Use o formato AAAA/AAAA (ex.: 2026/2027).";
  else if (Number(name.slice(5)) !== Number(name.slice(0, 4)) + 1) e.name = "O segundo ano deve ser o seguinte ao primeiro.";

  (["start_date", "end_date", "enrollment_open_date", "enrollment_close_date"] as const).forEach((k) => {
    if (!v[k]) e[k] = "Indique a data.";
  });
  if (!e.start_date && !e.end_date && v.start_date >= v.end_date) e.end_date = "O fim tem de ser depois do início.";
  if (!e.enrollment_open_date && !e.enrollment_close_date && v.enrollment_open_date > v.enrollment_close_date) {
    e.enrollment_close_date = "O fecho não pode ser antes da abertura das matrículas.";
  }
  if (!e.enrollment_close_date && !e.end_date && v.enrollment_close_date > v.end_date) {
    e.enrollment_close_date = "As matrículas têm de fechar até ao fim do ano letivo.";
  }
  return e;
}
