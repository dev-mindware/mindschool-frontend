/**
 * Códigos de erro da API que merecem uma frase accionável (o que fazer a seguir), em vez do texto técnico.
 * A mensagem original da API junta-se no fim quando traz informação própria (ex.: quantas notas faltam).
 */
const CODE_HINTS: Record<string, string> = {
  CANCELLATION_DEADLINE_PASSED: "Já passou o prazo para anular esta matrícula. Fora de prazo só a Direcção o pode fazer, com justificação documentada.",
  ENROLLMENT_WINDOW_CLOSED: "Está fora do período de matrículas. Fora dele só a Direcção pode matricular, com justificação documentada.",
  PAUTA_INCOMPLETE: "A pauta ainda não pode fechar: faltam notas por lançar (ou a turma não tem disciplinas ou alunos).",
  PAUTA_CLOSED: "A pauta deste período está fechada e as notas já não se alteram. Use a reapreciação de nota, ou peça à Direcção para reabrir a pauta.",
  COUNCIL_QUORUM: "O conselho não pode encerrar: faltam participantes presentes (mínimo definido nas Políticas) ou o presidente.",
  TIMETABLE_CONFLICT: "Este tempo choca com outro (professor, turma ou sala). Escolha outro tempo ou outro professor.",
  TIMETABLE_INVALID: "O horário tem violações obrigatórias: use «Validar» para as ver e corrigir antes de publicar.",
  SECTION_FULL: "A turma já está cheia. Escolha outra turma ou aumente a capacidade da turma.",
  PAYMENT_EXCEEDS_INVOICE: "O valor é superior ao que falta pagar nesta factura.",
  INVOICE_NOT_PAYABLE: "Esta factura já não aceita pagamentos (está paga ou anulada).",
  QUOTA_EXCEEDED: "Atingiu o limite do plano contratado. Veja as quotas em Definições › Subscrição ou passe a um plano superior.",
  ENTITLEMENT_REQUIRED: "Esta funcionalidade não está incluída no plano da escola.",
  REVIEW_WINDOW_CLOSED: "Já passou o prazo para pedir a reapreciação desta nota.",
  EXAM_NOT_ADMITTED: "O aluno não cumpre as condições de admissão a esta chamada de exame.",
  ENROLLMENT_INACTIVE: "A matrícula do aluno não está activa.",
  ADMISSION_REQUIRED: "A candidatura tem de estar aprovada antes de se converter em matrícula.",
  STATE_TRANSITION_INVALID: "Esta acção não é possível no estado actual.",
  FORBIDDEN: "O seu perfil não tem permissão para esta acção.",
};

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const data = (error as any)?.response?.data;
  const fieldError = Array.isArray(data?.errors) ? data.errors[0]?.message : undefined;
  const candidate =
    fieldError ||
    data?.detail ||
    (error as any)?.response?.data?.message ||
    (error as any)?.data?.message ||
    (error as any)?.message;
  const detail = typeof candidate === "string" && candidate.trim() ? candidate.trim() : "";

  const hint = typeof data?.code === "string" ? CODE_HINTS[data.code] : undefined;
  if (hint && !fieldError) {
    return detail && detail !== hint && detail.length <= 160 ? `${hint} (${detail})` : hint;
  }
  return detail || fallback;
}
