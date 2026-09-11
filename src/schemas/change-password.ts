import { z } from "zod";
import { passwordSchema } from "./helps";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "A palavra-passe actual é obrigatória"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Campo obrigatório"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As palavras-passe não coincidem",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
