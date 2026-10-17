/**
 * Utilitários de formatação de BI (Bilhete de Identidade de Angola) e documentos.
 * Padrão do BI angolano: 9 dígitos + 2 letras maiúsculas + 3 dígitos (ex: 007849302LA042).
 */

export function cleanIdDocument(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function formatIdDocument(value: string | null | undefined): string {
  const clean = cleanIdDocument(value);
  if (!clean) return "—";

  // Formato padrão BI: 000000000LA000 (14 caracteres)
  if (clean.length === 14) {
    return `${clean.slice(0, 9)}${clean.slice(9, 11)}${clean.slice(11, 14)}`;
  }
  return clean;
}
