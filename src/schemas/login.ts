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
    .refine((val) => !/\s/.test(val), "Não pode conter espaços"),

  // Segundo factor (TOTP de 6 digitos ou codigo de recuperacao), pedido so quando a conta o tem activo.
  totpCode: z.string().trim().max(20).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
