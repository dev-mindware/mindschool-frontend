/** Número com separadores angolanos (ex.: 1 250). Aceita string numérica da API; vazio/inválido devolve «—». */
export function formatNumber(value: string | number | null | undefined, maximumFractionDigits = 2): string {
  if (value === undefined || value === null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n.toLocaleString("pt-AO", { maximumFractionDigits }) : "—";
}

/** Percentagem (0–100) com até 1 casa decimal (ex.: 12,5%). */
export function formatPercent(value: string | number | null | undefined, maximumFractionDigits = 1): string {
  if (value === undefined || value === null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString("pt-PT", { maximumFractionDigits })}%` : "—";
}
