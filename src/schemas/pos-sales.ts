import { z } from "zod";
import { optionalTaxNumberSchema, phoneNumberSchema } from "./helps";

const posClientSchema = z.object({
  name: z.string().trim().optional().or(z.literal("")),
  taxNumber: optionalTaxNumberSchema,
  phone: phoneNumberSchema.optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
});

export const PosSalesSchema = z.object({
  client: posClientSchema.optional(),
  clientId: z.string().trim().optional(),
  issueDate: z.string().trim().min(1, "A data de emissão é obrigatória"),
  items: z
    .array(
      z.object({
        id: z.string().trim(),
        quantity: z.number(),
      }),
    )
    .min(1, "A proforma deve conter pelo menos 1 item"),
  discountAmount: z.number().optional(),
  taxAmount: z.number().optional(),
  subtotal: z.number().optional(),
  total: z.number().min(0),
  receivedValue: z.number().min(0),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER"]),
  change: z.coerce.number().default(0),
  storeId: z.string().trim().min(1, "Loja é obrigatória"),
  cashSessionId: z.string().trim().min(1, "Sessão de caixa é obrigatória"),
});

export type PosSalesFormData = z.infer<typeof PosSalesSchema>;
