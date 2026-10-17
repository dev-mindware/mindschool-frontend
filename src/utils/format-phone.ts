/**
 * Utilitários de formatação de telefone para o padrão angolano (+244 9XX XXX XXX).
 */

export function cleanPhone(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[^0-9+]/g, "");
}

export function formatPhone(value: string | null | undefined): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");

  // Se já tiver código de país 244 no início e 12 dígitos (244 9XX XXX XXX)
  if (digits.startsWith("244") && digits.length >= 12) {
    const p = digits.slice(3);
    return `+244 ${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 9)}`;
  }

  // Se tiver 9 dígitos locais (ex: 923000000)
  if (digits.length === 9) {
    return `+244 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  // Fallback caso venha com formato diferente
  return value.trim();
}
