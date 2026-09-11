import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),

  password: z
    .string()
    .trim()
    .min(1, "A palavra-passe é obrigatória")
    .refine((val) => !/\s/.test(val), "Não pode conter espaços")
});

export type LoginFormData = z.infer<typeof loginSchema>;
