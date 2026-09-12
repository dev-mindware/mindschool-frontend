import { z } from "zod";
import { phoneNumberSchema } from "./helps";

// 1. Candidate Application Schema (UC-00)
export const candidateApplicationSchema = z.object({
  fullName: z.string().trim().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  gender: z.enum(["MALE", "FEMALE"], { required_error: "Selecione o género" }),
  birthDate: z.string().nonempty("Data de nascimento é obrigatória"),
  idDocumentType: z.enum(["IDENTITY_CARD", "BIRTH_CERTIFICATE", "PASSPORT"], {
    required_error: "Selecione o tipo de documento",
  }),
  idDocumentNumber: z.string().trim().min(4, "Número do documento é obrigatório"),
  nationality: z.string().trim().min(2, "Nacionalidade é obrigatória"),
  guardianName: z.string().trim().min(3, "Nome do encarregado é obrigatório"),
  guardianPhone: phoneNumberSchema,
  guardianEmail: z.string().trim().email("Email inválido").or(z.literal("")).optional(),
  guardianRelationship: z.enum(["FATHER", "MOTHER", "TUTOR", "OTHER"], {
    required_error: "Selecione o parentesco",
  }),
  desiredClassLevelId: z.string().nonempty("Selecione a classe pretendida"),
  desiredShift: z.enum(["MORNING", "AFTERNOON", "EVENING"], {
    required_error: "Selecione o turno pretendido",
  }),
  previousSchoolName: z.string().trim().optional(),
  requiresEntranceExam: z.boolean(),
});

export type CandidateApplicationFormValues = z.infer<typeof candidateApplicationSchema>;

// 2. Exam Grading Schema (UC-00 / 14.4)
export const examGradingSchema = z.object({
  examScore: z
    .number({ invalid_type_error: "A nota deve ser um número" })
    .min(0, "A nota mínima é 0 valores")
    .max(20, "A nota máxima é 20 valores"),
  qualitativeFeedback: z.string().trim().optional(),
});

export type ExamGradingFormValues = z.infer<typeof examGradingSchema>;

// 3. Admission Decision Schema (UC-00.1)
export const admissionDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "WAITLIST", "REJECTED"], {
    required_error: "Selecione a decisão",
  }),
  decisionNotes: z.string().trim().min(3, "Adicione uma justificação ou nota para a decisão"),
});

export type AdmissionDecisionFormValues = z.infer<typeof admissionDecisionSchema>;
