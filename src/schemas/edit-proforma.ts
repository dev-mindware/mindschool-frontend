import { z } from "zod";
import { optionalTaxNumberSchema } from "./helps";

export const SimpleItemSchema = z.object({
  name: z.string().trim().min(1, "Nome do item é obrigatório"),
  price: z.number().positive("Preço inválido"),
  quantity: z.number().positive("Quantidade inválida"),
  type: z.enum(["PRODUCT", "SERVICE"]),
});

export const ClientSchema = z.object({
  name: z.string().trim().min(1, "Nome do cliente é obrigatório"),
  phone: z.string().trim().min(1),
  address: z.string().trim().min(1),
  taxNumber: optionalTaxNumberSchema,
});

export const EditProformaSchema = z
  .object({
    issueDate: z.string().trim().min(1),
    dueDate: z.string().trim().min(1),

    proformaExpiresAt: z.string().trim().optional(),
    paymentMethod: z.enum(["CASH", "CARD", "TRANSFER"]).optional(),
    notes: z.string().trim().optional(),

    subtotal: z.number().nonnegative(),
    taxAmount: z.number().nonnegative(),
    discountAmount: z.number().nonnegative(),
    retentionAmount: z.number().nonnegative(),
    total: z.number().nonnegative(),

    client: ClientSchema,
    items: z.array(SimpleItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const calculatedTotal =
      data.subtotal +
      data.taxAmount -
      data.discountAmount -
      data.retentionAmount;

    if (Math.abs(calculatedTotal - data.total) > 0.01) {
      ctx.addIssue({
        path: ["total"],
        message: "Total inconsistente com os valores calculados",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type EditProformaFormData = z.infer<typeof EditProformaSchema>;
