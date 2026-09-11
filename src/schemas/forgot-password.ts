import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email inválido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  otpCode: z.string().trim().min(6, {
    message: "O código de verificação deve ter 6 caracteres.",
  }),
});

export type OtpFormData = z.infer<typeof otpSchema>;
