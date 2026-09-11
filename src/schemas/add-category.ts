import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "A categoria deve ter no mínimo 2 caracteres")
    .max(50, "A categoria deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  storeId: z.string().trim().nonempty("Escolha uma loja").optional(),
  companyId: z.string().trim().nonempty("Escolha uma empresa").optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
