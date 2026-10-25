/**
 * Códigos de erro da API que merecem uma frase accionável (o que fazer a seguir), em vez do texto técnico.
 * A mensagem original da API junta-se no fim quando traz informação própria (ex.: quantas notas faltam).
 */
const CODE_HINTS: Record<string, string> = {
  CANCELLATION_DEADLINE_PASSED: "Já passou o prazo para anular esta matrícula. Fora de prazo só a Direção o pode fazer, com justificação documentada.",
  ENROLLMENT_WINDOW_CLOSED: "Está fora do período de matrículas. Fora dele só a Direção pode matricular, com justificação documentada.",
  PAUTA_INCOMPLETE: "A pauta ainda não pode fechar: faltam notas por lançar (ou a turma não tem disciplinas ou alunos).",
  PAUTA_CLOSED: "A pauta deste período está fechada e as notas já não se alteram. Use a reapreciação de nota, ou peça à Direção para reabrir a pauta.",
  COUNCIL_QUORUM: "O conselho não pode encerrar: faltam participantes presentes (mínimo definido nas Políticas) ou o presidente.",
  TIMETABLE_CONFLICT: "Este tempo choca com outro (professor, turma ou sala). Escolha outro tempo ou outro professor.",
  TIMETABLE_INVALID: "O horário tem violações obrigatórias: use «Validar» para as ver e corrigir antes de publicar.",
  SECTION_FULL: "A turma já está cheia. Escolha outra turma ou aumente a capacidade da turma.",
  PAYMENT_EXCEEDS_INVOICE: "O valor é superior ao que falta pagar nesta fatura.",
  INVOICE_NOT_PAYABLE: "Esta fatura já não aceita pagamentos (está paga ou anulada).",
  PARTIAL_PAYMENT_NOT_ALLOWED: "Esta escola fatura no MindGest: marque como pago o valor total em dívida da cobrança (não há pagamento parcial).",
  DEPENDENCY_UNAVAILABLE: "O MindGest não respondeu. O pagamento fica registado e a fatura segue quando o serviço voltar; tente de novo dentro de instantes.",
  QUOTA_EXCEEDED: "Atingiu o limite do plano contratado. Veja as quotas em Definições › Subscrição ou passe a um plano superior.",
  ENTITLEMENT_REQUIRED: "Esta funcionalidade não está incluída no plano da escola.",
  REVIEW_WINDOW_CLOSED: "Já passou o prazo para pedir a reapreciação desta nota.",
  EXAM_NOT_ADMITTED: "O aluno não cumpre as condições de admissão a esta chamada de exame.",
  ENROLLMENT_INACTIVE: "A matrícula do aluno não está ativa.",
  ADMISSION_REQUIRED: "A candidatura tem de estar aprovada antes de se converter em matrícula.",
  STATE_TRANSITION_INVALID: "Esta ação não é possível no estado atual.",
  FORBIDDEN: "O seu perfil não tem permissão para esta ação.",
};

/** Nomes legíveis dos campos que a API devolve nos erros de validação (`errors[].field`). */
const FIELD_LABELS: Record<string, string> = {
  full_name: "Nome", name: "Nome", birth_date: "Data de nascimento", document_number: "Documento", document_type: "Tipo de documento",
  phone: "Telefone", email: "E-mail", nif: "NIF", isbn: "ISBN", title: "Título", author: "Autor", code: "Sigla", profession: "Profissão",
  scheduled_at: "Data e hora", start_date: "Data de início", end_date: "Data de fim", capacity: "Capacidade", copies: "Exemplares",
  due_day: "Dia limite", due_start_day: "Dia inicial", paid_at: "Data de pagamento", reason: "Motivo", description: "Descrição",
};

/** «Documento: Minimo de 4 caracteres.» — a mensagem sozinha não diz que campo falhou. */
function describeFieldError(first: { field?: string; message?: string } | undefined): string | undefined {
  const message = first?.message;
  if (!message) return undefined;
  const key = (first.field ?? "").split(".").pop() ?? "";
  const label = FIELD_LABELS[key];
  return label && !message.toLowerCase().startsWith(label.toLowerCase()) ? `${label}: ${message}` : message;
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const data = (error as any)?.response?.data;
  const fieldError = Array.isArray(data?.errors) ? describeFieldError(data.errors[0]) : undefined;
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
