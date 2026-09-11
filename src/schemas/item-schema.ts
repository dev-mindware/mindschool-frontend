import { z } from "zod";

export const itemSchema = z
  .object({
    name: z.string().trim().min(1, "Campo obrigatório"),
    description: z.string().trim().optional(),
    barcode: z.string().trim().optional(),

    price: z.number({ invalid_type_error: "Preço deve ser um número" }),
    cost: z.number().nullable().optional(),
    quantity: z.number().nullable().optional(),

    minStock: z.number().nullable().optional(),

    unit: z.string().trim().optional(),
    weight: z.number({ invalid_type_error: "O peso deve ser um número válido" }).positive("O peso deve ser positivo").optional(),
    dimensions: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const regex = /^\d+([.,]\d+)?\s*[xX]\s*\d+([.,]\d+)?(\s*[xX]\s*\d+([.,]\d+)?)?$/;
          return regex.test(val);
        },
        {
          message: "Formato inválido. Use: 10x20 ou 10x20x30",
        }
      ),
    image: z.string().trim().url("URL inválida").optional(),

    type: z.enum(["SERVICE", "PRODUCT"], {
      required_error: "Tipo obrigatório",
    }),

    companyId: z.string().trim().optional(),
    storeId: z.string().trim().optional(),
    categoryId: z.string().trim().min(1, "Campo obrigatório"),
    supplierId: z.string().trim().nullable().optional(),

    hasExpiry: z.boolean().optional(),
    expiryDate: z.string().trim().optional(),
    daysToExpiry: z.coerce.string().optional(),
    taxId: z.string().trim().min(1, "Seleccione um imposto"),
  })

  .refine(
    (data) => {
      if (
        data.cost !== undefined &&
        data.cost !== null &&
        data.price !== undefined &&
        data.price !== null
      ) {
        return data.price >= data.cost;
      }
      return true;
    },
    {
      message: "O preço deve ser maior ou igual ao custo",
      path: ["price"],
    },
  );

export type ItemFormData = z.infer<typeof itemSchema>;
