import { z } from "zod";
import { isValidNif, normalizeNif } from "@/lib/nif";

// ============================================================================
// Higienização e texto seguro
// ============================================================================

const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Remove caracteres de controlo invisíveis e normaliza espaços externos. */
export function stripControlChars(value: string): string {
  return value.replace(CONTROL_CHARS_RE, "");
}

/** Normaliza texto de pesquisa livre (remove caracteres de controlo, colapsa espaços e aplica limite). */
export function sanitizeSearchTerm(value: string, maxLength = 100): string {
  return stripControlChars(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/** Cria schema para texto formal não vazio, sem caracteres de controlo. */
export const safeTextSchema = (min = 2, max = 255, label = "Este campo") =>
  z
    .string({ error: `${label} é obrigatório.` })
    .transform((v) => stripControlChars(v).trim())
    .refine((v) => v.length > 0, `${label} é obrigatório.`)
    .refine((v) => v.length >= min, `${label} deve ter pelo menos ${min} caracteres.`)
    .refine((v) => v.length <= max, `${label} não pode exceder ${max} caracteres.`);

/** Cria schema para texto livre opcional (string vazia ou undefined passa sem erro). */
export const optionalSafeTextSchema = (max = 500, min = 2, label = "Este campo") =>
  z
    .string()
    .transform((v) => stripControlChars(v).trim())
    .refine((v) => v.length === 0 || v.length >= min, `${label} deve ter pelo menos ${min} caracteres quando preenchido.`)
    .refine((v) => v.length <= max, `${label} não pode exceder ${max} caracteres.`)
    .optional();

// ============================================================================
// Nomes pessoais (Contexto formal escolar)
// ============================================================================

/**
 * Nome de pessoa: letras Unicode (com acentos), espaços simples, apóstrofo e hífen.
 * Rejeita algarismos, símbolos (@#$%&=) e pontuação isolada.
 */
export const personNameRegex = /^[\p{L}][\p{L}\p{M}'. -]*$/u;

function hasValidNameStructure(value: string, requireTwoWords: boolean): boolean {
  const clean = value.replace(/\s+/g, " ").trim();
  if (!personNameRegex.test(clean)) return false;
  if (/\s{2,}/.test(value.trim()) || /\.\./.test(clean)) return false;
  if (!requireTwoWords) return true;
  const words = clean.split(" ").filter((w) => /[\p{L}]/u.test(w));
  return words.length >= 2;
}

export const personNameSchema = (min = 3, max = 150, label = "O nome") =>
  z
    .string({ error: `${label} é obrigatório.` })
    .transform((v) => stripControlChars(v).replace(/\s+/g, " ").trim())
    .refine((v) => v.length > 0, `${label} é obrigatório.`)
    .refine((v) => v.length >= min, `${label} deve ter pelo menos ${min} caracteres.`)
    .refine((v) => v.length <= max, `${label} não pode exceder ${max} caracteres.`)
    .refine(
      (v) => hasValidNameStructure(v, false),
      `${label} só pode conter letras, espaços, apóstrofo e hífen.`
    );

export const fullPersonNameSchema = (min = 5, max = 200, label = "O nome completo") =>
  z
    .string({ error: `${label} é obrigatório.` })
    .transform((v) => stripControlChars(v).replace(/\s+/g, " ").trim())
    .refine((v) => v.length > 0, `${label} é obrigatório.`)
    .refine((v) => v.length >= min, `${label} deve ter pelo menos ${min} caracteres.`)
    .refine((v) => v.length <= max, `${label} não pode exceder ${max} caracteres.`)
    .refine(
      (v) => personNameRegex.test(v),
      `${label} só pode conter letras, espaços, apóstrofo e hífen.`
    )
    .refine(
      (v) => hasValidNameStructure(v, true),
      `${label} deve incluir pelo menos nome e apelido.`
    );

export const optionalPersonNameSchema = (min = 3, max = 150, label = "O nome") =>
  z
    .string()
    .transform((v) => stripControlChars(v).replace(/\s+/g, " ").trim())
    .refine((v) => v.length === 0 || v.length >= min, `${label} deve ter pelo menos ${min} caracteres.`)
    .refine((v) => v.length <= max, `${label} não pode exceder ${max} caracteres.`)
    .refine(
      (v) => v.length === 0 || hasValidNameStructure(v, false),
      `${label} só pode conter letras, espaços, apóstrofo e hífen.`
    )
    .optional();

// ============================================================================
// E-mail e URL
// ============================================================================

export const requiredEmailSchema = z
  .string({ error: "O e-mail é obrigatório." })
  .trim()
  .min(1, "O e-mail é obrigatório.")
  .max(150, "O e-mail não pode exceder 150 caracteres.")
  .email("Introduza um endereço de e-mail válido.");

export const optionalEmailSchema = z
  .string()
  .trim()
  .max(150, "O e-mail não pode exceder 150 caracteres.")
  .refine((v) => v === "" || z.string().email().safeParse(v).success, "Introduza um endereço de e-mail válido.")
  .optional();

export const optionalUrlSchema = z
  .string()
  .trim()
  .max(255, "O endereço web não pode exceder 255 caracteres.")
  .refine((v) => {
    if (!v) return true;
    try {
      const parsed = new URL(v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`);
      return parsed.hostname.includes(".");
    } catch {
      return false;
    }
  }, "Introduza um endereço web válido (ex.: https://escola.ao).")
  .optional();

// ============================================================================
// Identificadores e Contactos de Angola (NIF, BI, Telefone, IBAN, SWIFT, Matrícula)
// ============================================================================

/**
 * Telefone angolano (9 dígitos, prefixos das operadoras Unitel, Movicel, Africell: 91, 92, 93, 94, 95, 97, 99)
 * Suporta também o indicativo internacional +244 seguido dos 9 dígitos.
 */
export function isValidAngolanPhone(value: string): boolean {
  const clean = value.trim();
  if (!clean) return false;
  if (!/^[+\d\s()-]+$/.test(clean)) return false;
  const digits = clean.replace(/\D/g, "");
  if (digits.startsWith("244")) {
    return digits.length === 12 && /^244(91|92|93|94|95|97|99)\d{7}$/.test(digits);
  }
  return digits.length === 9 && /^(91|92|93|94|95|97|99)\d{7}$/.test(digits);
}

const AO_PHONE_MSG = "Insira um telemóvel angolano válido (ex: 923 000 000 ou +244 923 000 000).";

export const phoneNumberSchema = z
  .string({ error: "O número de telefone é obrigatório." })
  .trim()
  .min(1, "O número de telefone é obrigatório.")
  .refine(isValidAngolanPhone, AO_PHONE_MSG);

export const optionalPhoneNumberSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || isValidAngolanPhone(v), AO_PHONE_MSG)
  .optional();

/**
 * NIF de Angola:
 * - Pessoa singular: 9 dígitos + 2 letras + 3 dígitos (ex: 007849302LA042)
 * - Pessoa colectiva: 10 dígitos numéricos (ex: 5417002012)
 */
const NIF_ERROR_MSG = "NIF inválido (use 10 dígitos para entidade ou BI de 14 caracteres, ex: 007849302LA042).";

export const taxNumberSchema = z
  .string({ error: "O NIF é obrigatório." })
  .trim()
  .transform((v) => normalizeNif(v))
  .refine((v) => v.length > 0, "O NIF é obrigatório.")
  .refine((v) => isValidNif(v), NIF_ERROR_MSG);

export const optionalTaxNumberSchema = z
  .string()
  .trim()
  .transform((v) => (v ? normalizeNif(v) : ""))
  .refine((v) => v === "" || isValidNif(v), NIF_ERROR_MSG)
  .optional();

/** Normaliza um IBAN removendo pontos, espaços e colocando em maiúsculas. */
export const normalizeIban = (value: string) =>
  value.replace(/[.\s]/g, "").toUpperCase();

/** Validação estrita mod-97 do IBAN angolano (AO + 23 dígitos). */
export function validIban(raw: string): boolean {
  if (!raw) return false;
  const iban = normalizeIban(raw);
  if (!/^AO\d{23}$/.test(iban)) return false;
  const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) =>
    String(c.charCodeAt(0) - 55)
  );
  let rem = 0;
  for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}

const IBAN_ERROR_MSG = "IBAN inválido — deve começar por AO, ter 25 caracteres e passar no dígito de controlo (ex.: AO06.0040.0000.5660.0824.1017.4).";

export const ibanSchema = z
  .string({ error: "O IBAN é obrigatório." })
  .trim()
  .min(1, "O IBAN é obrigatório.")
  .refine((val) => validIban(val), IBAN_ERROR_MSG);

export const optionalIbanSchema = z
  .string()
  .trim()
  .refine((val) => val === "" || validIban(val), IBAN_ERROR_MSG)
  .optional();

const accountNumberRegex = /^\d{10,20}$/;

export const accountNumberSchema = z
  .string({ error: "O número de conta é obrigatório." })
  .trim()
  .transform((v) => v.replace(/[\s.-]/g, ""))
  .refine((v) => v.length > 0, "O número de conta é obrigatório.")
  .refine((v) => accountNumberRegex.test(v), "Número de conta inválido (use entre 10 e 20 dígitos numéricos).");

export const optionalAccountNumberSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.-]/g, ""))
  .refine((v) => v === "" || accountNumberRegex.test(v), "Número de conta inválido (use entre 10 e 20 dígitos numéricos).")
  .optional();

const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const optionalSwiftBicSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s+/g, "").toUpperCase())
  .refine((v) => v === "" || swiftRegex.test(v), "SWIFT/BIC inválido (8 ou 11 caracteres, ex.: BFAOAOAO).")
  .optional();

/** Padrão legal do Bilhete de Identidade de Angola (14 caracteres: 9 dígitos + 2 letras + 3 dígitos). */
export const angolaBiRegex = /^\d{9}[A-Z]{2}\d{3}$/;
export const passportRegex = /^[A-Z]{1,2}\d{6,8}$/;
export const cedulaOrCertRegex = /^[A-Z0-9/-]{3,30}$/;

export const angolaBiSchema = z
  .string({ error: "O número do BI é obrigatório." })
  .trim()
  .transform((v) => v.toUpperCase().replace(/[^0-9A-Z]/g, ""))
  .refine((v) => v.length > 0, "O número do BI é obrigatório.")
  .refine(
    (v) => angolaBiRegex.test(v),
    "BI inválido. Formato oficial: 9 dígitos, 2 letras e 3 dígitos (ex: 007849302LA042)."
  );

/** Validação de documento de identificação por tipo (suporta chaves frontend e API). */
export function validateIdDocumentByType(
  docNumber: string,
  docType: string
): { valid: boolean; message?: string } {
  const trimmed = docNumber.trim();
  if (!trimmed) {
    return { valid: false, message: "O número do documento é obrigatório." };
  }
  const clean = trimmed.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const normalizedType = docType.toUpperCase();

  if (normalizedType === "IDENTITY_CARD" || normalizedType === "BILHETE_IDENTIDADE") {
    if (!angolaBiRegex.test(clean)) {
      return {
        valid: false,
        message: "BI inválido. Formato esperado: 9 dígitos, 2 letras e 3 dígitos (ex: 007849302LA042).",
      };
    }
  } else if (normalizedType === "PASSPORT" || normalizedType === "PASSAPORTE") {
    if (!passportRegex.test(clean)) {
      return {
        valid: false,
        message: "Passaporte inválido. Formato esperado: 1 ou 2 letras seguidas de 6 a 8 dígitos (ex: N1234567).",
      };
    }
  } else {
    const compactRaw = trimmed.toUpperCase().replace(/\s+/g, "");
    if (!cedulaOrCertRegex.test(compactRaw) || clean.length < 3) {
      return {
        valid: false,
        message: "Número de cédula ou certidão inválido (mínimo 3 caracteres alfanuméricos).",
      };
    }
  }
  return { valid: true };
}

/** Validador de matrícula automóvel angolana (ex.: LD-12-34-AB ou LD-123-AA). */
export function isValidAngolanPlate(raw: string): boolean {
  const clean = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!clean) return true;
  const compact = clean.replace(/-/g, "");
  return /^[A-Z]{2}\d{4}[A-Z]{2}$/.test(compact) || /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(compact);
}

export const optionalAngolanPlateSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine(isValidAngolanPlate, "Matrícula inválida (ex.: LD-12-34-AB ou LD-123-AA).")
  .optional();

/** Validador estrito de ISBN-10 ou ISBN-13 com dígito de controlo. */
export function isValidIsbn(raw: string): boolean {
  const clean = raw.trim().replace(/[\s-]/g, "").toUpperCase();
  if (/^\d{9}[\dX]$/.test(clean)) {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      const ch = clean[i]!;
      sum += (ch === "X" ? 10 : Number(ch)) * (10 - i);
    }
    return sum % 11 === 0;
  }
  if (/^\d{13}$/.test(clean)) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += Number(clean[i]!) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check === Number(clean[12]!);
  }
  return false;
}

export const optionalIsbnSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || isValidIsbn(v), "ISBN-10 ou ISBN-13 inválido (verifique os dígitos e o dígito de controlo).")
  .optional();

/** Código oficial de verificação documental (ex.: DEC-5000000001-2026-000001). */
export const officialDocumentNumberRegex = /^[A-Z]{2,6}-[A-Z0-9-]{6,40}$/;

// ============================================================================
// Segurança / Senhas
// ============================================================================

export const passwordSchema = z
  .string({ error: "A palavra-passe é obrigatória." })
  .trim()
  .min(1, "A palavra-passe é obrigatória.")
  .min(8, "A palavra-passe deve ter, no mínimo, 8 caracteres.");

export const totpSixDigitSchema = z
  .string({ error: "Introduza o código de 6 dígitos." })
  .trim()
  .regex(/^\d{6}$/, "O código deve conter exatamente 6 dígitos numéricos.");

// ============================================================================
// Números, Moeda, Percentagem e Notas MED (rejeitam "" e NaN explicitamente)
// ============================================================================

function preprocessNumber(val: unknown): unknown {
  if (typeof val === "number") return Number.isFinite(val) ? val : NaN;
  if (typeof val === "string") {
    const trimmed = val.trim().replace(",", ".");
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return undefined;
}

/** Número inteiro finito obrigatório com intervalo. */
export const quantitySchema = (min = 1, max = 999999, label = "A quantidade") =>
  z.preprocess(
    preprocessNumber,
    z
      .number({ error: `${label} é obrigatória e deve ser numérica.` })
      .refine((n) => Number.isFinite(n), `${label} deve ser um número válido.`)
      .int(`${label} deve ser um número inteiro.`)
      .min(min, `${label} deve ser de pelo menos ${min}.`)
      .max(max, `${label} não pode exceder ${max}.`)
  );

/** Valor monetário em Kwanzas finito (rejeita vazio e NaN). */
export const currencySchema = (min = 0, max?: number, label = "O valor monetário") => {
  let num = z
    .number({ error: `${label} é obrigatório e deve ser numérico.` })
    .refine((n) => Number.isFinite(n), `${label} deve ser um número válido.`)
    .min(min, `${label} deve ser igual ou superior a ${min}.`);
  if (typeof max === "number") {
    num = num.max(max, `${label} não pode exceder ${max}.`);
  }
  return z.preprocess(preprocessNumber, num);
};

/** Percentagem finita entre min e max (por omissão 0 a 100). */
export const percentageSchema = (min = 0, max = 100, label = "A percentagem") =>
  z.preprocess(
    preprocessNumber,
    z
      .number({ error: `${label} é obrigatória e deve ser numérica.` })
      .refine((n) => Number.isFinite(n), `${label} deve ser um número válido.`)
      .min(min, `${label} deve ser de pelo menos ${min}%.`)
      .max(max, `${label} não pode exceder ${max}%.`)
  );

/** Nota da escala nacional do MED Angola (0 a 20 valores, até 2 casas decimais). */
export function hasAtMostTwoDecimals(n: number): boolean {
  return Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;
}

export const schoolGradeSchema = (label = "A nota") =>
  z.preprocess(
    preprocessNumber,
    z
      .number({ error: `${label} é obrigatória e deve ser numérica.` })
      .refine((n) => Number.isFinite(n), `${label} deve ser um número válido.`)
      .min(0, `${label} deve ser no mínimo 0 valores.`)
      .max(20, `${label} não pode exceder 20 valores (escala MED).`)
      .refine((n) => hasAtMostTwoDecimals(n), `${label} admite no máximo 2 casas decimais.`)
  );

// ============================================================================
// Datas e Horas (Validação real de calendário YYYY-MM-DD e HH:MM)
// ============================================================================

export function isValidIsoDate(value: string): boolean {
  const clean = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return false;
  const [yStr, mStr, dStr] = clean.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function todayLocalIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export const isoDateSchema = (label = "A data") =>
  z
    .string({ error: `${label} é obrigatória.` })
    .trim()
    .min(1, `${label} é obrigatória.`)
    .refine(isValidIsoDate, `${label} é inválida (formato esperado AAAA-MM-DD).`);

export const pastOrTodayIsoDateSchema = (label = "A data") =>
  isoDateSchema(label).refine(
    (v) => v <= todayLocalIsoDate(),
    `${label} não pode ser uma data futura.`
  );

export const timeHHMMSchema = (label = "A hora") =>
  z
    .string({ error: `${label} é obrigatória.` })
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, `${label} é inválida (use o formato HH:MM, ex.: 08:30).`);

/** Valida data de nascimento escolar com calendário real e intervalo etário exato. */
export const birthDateSchema = (minAge = 2, maxAge = 100) =>
  pastOrTodayIsoDateSchema("A data de nascimento").refine((val) => {
    const [y, m, d] = val.split("-").map(Number);
    const today = new Date();
    let age = today.getFullYear() - y!;
    const mDiff = today.getMonth() + 1 - m!;
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < d!)) {
      age--;
    }
    return age >= minAge && age <= maxAge;
  }, `A idade deve estar compreendida entre ${minAge} e ${maxAge} anos.`);

// ============================================================================
// Schemas legados mantidos por compatibilidade com importações antigas
// ============================================================================

export const FileSchema = z.object({
  fieldname: z.string().trim().optional(),
  originalname: z.string().trim(),
  encoding: z.string().trim().optional(),
  mimetype: z.string().trim(),
  buffer: z.any().optional(),
  size: z.number(),
  url: z.string().trim().url().optional(),
});

export const ItemSchema = z
  .object({
    id: z.string().trim().optional(),
    description: z.string().trim().optional(),
    type: z.enum(["PRODUCT", "SERVICE"]),
    quantity: quantitySchema(1, 999999, "A quantidade"),
    unitPrice: currencySchema(0.01, undefined, "O preço unitário"),
    discount: currencySchema(0, undefined, "O desconto").optional().nullable(),
    total: currencySchema(0.01, undefined, "O total").optional().nullable(),
    isFromAPI: z.boolean().optional(),
    taxId: z.string().trim().optional().or(z.literal("")),
    apiId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isFromAPI && !data.apiId && !data.taxId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxId"],
        message: "Seleccione um imposto.",
      });
    }
  });
