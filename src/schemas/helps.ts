import { z } from "zod";

// After removing dots/spaces, accepts:
// - Full Angola IBAN: AO + 2 check digits + 21 numeric digits (25 chars)
// - Body only: 21 numeric digits
const angolaIbanBodyRegex = /^(AO\d{2})?\d{21}$/;

/** Normalizes an IBAN by stripping dots, spaces and uppercasing. */
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

const accountNumberRegex = /^\d{14}$/;

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
    quantity: z
      .number({ invalid_type_error: "A quantidade deve ser um número" })
      .positive("A quantidade deve ser maior que 0"),
    unitPrice: z
      .number({ invalid_type_error: "O preço unitário deve ser um número" })
      .positive("O preço unitário deve ser maior que 0"),
    discount: z
      .number({ invalid_type_error: "O desconto deve ser numérico" })
      .min(0, "O desconto não pode ser negativo")
      .optional()
      .nullable(),
    total: z
      .number({ invalid_type_error: "O total deve ser um número" })
      .positive("O total deve ser maior que 0")
      .optional()
      .nullable(),

    isFromAPI: z.boolean().optional(),
    taxId: z.string().trim().optional().or(z.literal("")),
    apiId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isFromAPI && !data.apiId && !data.taxId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxId"],
        message: "Seleccione um imposto",
      });
    }
  });

/**
 * NIF de Angola:
 * - Pessoa singular: 9 dígitos + 2 letras + 3 dígitos (ex: 007849302LA042)
 * - Pessoa colectiva: 10 dígitos numéricos (ex: 5417002012)
 */
export const taxNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .nonempty("Campo obrigatório")
  .refine(
    (value) => /^\d{9}[A-Z]{2}\d{3}$/.test(value) || /^\d{10}$/.test(value),
    "NIF inválido. Introduza o NIF de uma pessoa singular ou colectiva."
  );

export const optionalTaxNumberSchema = z
  .union([taxNumberSchema, z.literal("")])
  .optional();

/**
 * Telefone angolano (9 dígitos, prefixos das operadoras Unitel, Movicel, Africell: 91, 92, 93, 94, 95, 97, 99)
 * Suporta também o indicativo internacional +244 seguido dos 9 dígitos.
 */
export const phoneNumberSchema = z
  .string({ invalid_type_error: "Insira um número de telefone válido" })
  .trim()
  .refine(
    (value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      if (digits.startsWith("244")) {
        return digits.length === 12 && /^(244)(91|92|93|94|95|97|99)\d{7}$/.test(digits);
      }
      return digits.length === 9 && /^(91|92|93|94|95|97|99)\d{7}$/.test(digits);
    },
    "Insira um número de telemóvel angolano válido (ex: 923 000 000 ou +244 923 000 000)"
  );

export const optionalPhoneNumberSchema = z
  .union([phoneNumberSchema, z.literal("")])
  .optional();

export const passwordSchema = z
  .string()
  .trim()
  .nonempty("Campo obrigatório")
  .min(8, "A palavra-passe deve ter, no mínimo, 8 caracteres");

export const ibanSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      const clean = val.replace(/\s+/g, "").toUpperCase();
      return validIban(clean) || angolaIbanBodyRegex.test(normalizeIban(val));
    },
    "IBAN inválido — utilize o formato oficial angolano AO06.0040.0000.5660.0824.1017.4"
  );

export const accountNumberSchema = z
  .string()
  .trim()
  .regex(accountNumberRegex, "Número da conta deve conter 14 dígitos");

/** Padrão legal do Bilhete de Identidade de Angola (14 caracteres alfanuméricos) */
export const angolaBiRegex = /^\d{9}[A-Z]{2}\d{3}$/;

export const angolaBiSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    angolaBiRegex,
    "BI inválido. Formato oficial: 9 dígitos, 2 letras e 3 dígitos (ex: 007849302LA042)"
  );

/** Validação de documento de identificação por tipo */
export function validateIdDocumentByType(
  docNumber: string,
  docType: string
): { valid: boolean; message?: string } {
  const clean = docNumber.trim().toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (docType === "IDENTITY_CARD") {
    if (!angolaBiRegex.test(clean)) {
      return {
        valid: false,
        message:
          "BI inválido. Formato esperado: 9 dígitos, 2 letras e 3 dígitos (ex: 007849302LA042)",
      };
    }
  } else if (docType === "PASSPORT") {
    if (!/^[A-Z]{1,2}\d{6,8}$/.test(clean)) {
      return {
        valid: false,
        message:
          "Passaporte inválido. Formato esperado: 1 ou 2 letras seguidas de 6 a 8 dígitos (ex: N1234567)",
      };
    }
  } else {
    if (clean.length < 3) {
      return {
        valid: false,
        message: "Número de cédula / assento deve ter pelo menos 3 caracteres",
      };
    }
  }
  return { valid: true };
}

/** Schema reutilizável para quantidade inteira com limites */
export const quantitySchema = (
  min = 1,
  max = 999999,
  label = "A quantidade"
) =>
  z.coerce
    .number({ invalid_type_error: `${label} deve ser um número inteiro` })
    .int(`${label} deve ser um número inteiro`)
    .min(min, `${label} deve ser de pelo menos ${min}`)
    .max(max, `${label} não pode exceder ${max}`);

/** Schema reutilizável para moeda (Kwanzas) com valor mínimo não negativo e máximo opcional */
export const currencySchema = (
  min = 0,
  max?: number,
  label = "O valor monetário"
) => {
  let schema = z.coerce
    .number({ invalid_type_error: `${label} deve ser um valor numérico` })
    .min(min, `${label} deve ser maior ou igual a ${min}`);
  if (typeof max === "number") {
    schema = schema.max(max, `${label} não pode exceder ${max}`);
  }
  return schema;
};

/** Schema reutilizável para percentagens (0 a 100) */
export const percentageSchema = (min = 0, max = 100, label = "A percentagem") =>
  z.coerce
    .number({ invalid_type_error: `${label} deve ser um valor numérico` })
    .min(min, `${label} deve ser de pelo menos ${min}%`)
    .max(max, `${label} não pode exceder ${max}%`);

/** Schema reutilizável para escala de notas de avaliação de Angola (0 a 20 valores do MED) */
export const schoolGradeSchema = (label = "A nota") =>
  z.coerce
    .number({ invalid_type_error: `${label} deve ser um valor numérico` })
    .min(0, `${label} deve ser no mínimo 0 valores`)
    .max(20, `${label} não pode exceder 20 valores (escala nacional do MED)`);

/** Schema de validação de data de nascimento escolar */
export const birthDateSchema = (minAge = 2, maxAge = 100) =>
  z
    .string()
    .trim()
    .min(1, "Data de nascimento é obrigatória")
    .refine((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      const now = new Date();
      const age =
        (now.getTime() - date.getTime()) / (365.25 * 24 * 3600 * 1000);
      return age >= minAge && age <= maxAge;
    }, `A idade deve estar compreendida entre ${minAge} e ${maxAge} anos`);
