import type { AssessmentTerm } from "@/types/grade";

interface TermLike { sequence: number; start_date: string; end_date: string }

const BY_SEQUENCE: Record<number, AssessmentTerm> = { 1: "TRIMESTER_1", 2: "TRIMESTER_2", 3: "TRIMESTER_3" };

/**
 * Trimestre em curso na data indicada. Fora de qualquer trimestre (pausas), fica o último que já começou, ou o 1.º se o ano
 * ainda não começou. Sem trimestres devolve o 1.º.
 */
export function currentTerm(terms: TermLike[], today: string = new Date().toISOString().slice(0, 10)): AssessmentTerm {
  const sorted = [...terms].sort((a, b) => a.sequence - b.sequence);
  const inside = sorted.find((t) => t.start_date.slice(0, 10) <= today && today <= t.end_date.slice(0, 10));
  const started = sorted.filter((t) => t.start_date.slice(0, 10) <= today);
  const pick = inside ?? started[started.length - 1] ?? sorted[0];
  return (pick && BY_SEQUENCE[pick.sequence]) || "TRIMESTER_1";
}
