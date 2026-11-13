/**
 * Normalizador central de erros para utilizadores leigos em Português de Angola (AO45).
 *
 * Regras:
 * 1. Explicar o que aconteceu e o que fazer a seguir em linguagem clara.
 * 2. Nunca exibir códigos HTTP, request_id, digest, rotas técnicas, nomes Prisma/SQL
 *    ou mensagens cruas em inglês na interface do utilizador.
 */

export interface ApiFieldIssue {
  field?: string;
  code?: string;
  message?: string;
}

export interface ApiProblemData {
  code?: string;
  title?: string;
  detail?: string;
  message?: string;
  status?: number;
  retry_after?: number;
  retry_after_seconds?: number;
  errors?: ApiFieldIssue[];
}

/**
 * Códigos de erro estruturados devolvidos pelo `mindschool-api` traduzidos para
 * orientação prática ao utilizador final (100% PT-AO45).
 */
export const CODE_HINTS: Record<string, string> = {
  VALIDATION_ERROR: "Alguns campos precisam de ser corrigidos antes de guardar. Verifique os avisos assinalados.",
  BAD_REQUEST: "Os dados enviados estão incompletos ou num formato inválido. Reveja o formulário e tente novamente.",
  UNAUTHENTICATED: "A sua sessão terminou ou ainda não iniciou sessão. Entre novamente para continuar.",
  MFA_REQUIRED: "Introduza o código de verificação em dois factores ou confirme com a sua chave de segurança.",
  MFA_ENROLLMENT_REQUIRED: "O seu perfil exige verificação em dois factores activa. Active-a primeiro nas definições de segurança da sua conta.",
  STEP_UP_REQUIRED: "Por motivos de segurança, confirme novamente a sua palavra-passe antes de concluir esta acção.",
  FORBIDDEN: "O seu perfil não tem permissão para realizar esta acção. Se precisar de acesso, fale com a Direcção da escola.",
  RESOURCE_NOT_FOUND: "Não foi possível encontrar o registo pedido. Pode já ter sido removido ou não existir nesta escola.",
  CONFLICT: "Esta acção entra em conflito com dados já existentes. Actualize a página e verifique antes de tentar de novo.",
  IDEMPOTENCY_CONFLICT: "Este pedido já está a ser processado neste momento. Aguarde alguns instantes e não repita o envio.",
  STATE_TRANSITION_INVALID: "Esta acção não é permitida no estado actual deste registo.",
  ADMISSION_REQUIRED: "O candidato tem de ter a candidatura aprovada antes de poder ser matriculado.",
  ENROLLMENT_WINDOW_CLOSED: "Está fora do período normal de matrículas. Fora do prazo, apenas a Direcção pode matricular com justificação documentada.",
  ENROLLMENT_INACTIVE: "A matrícula deste aluno não está activa para esta acção.",
  CANCELLATION_DEADLINE_PASSED: "Já passou o prazo normal para anular esta matrícula. Fora de prazo, apenas a Direcção o pode fazer com justificação documentada.",
  SECTION_FULL: "Esta turma ou sessão já atingiu a lotação máxima. Escolha outra opção ou aumente as vagas disponíveis.",
  PAUTA_CLOSED: "A pauta deste período está fechada e já não aceita alterações directas. Use a reapreciação de nota ou peça à Direcção Pedagógica para a reabrir.",
  IMPERSONATION_READ_ONLY: "Esta sessão de apoio está apenas em modo de consulta e não permite alterar ou apagar dados.",
  PAUTA_INCOMPLETE: "A pauta ainda não pode fechar porque faltam notas por lançar, disciplinas atribuídas ou correcções pendentes.",
  REVIEW_WINDOW_CLOSED: "Já terminou o prazo para pedir a reapreciação desta nota.",
  EXAM_NOT_ADMITTED: "O aluno não cumpre as condições necessárias para realizar este exame.",
  COUNCIL_QUORUM: "O conselho de turma ainda não pode encerrar: falta o presidente ou o número mínimo de participantes presentes.",
  PAYMENT_EXCEEDS_INVOICE: "O valor indicado é superior ao montante que falta pagar nesta factura.",
  PARTIAL_PAYMENT_NOT_ALLOWED: "Esta escola emite facturas integradas no MindGest: o pagamento tem de corresponder ao valor total em dívida.",
  INVOICE_NOT_PAYABLE: "Esta factura já não aceita pagamentos porque já está liquidada ou anulada.",
  IDEMPOTENCY_KEY_REQUIRED: "Não foi possível confirmar a segurança deste envio. Actualize a página e tente novamente.",
  PRECONDITION_FAILED: "Estes dados foram alterados entretanto por outro utilizador. Actualize a página para ver a versão mais recente.",
  TIMETABLE_CONFLICT: "Este tempo choca com outra aula do mesmo professor, turma ou sala. Escolha outro horário ou sala.",
  TIMETABLE_INVALID: "O horário tem regras obrigatórias por corrigir. Use «Validar» para as ver antes de publicar.",
  CALENDAR_INVALID: "As datas escolhidas são inválidas ou ultrapassam os limites do ano lectivo.",
  INTEGRATION_ERROR: "Um serviço externo ligado à escola não respondeu como esperado. Tente novamente dentro de instantes.",
  RATE_LIMITED: "Foram feitas demasiadas tentativas seguidas. Aguarde alguns instantes e tente novamente.",
  QUOTA_EXCEEDED: "A escola atingiu o limite do plano contratado. Consulte os limites em Definições ou actualize o plano.",
  ENTITLEMENT_REQUIRED: "Esta funcionalidade não faz parte do plano actualmente contratado pela escola.",
  ACCOUNT_LOCKED: "Esta conta foi temporariamente bloqueada por segurança. Aguarde alguns minutos e tente novamente.",
  DEPENDENCY_UNAVAILABLE: "Um serviço ligado à escola não respondeu neste momento. O seu registo principal continua seguro; tente novamente dentro de instantes.",
  FEATURE_DISABLED: "Esta funcionalidade encontra-se desactivada para a sua escola de momento.",
  SUBSCRIPTION_SUSPENDED: "A subscrição desta escola encontra-se suspensa. Regularize a situação em Definições para reactivar esta acção.",
  INVALID_JSON: "Os dados enviados ficaram incompletos durante a transmissão. Actualize a página e tente novamente.",
  INVALID_QUERY: "Os critérios de pesquisa não são válidos. Limpe os filtros e tente novamente.",
  INVALID_FILTER: "Um dos filtros seleccionados não é válido. Limpe os filtros e tente novamente.",
  DUPLICATE_RESOURCE: "Já existe um registo com estes mesmos dados. Verifique a lista antes de criar um novo.",
  PRECONDITION_REQUIRED: "Actualize os dados da página antes de guardar esta alteração.",
  METHOD_NOT_ALLOWED: "Esta acção não é permitida aqui. Actualize a página e utilize o botão habitual.",
  PAYLOAD_TOO_LARGE: "O ficheiro ou os dados enviados são demasiado grandes. Reduza o tamanho do ficheiro e tente novamente.",
  UNSUPPORTED_MEDIA_TYPE: "O formato do ficheiro enviado não é aceite. Verifique os formatos permitidos e tente novamente.",
  FILE_VALIDATION_FAILED: "O ficheiro seleccionado não é válido ou está danificado. Escolha outro ficheiro e tente novamente.",
  SERVICE_UNAVAILABLE: "O sistema está temporariamente indisponível ou em manutenção. Aguarde uns momentos e tente novamente.",
  REQUEST_TIMEOUT: "O servidor demorou demasiado tempo a responder. Verifique a sua ligação à Internet e tente novamente.",
  NOT_IMPLEMENTED: "Esta opção ainda não se encontra disponível no sistema.",
  INTERNAL_ERROR: "Ocorreu um problema inesperado no sistema ao processar o pedido. Tente novamente dentro de instantes ou contacte a secretaria.",
};

const PREFER_DETAIL_ONLY_CODES = new Set([
  "CONFLICT",
  "DUPLICATE_RESOURCE",
  "RESOURCE_NOT_FOUND",
]);

const HIDE_DETAIL_CODES = new Set([
  "INTERNAL_ERROR",
  "SERVICE_UNAVAILABLE",
  "REQUEST_TIMEOUT",
  "INVALID_JSON",
  "INVALID_QUERY",
  "INVALID_FILTER",
  "METHOD_NOT_ALLOWED",
  "NOT_IMPLEMENTED",
  "IDEMPOTENCY_KEY_REQUIRED",
  "MFA_REQUIRED",
  "MFA_ENROLLMENT_REQUIRED",
  "STEP_UP_REQUIRED",
  "IMPERSONATION_READ_ONLY",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
]);

const GENERIC_API_TITLES = new Set([
  "conflito",
  "conflito com dados existentes",
  "recurso não encontrado",
  "registo não encontrado",
  "erro interno",
  "ocorreu um problema no servidor",
  "pedido inválido",
  "existem dados por corrigir",
  "dados inválidos",
  "acesso negado",
  "sem permissão para esta acção",
]);

/** Nomes legíveis dos campos que a API devolve nos erros de validação (`errors[].field`). */
const FIELD_LABELS: Record<string, string> = {
  full_name: "Nome", fullName: "Nome", name: "Nome", first_name: "Nome próprio", last_name: "Apelido",
  birth_date: "Data de nascimento", birthDate: "Data de nascimento", gender: "Género", nationality: "Nacionalidade",
  document_number: "Documento", documentNumber: "Documento", document_type: "Tipo de documento", documentType: "Tipo de documento",
  phone: "Telefone", alternative_phone: "Telefone alternativo", email: "E-mail", password: "Palavra-passe",
  nif: "NIF", tax_number: "NIF", taxNumber: "NIF", iban: "IBAN", swift: "SWIFT/BIC",
  account_number: "Número de conta", accountNumber: "Número de conta", bank_name: "Banco", bankName: "Banco",
  account_holder: "Titular", accountHolder: "Titular",
  isbn: "ISBN", title: "Título", author: "Autor", code: "Código", profession: "Profissão", address: "Morada",
  province: "Província", municipality: "Município", district: "Distrito",
  scheduled_at: "Data e hora", date: "Data", start_date: "Data de início", startDate: "Data de início",
  end_date: "Data de fim", endDate: "Data de fim", enrollment_close_date: "Data limite de matrícula",
  capacity: "Capacidade", copies: "Exemplares", qualification: "Habilitação",
  due_day: "Dia limite", dueDay: "Dia limite", due_start_day: "Dia inicial", dueStartDay: "Dia inicial",
  due_date: "Data de vencimento", dueDate: "Data de vencimento", paid_at: "Data de pagamento", paidOn: "Data de pagamento",
  amount: "Valor", total_amount: "Valor total", discount: "Desconto", payment_method: "Método de pagamento", paymentMethod: "Método de pagamento",
  reference: "Referência", invoice_id: "Factura", invoice_ids: "Facturas",
  reason: "Motivo", justification: "Justificação", description: "Descrição", notes: "Observações",
  exam_score: "Nota", score: "Nota", grade: "Nota",
  academic_year_id: "Ano lectivo", academicYearId: "Ano lectivo", term_id: "Período", termId: "Período",
  class_level_id: "Classe", classLevelId: "Classe", section_id: "Turma", sectionId: "Turma",
  subject_id: "Disciplina", subjectId: "Disciplina", student_id: "Aluno", studentId: "Aluno",
  teacher_id: "Professor", teacherId: "Professor", guardian_id: "Encarregado", guardianId: "Encarregado",
  room_id: "Sala", roomId: "Sala", stop_id: "Paragem", route_id: "Rota",
  file: "Ficheiro", content_base64: "Ficheiro", proof: "Comprovativo", avatar: "Fotografia",
  token: "Ligação de recuperação", code_mfa: "Código de verificação", totp_code: "Código de verificação",
  from: "Data inicial", to: "Data final", attendees: "Participantes",
};

const HTTP_STATUS_FALLBACKS: Record<number, string> = {
  400: CODE_HINTS.BAD_REQUEST,
  401: CODE_HINTS.UNAUTHENTICATED,
  402: CODE_HINTS.SUBSCRIPTION_SUSPENDED,
  403: CODE_HINTS.FORBIDDEN,
  404: CODE_HINTS.RESOURCE_NOT_FOUND,
  405: CODE_HINTS.METHOD_NOT_ALLOWED,
  408: CODE_HINTS.REQUEST_TIMEOUT,
  409: CODE_HINTS.CONFLICT,
  412: CODE_HINTS.PRECONDITION_FAILED,
  413: CODE_HINTS.PAYLOAD_TOO_LARGE,
  415: CODE_HINTS.UNSUPPORTED_MEDIA_TYPE,
  422: CODE_HINTS.VALIDATION_ERROR,
  423: CODE_HINTS.ACCOUNT_LOCKED,
  428: CODE_HINTS.PRECONDITION_REQUIRED,
  429: CODE_HINTS.RATE_LIMITED,
  500: CODE_HINTS.INTERNAL_ERROR,
  501: CODE_HINTS.NOT_IMPLEMENTED,
  502: "O servidor não conseguiu responder neste momento. Aguarde alguns instantes e tente novamente.",
  503: CODE_HINTS.SERVICE_UNAVAILABLE,
  504: CODE_HINTS.REQUEST_TIMEOUT,
};

const TECHNICAL_PATTERNS: RegExp[] = [
  /request failed with status code\s+\d+/i,
  /timeout of \d+\s*ms exceeded/i,
  /^(network error|failed to fetch|load failed|abort(ed)?|canceled)$/i,
  /\b(axioserror|typeerror|syntaxerror|referenceerror|rangeerror|prisma|sqlstate|econnrefused|econnreset|etimedout|enotfound|eai_again|err_network|err_canceled|econnaborted)\b/i,
  /\b(unexpected token|unexpected end of json|is not valid json|cannot read propert|undefined is not an object)\b/i,
  /\b(POST|GET|PUT|PATCH|DELETE)\s+\/[a-z0-9/_-]+/i,
  /\b(request_id|correlation_id|stack trace|next_digest|digest:\s*['"]?\d+)\b/i,
  /\bP20\d{2}\b/,
];

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
}

/** Detecta mensagens técnicas, códigos internos ou textos em inglês vindos de bibliotecas HTTP/JS. */
export function isTechnicalMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  return TECHNICAL_PATTERNS.some((re) => re.test(trimmed));
}

/** Garante que nenhuma string técnica/jargão chega visível ao utilizador leigo. */
export function sanitizeUserErrorMessage(message: unknown, fallback: string): string {
  if (typeof message !== "string") return fallback;
  const trimmed = message.trim();
  if (!trimmed || isTechnicalMessage(trimmed)) return fallback;
  return trimmed;
}

function formatWaitDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  if (seconds >= 60) {
    const mins = Math.ceil(seconds / 60);
    return mins === 1 ? "Aguarde cerca de 1 minuto e tente novamente." : `Aguarde cerca de ${mins} minutos e tente novamente.`;
  }
  const secs = Math.ceil(seconds);
  return secs === 1 ? "Aguarde 1 segundo e tente novamente." : `Aguarde ${secs} segundos e tente novamente.`;
}

function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isCanceledRequestError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; name?: unknown };
  return e.code === "ERR_CANCELED" || e.name === "AbortError" || e.name === "CanceledError";
}

export function isNetworkOrOfflineError(error: unknown): boolean {
  if (isBrowserOffline()) return true;
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; message?: unknown; response?: unknown };
  if (e.response) return false;
  if (e.code === "ERR_NETWORK" || e.code === "ECONNABORTED" || e.code === "ETIMEDOUT") return true;
  const msg = typeof e.message === "string" ? e.message.trim() : "";
  return /^(Network Error|Failed to fetch|Load failed)$/i.test(msg) || /timeout of \d+\s*ms exceeded/i.test(msg);
}

/** Usado pelo React Query: evita repetir pedidos que falharam por erro permanente do utilizador/regra de negócio. */
export function isTransientRetryableError(error: unknown): boolean {
  if (isCanceledRequestError(error)) return false;
  if (isNetworkOrOfflineError(error)) return true;
  const status = (error as { response?: { status?: number }; status?: number })?.response?.status
    ?? (error as { status?: number })?.status;
  return status === 408 || status === 502 || status === 503 || status === 504;
}

/** Extrai mapa `{ campo -> mensagem }` a partir de `response.data.errors` da API (inclui chaves em snake_case e camelCase). */
export function extractApiFieldErrors(error: unknown): Record<string, string> {
  const data = (error as { response?: { data?: ApiProblemData } })?.response?.data;
  if (!Array.isArray(data?.errors)) return {};
  const map: Record<string, string> = {};
  for (const issue of data.errors) {
    if (!issue?.message) continue;
    const rawKey = (issue.field ?? "").split(".").pop() ?? "";
    if (!rawKey || rawKey === "formulario" || rawKey === "(corpo)") continue;
    const label = FIELD_LABELS[rawKey];
    const cleanIssue = sanitizeUserErrorMessage(issue.message, "Valor inválido.");
    const msg = label && !cleanIssue.toLowerCase().startsWith(label.toLowerCase())
      ? `${label}: ${cleanIssue}`
      : cleanIssue;
    map[rawKey] = msg;
    const camel = snakeToCamel(rawKey);
    if (camel !== rawKey) map[camel] = msg;
  }
  return map;
}

/** Aplica erros de campo devolvidos pela API directamente num formulário `react-hook-form`. */
export function applyApiFieldErrors<TField extends string = string>(
  error: unknown,
  setError: (name: TField, err: { type: string; message: string }) => void,
  fieldMap?: Record<string, TField>
): boolean {
  const extracted = extractApiFieldErrors(error);
  let applied = false;
  for (const [key, message] of Object.entries(extracted)) {
    const target = (fieldMap?.[key] ?? key) as TField;
    setError(target, { type: "server", message });
    applied = true;
  }
  return applied;
}

/** «Documento: Mínimo de 4 caracteres.» — junta o nome legível do campo à mensagem quando faz falta. */
function describeFieldError(first: ApiFieldIssue | undefined): string | undefined {
  const rawMessage = first?.message;
  if (!rawMessage || typeof rawMessage !== "string") return undefined;
  const cleanMessage = sanitizeUserErrorMessage(rawMessage, "");
  if (!cleanMessage) return undefined;
  const key = (first.field ?? "").split(".").pop() ?? "";
  if (!key || key === "formulario" || key === "(corpo)") return cleanMessage;
  const label = FIELD_LABELS[key];
  return label && !cleanMessage.toLowerCase().startsWith(label.toLowerCase()) ? `${label}: ${cleanMessage}` : cleanMessage;
}

/**
 * Converte qualquer erro (Axios, Blob JSON, HTTP status, Fetch, Timeout, Offline ou Error genérico)
 * numa mensagem clara, accionável e sem jargão técnico em PT-AO45.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (typeof error === "string") {
    return sanitizeUserErrorMessage(error, fallback);
  }

  const errObj = error as {
    code?: unknown;
    name?: unknown;
    message?: unknown;
    status?: unknown;
    data?: ApiProblemData;
    response?: {
      status?: number;
      data?: ApiProblemData | string;
    };
  } | null | undefined;

  if (!errObj || typeof errObj !== "object") {
    return fallback;
  }

  // 1. Falhas de transporte / offline / timeout (sem resposta HTTP)
  if (!errObj.response) {
    if (isCanceledRequestError(errObj)) {
      return "O pedido foi cancelado antes de ser concluído.";
    }
    if (isBrowserOffline()) {
      return "Está sem ligação à Internet. Verifique o Wi-Fi ou os dados móveis e tente novamente.";
    }
    const rawMsg = typeof errObj.message === "string" ? errObj.message.trim() : "";
    if (errObj.code === "ECONNABORTED" || errObj.code === "ETIMEDOUT" || /timeout of \d+\s*ms exceeded/i.test(rawMsg)) {
      return CODE_HINTS.REQUEST_TIMEOUT;
    }
    if (errObj.code === "ERR_NETWORK" || /^(Network Error|Failed to fetch|Load failed)$/i.test(rawMsg)) {
      return "Não foi possível ligar ao servidor neste momento. Verifique a sua ligação à Internet e tente novamente.";
    }
  }

  const responseStatus = errObj.response?.status ?? (typeof errObj.status === "number" ? errObj.status : undefined);
  const rawData = errObj.response?.data ?? errObj.data;
  const data: ApiProblemData | undefined =
    rawData && typeof rawData === "object" && !(typeof Blob !== "undefined" && rawData instanceof Blob)
      ? rawData
      : undefined;

  // 2. Erros específicos por campo (validação)
  const fieldError = Array.isArray(data?.errors) ? describeFieldError(data.errors[0]) : undefined;
  if (fieldError) return fieldError;

  // 3. Códigos estruturados da API (`ErrorCodes`)
  const apiCode = typeof data?.code === "string" ? data.code : undefined;
  const rawDetail =
    (typeof data?.detail === "string" && data.detail) ||
    (typeof data?.message === "string" && data.message) ||
    "";
  const cleanDetail = sanitizeUserErrorMessage(rawDetail, "");

  if (apiCode && CODE_HINTS[apiCode]) {
    const hint = CODE_HINTS[apiCode];

    if (apiCode === "ACCOUNT_LOCKED" || apiCode === "RATE_LIMITED") {
      const waitSec = Number(data?.retry_after_seconds ?? data?.retry_after);
      const waitMsg = formatWaitDuration(waitSec);
      if (waitMsg) {
        return apiCode === "ACCOUNT_LOCKED"
          ? `Esta conta foi temporariamente bloqueada por segurança. ${waitMsg}`
          : `Foram feitas demasiadas tentativas seguidas. ${waitMsg}`;
      }
      return hint;
    }

    if (
      PREFER_DETAIL_ONLY_CODES.has(apiCode) &&
      cleanDetail &&
      !GENERIC_API_TITLES.has(cleanDetail.toLowerCase()) &&
      cleanDetail !== hint
    ) {
      return cleanDetail;
    }

    if (
      !HIDE_DETAIL_CODES.has(apiCode) &&
      cleanDetail &&
      cleanDetail !== hint &&
      !GENERIC_API_TITLES.has(cleanDetail.toLowerCase()) &&
      cleanDetail.length <= 160
    ) {
      return `${hint} (${cleanDetail})`;
    }

    return hint;
  }

  // 4. Detalhe textual limpo devolvido pela API ou pelo objecto Error
  if (cleanDetail && !GENERIC_API_TITLES.has(cleanDetail.toLowerCase())) {
    return cleanDetail;
  }

  // 5. Fallback por código de estado HTTP (ex.: proxy 502/503/504/413 em HTML)
  if (typeof responseStatus === "number" && HTTP_STATUS_FALLBACKS[responseStatus]) {
    return HTTP_STATUS_FALLBACKS[responseStatus];
  }

  // 6. Mensagem directa do objecto Error (ex.: "Nenhuma escola foi seleccionada.") desde que não seja técnica
  const errMessage = sanitizeUserErrorMessage(errObj.message, "");
  if (errMessage) return errMessage;

  return fallback;
}
