import { z } from "zod";
import { passwordSchema, phoneNumberSchema } from "./helps";

export const managerSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: phoneNumberSchema,
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  barcode: z
    .string()
    .trim()
    .min(4, "O código de barras deve ter, pelo menos, 4 caracteres")
    .max(64, "O código de barras deve ter, no máximo, 64 caracteres")
    .optional()
    .or(z.literal("")),
  storeIds: z.array(z.string()).min(1, "Deve seleccionar, pelo menos, uma loja"),
});

export type ManagerFormData = z.infer<typeof managerSchema>
