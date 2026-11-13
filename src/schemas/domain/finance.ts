import { z } from "zod";
import {
  currencySchema,
  optionalPersonNameSchema,
  optionalSafeTextSchema,
  pastOrTodayIsoDateSchema,
  quantitySchema,
  safeTextSchema,
} from "../helps";

export const tuitionPolicySchema = z
  .object({
    monthlyAmount: currencySchema(0, 10_000_000, "O valor da mensalidade"),
    registrationFee: currencySchema(0, 10_000_000, "A taxa de matrícula"),
    dueStartDay: quantitySchema(1, 28, "O dia inicial de pagamento"),
    dueDay: quantitySchema(1, 28, "O dia limite de pagamento"),
    graceDays: quantitySchema(0, 30, "Os dias de tolerância"),
    latePenaltyType: z.enum(["percentage", "fixed"]),
    latePenaltyValue: currencySchema(0, 10_000_000, "O valor da multa"),
    monthlyIncreaseType: z.enum(["percentage", "fixed"]),
    monthlyIncreaseValue: currencySchema(0, 10_000_000, "O agravamento mensal"),
    emailEnabled: z.boolean(),
    preDueDays: quantitySchema(1, 15, "Os dias de pré-aviso"),
  })
  .superRefine((data, ctx) => {
    if (data.dueStartDay > data.dueDay) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDay"],
        message: "O dia limite não pode ser anterior ao dia inicial.",
      });
    }
    if (data.latePenaltyType === "percentage" && data.latePenaltyValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["latePenaltyValue"],
        message: "A multa percentual não pode exceder 100%.",
      });
    }
    if (data.monthlyIncreaseType === "percentage" && data.monthlyIncreaseValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monthlyIncreaseValue"],
        message: "O agravamento percentual não pode exceder 100%.",
      });
    }
  });
export type TuitionPolicyFormData = z.infer<typeof tuitionPolicySchema>;

export const customEmolumentSchema = z.object({
  name: safeTextSchema(2, 120, "O nome do emolumento"),
  amount: currencySchema(1, 10_000_000, "O valor"),
  description: optionalSafeTextSchema(255, 2, "A descrição"),
});
export type CustomEmolumentFormData = z.infer<typeof customEmolumentSchema>;

export const portalPaymentMetaSchema = z.object({
  paidOn: pastOrTodayIsoDateSchema("A data do pagamento"),
  reference: optionalSafeTextSchema(80, 3, "A referência do comprovativo"),
  payer: optionalPersonNameSchema(3, 150, "O nome do ordenante"),
  notes: optionalSafeTextSchema(500, 2, "As observações"),
});
export type PortalPaymentMetaFormData = z.infer<typeof portalPaymentMetaSchema>;

