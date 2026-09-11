import { z } from "zod";

export const addProductSchema = z.object({
  name: z.string().trim().nonempty("Campo obrigatório"),
  selectedCategory: z.string().trim().nonempty("Campo obrigatório"),
  sku: z.string().trim().nonempty("Campo obrigatório"),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),

  selectedMeasurement: z.string().trim().optional(),

  stock: z.number().min(0, "O stock inicial deve ser maior ou igual a 0"),
  minStock: z
    .number()
    .min(0, "O stock mínimo deve ser maior ou igual a 0")
    .nullable()
    .optional(),
  tax: z
    .number()
    .min(0, "Imposto deve ser maior ou igual a 0")
    .nullable()
    .optional(),
  warranty: z.number().nullable().optional(),
  repositionTime: z
    .number()
    .min(0, "Tempo de reposição deve ser maior ou igual a 0")
    .nullable()
    .optional(),
  salesPerDay: z
    .number()
    .min(0, "Vendas por dia deve ser maior ou igual a 0")
    .nullable()
    .optional(),

  supplier: z.string().trim().optional(),
  location: z.string().trim().optional(),

  expiryDate: z.coerce.date().nullable().optional(),

  selectedStatus: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).optional(),

  description: z
    .string()
    .trim()
    .max(300, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
});

export type AddProductFormData = z.infer<typeof addProductSchema>;
