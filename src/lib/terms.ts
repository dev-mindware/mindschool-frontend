/**
 * Último período lectivo já iniciado (o que um boletim «do último período» deve usar). Se nenhum começou ainda, o último por ordem.
 * Datas ISO `AAAA-MM-DD` comparam-se como texto.
 */
export function lastTerm<T extends { sequence: number; start_date: string }>(terms: T[], today: Date = new Date()): T | undefined {
  const iso = today.toISOString().slice(0, 10);
  const started = terms.filter((t) => t.start_date <= iso);
  const pool = started.length > 0 ? started : terms;
  return [...pool].sort((a, b) => b.sequence - a.sequence)[0];
}
