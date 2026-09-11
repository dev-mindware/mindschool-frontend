import { z } from "zod";
import { accountNumberSchema, ibanSchema, phoneNumberSchema } from "./helps";

export const bankSchema = z.object({
  bankName: z
    .string()
    .trim()
    .min(3, "O nome do banco deve ter pelo menos 3 caracteres"),

  accountNumber: accountNumberSchema,
  iban: ibanSchema,

  phone: phoneNumberSchema.optional().or(z.literal("")),
  isDefault: z.boolean().default(false).optional(),
});

export type BankFormData = z.infer<typeof bankSchema>;
