import { z } from "zod";
import { phoneNumberSchema, taxNumberSchema } from "./helps";

export const companySchema = z.object({
  taxNumber: taxNumberSchema,
  name: z
    .string()
    .trim()
    .nonempty("Campo obrigatório")
    .min(3, "O nome deve ter, no mínimo, 3 caracteres"),
  address: z
    .string()
    .trim()
    .min(3, "O endereço deve ter, no mínimo, 3 caracteres")
    .nonempty("Campo obrigatório"),
  phone: phoneNumberSchema,
  email: z.string().trim().email("Email inválido"),
  website: z.string().trim().optional().nullable(),
  logo: z.string().trim().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
