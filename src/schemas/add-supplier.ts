import { z } from "zod";
import { phoneNumberSchema, taxNumberSchema } from "./helps";

export const supplierSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().trim().email("Email inválido"),
  phone: phoneNumberSchema,
  address: z.string().trim().min(5, "Endereço muito curto"),
  taxNumber: taxNumberSchema,
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

export const editSupplierSchema = supplierSchema.extend({
  isActive: z.boolean().optional(),
});

export type EditSupplierFormData = z.infer<typeof editSupplierSchema>;