import { z } from "zod";
import {
  currencySchema,
  ibanSchema,
  optionalAccountNumberSchema,
  optionalEmailSchema,
  optionalPersonNameSchema,
  optionalPhoneNumberSchema,
  optionalSafeTextSchema,
  optionalSwiftBicSchema,
  percentageSchema,
  personNameSchema,
  quantitySchema,
  safeTextSchema,
  schoolGradeSchema,
} from "../helps";

export const bankAccountSchema = z.object({
  bankName: safeTextSchema(2, 100, "O nome do banco"),
  accountHolder: personNameSchema(3, 150, "O titular da conta"),
  iban: ibanSchema,
  accountNumber: optionalAccountNumberSchema,
  swift: optionalSwiftBicSchema,
  instructions: optionalSafeTextSchema(500, 2, "As instruções de pagamento"),
});
export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

export const schoolInstitutionalSettingsSchema = z.object({
  schoolName: safeTextSchema(3, 150, "O nome oficial da instituição"),
  medRegistrationCode: optionalSafeTextSchema(50, 3, "O código de entidade MED"),
  decreeNumber: optionalSafeTextSchema(100, 3, "O decreto de criação"),
  gazetteDate: optionalSafeTextSchema(60, 3, "A data do Diário da República"),
  gazetteSeries: optionalSafeTextSchema(60, 2, "A série do Diário da República"),
  subTitle: optionalSafeTextSchema(200, 3, "Os ciclos de ensino ministrados"),
  province: optionalSafeTextSchema(80, 2, "A província"),
  municipality: optionalSafeTextSchema(80, 2, "O município"),
  communeOrDistrict: optionalSafeTextSchema(100, 2, "O distrito / bairro"),
  fullAddress: optionalSafeTextSchema(255, 5, "O endereço completo"),
  phone: optionalPhoneNumberSchema,
  email: optionalEmailSchema,
  directorGeneralName: optionalPersonNameSchema(3, 150, "O nome do(a) Diretor(a) Geral"),
  pedagogicDirectorName: optionalPersonNameSchema(3, 150, "O nome do(a) Diretor(a) Pedagógico(a)"),
});
export type SchoolInstitutionalSettingsFormData = z.infer<typeof schoolInstitutionalSettingsSchema>;

export const schoolPoliciesSchema = z
  .object({
    evaluation: z.object({
      mt_weights: z
        .object({
          mac: quantitySchema(0, 10, "O peso da MAC"),
          mas: quantitySchema(0, 10, "O peso da MAS"),
          pp: quantitySchema(0, 10, "O peso da PP"),
        })
        .refine(
          (w) => w.mac + w.mas + w.pp > 0,
          "A soma dos pesos de avaliação (MAC + MAS + PP) deve ser maior que zero."
        ),
      pass_mark: schoolGradeSchema("A nota mínima de aprovação"),
      review_window_days: quantitySchema(1, 60, "O prazo de reapreciação"),
      council_min_attendees: quantitySchema(1, 30, "O quórum mínimo do conselho"),
      final_exam: z.object({
        admission_min_mfd: schoolGradeSchema("A MFD mínima para exame"),
        weight_mfd: percentageSchema(0, 100, "O peso da MFD no exame final"),
      }),
      exception: z
        .object({
          enabled: z.boolean(),
          class_level_min: quantitySchema(1, 13, "A classe mínima"),
          class_level_max: quantitySchema(1, 13, "A classe máxima"),
          max_subjects: quantitySchema(1, 10, "O máximo de disciplinas"),
          min_mark: schoolGradeSchema("A nota mínima da exceção"),
          max_mark: schoolGradeSchema("A nota máxima da exceção"),
        })
        .refine(
          (ex) => !ex.enabled || ex.class_level_min <= ex.class_level_max,
          { message: "A classe mínima não pode superar a classe máxima.", path: ["class_level_max"] }
        )
        .refine(
          (ex) => !ex.enabled || ex.min_mark <= ex.max_mark,
          { message: "A nota mínima não pode superar a nota máxima.", path: ["max_mark"] }
        ),
    }),
    admission: z.object({
      min_pass_score: z.union([z.null(), schoolGradeSchema("A nota mínima da prova")]),
    }),
    calendar: z.object({
      summary_deadline_days: quantitySchema(0, 30, "O prazo de sumários"),
    }),
    risk: z
      .object({
        weights: z
          .object({
            frequencia: currencySchema(0, 10, "O peso da frequência"),
            desempenho: currencySchema(0, 10, "O peso do desempenho"),
            financeiro: currencySchema(0, 10, "O peso financeiro"),
          })
          .refine(
            (w) => w.frequencia + w.desempenho + w.financeiro > 0,
            "Pelo menos um indicador de risco deve ter peso superior a zero."
          ),
        thresholds: z
          .object({
            moderado: percentageSchema(1, 99, "O limiar moderado"),
            elevado: percentageSchema(2, 100, "O limiar elevado"),
          })
          .refine(
            (t) => t.moderado < t.elevado,
            { message: "O limiar elevado deve ser superior ao moderado.", path: ["elevado"] }
          ),
        overdue_days: quantitySchema(1, 365, "Os dias de atraso financeiro"),
      }),
    finance: z.object({
      installments: quantitySchema(1, 12, "O número de prestações"),
      due_day: quantitySchema(1, 28, "O dia limite de pagamento"),
    }),
  });
export type SchoolPoliciesFormData = z.infer<typeof schoolPoliciesSchema>;

