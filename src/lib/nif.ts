/** NIF angolano (mesma regra do contrato com o MindGest): 10 dígitos, ou 9 dígitos + 2 letras + 3 dígitos. */
const NIF = /^(\d{10}|\d{9}[A-Z]{2}\d{3})$/;

/** Limpa o que o utilizador escreve (espaços, minúsculas) antes de validar ou enviar. */
export const normalizeNif = (v: string): string => v.replace(/\s+/g, "").toUpperCase();

export const isValidNif = (v: string): boolean => NIF.test(normalizeNif(v));

/** Mensagem de validação para campos opcionais (vazio é válido). */
export const nifError = (v: string | undefined | null): string | undefined =>
  !v || !v.trim() || isValidNif(v) ? undefined : "NIF inválido: 10 dígitos, ou 9 dígitos + 2 letras + 3 dígitos (ex.: 5417012345 ou 004567890LA041).";
