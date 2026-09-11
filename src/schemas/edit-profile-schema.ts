import { z } from "zod";
import {
  FileSchema,
  optionalTaxNumberSchema,
  phoneNumberSchema,
} from "./helps";

export const editProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  phone: phoneNumberSchema.optional(),
  email: z.string().trim().email("Email inválido").optional(),
  companyLogo: FileSchema.optional(),
  taxNumber: optionalTaxNumberSchema,

  companyName: z.string().min(3, "Nome da empresa é obrigatório").optional(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
