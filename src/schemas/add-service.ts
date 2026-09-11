import { z } from "zod";

export const addServiceSchema = z.object({
  name: z.string().trim().nonempty("Campo obrigatório"),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
  type: z.enum(["SERVICE", "PRODUCT"], {
    required_error: "Tipo obrigatório",
  }),

  companyId: z.string().trim().min(1, "Campo obrigatório"),
  storeId: z.string().trim().min(1, "Campo obrigatório").optional(),
  categoryId: z.string().trim().min(1, "Campo obrigatório"),
  description: z
    .string()
    .trim()
    .max(300, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
});

export type AddServiceFormData = z.infer<typeof addServiceSchema>;
