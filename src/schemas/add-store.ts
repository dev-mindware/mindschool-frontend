import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  code: z
    .string()
    .trim()
    .min(1, "O código do estabelecimento é obrigatório")
    .max(20, "O código deve ter, no máximo, 20 caracteres")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Utilize apenas letras, números, hífen ou sublinhado",
    ),
  email: z.string().trim().email("Email inválido").optional().nullable().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  address: z.string().trim().min(5, "Endereço muito curto").optional().nullable().or(z.literal("")),
  status: z.string().trim().optional(),
  manager: z.string().trim().optional(),
  companyId: z.string().trim().optional(),
});

export type StoreFormData = z.infer<typeof storeSchema>;
