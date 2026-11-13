import { z } from "zod";
import {
  birthDateSchema,
  fullPersonNameSchema,
  isoDateSchema,
  optionalEmailSchema,
  optionalPersonNameSchema,
  optionalSafeTextSchema,
  phoneNumberSchema,
  quantitySchema,
  safeTextSchema,
  schoolGradeSchema,
  validateIdDocumentByType,
} from "../helps";

export const newTeacherSchema = z.object({
  userId: z.string().trim().min(1, "Seleccione o utilizador."),
  documentNumber: z
    .string({ error: "O número do documento é obrigatório." })
    .trim()
    .min(1, "O número do documento é obrigatório.")
    .refine(
      (v) => validateIdDocumentByType(v, "IDENTITY_CARD").valid || validateIdDocumentByType(v, "PASSPORT").valid,
      "Documento inválido. Use BI angolano (ex.: 007849302LA042) ou Passaporte (ex.: N1234567)."
    ),
  qualification: optionalSafeTextSchema(120, 2, "A habilitação académica"),
});
export type NewTeacherFormData = z.infer<typeof newTeacherSchema>;

export const enrollmentNewStudentSchema = z.object({
  selectedSectionId: z.string().trim().min(1, "Seleccione a turma."),
  newFullName: fullPersonNameSchema(5, 200, "O nome completo do aluno"),
  newGender: z.enum(["MALE", "FEMALE"]),
  newBirthDate: birthDateSchema(3, 100),
  newIdNumber: z
    .string({ error: "O número do BI é obrigatório." })
    .trim()
    .min(1, "O número do BI é obrigatório.")
    .refine(
      (v) => validateIdDocumentByType(v, "IDENTITY_CARD").valid,
      "BI inválido. Formato oficial: 9 dígitos, 2 letras e 3 dígitos (ex: 007849302LA042)."
    ),
});
export type EnrollmentNewStudentFormData = z.infer<typeof enrollmentNewStudentSchema>;

export const admissionSessionSchema = z.object({
  title: safeTextSchema(3, 150, "O título da sessão"),
  when: z
    .string({ error: "A data e hora da prova são obrigatórias." })
    .trim()
    .min(1, "A data e hora da prova são obrigatórias.")
    .refine((v) => {
      const ts = new Date(v).getTime();
      return Number.isFinite(ts) && ts > Date.now();
    }, "A sessão tem de ser agendada para uma data e hora futura."),
  location: optionalSafeTextSchema(120, 2, "O local / sala"),
  capacity: quantitySchema(1, 1000, "A lotação da sala"),
});
export type AdmissionSessionFormData = z.infer<typeof admissionSessionSchema>;

export const candidateApplicationPersonalSchema = z
  .object({
    fullName: fullPersonNameSchema(5, 200, "O nome completo do candidato"),
    gender: z.enum(["MALE", "FEMALE"]),
    birthDate: birthDateSchema(3, 100),
    idDocumentType: z.enum(["IDENTITY_CARD", "BIRTH_CERTIFICATE", "PASSPORT"]),
    idDocumentNumber: z.string().trim().min(1, "O número do documento é obrigatório."),
    nationality: safeTextSchema(3, 80, "A nacionalidade"),
    previousSchoolName: optionalSafeTextSchema(200, 2, "A escola de proveniência"),
  })
  .superRefine((data, ctx) => {
    const check = validateIdDocumentByType(data.idDocumentNumber, data.idDocumentType);
    if (!check.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["idDocumentNumber"],
        message: check.message ?? "Número de documento inválido.",
      });
    }
  });

export const candidateGuardianNewSchema = z.object({
  guardianName: fullPersonNameSchema(5, 200, "O nome completo do encarregado"),
  guardianPhone: phoneNumberSchema,
  guardianEmail: optionalEmailSchema,
});

export const academicYearSetupSchema = z
  .object({
    name: safeTextSchema(4, 50, "O nome do ano letivo"),
    startDate: isoDateSchema("A data de início"),
    endDate: isoDateSchema("A data de fim"),
  })
  .refine((d) => d.startDate < d.endDate, {
    message: "A data de fim deve ser posterior à data de início.",
    path: ["endDate"],
  });

export const issueDocumentSchema = z
  .object({
    studentId: z.string().trim().min(1, "Seleccione o aluno."),
    documentType: z.enum([
      "CONDUCT_CERTIFICATE",
      "DECLARATION_ENROLLMENT",
      "DECLARATION_WITH_GRADES",
      "HABILITATION_CERTIFICATE",
      "TRANSFER_GUIDE",
    ]),
    purpose: safeTextSchema(3, 300, "A finalidade do documento"),
    checkedByName: optionalPersonNameSchema(3, 150, "O nome do conferente"),
    registryBook: optionalSafeTextSchema(30, 1, "O livro de registo"),
    registrySheet: optionalSafeTextSchema(30, 1, "A folha de registo"),
  })
  .superRefine((data, ctx) => {
    if (data.documentType === "HABILITATION_CERTIFICATE" && !data.checkedByName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkedByName"],
        message: "O nome do responsável pela conferência é obrigatório para certificados.",
      });
    }
  });

export const formalReasonSchema = (min = 5, max = 500, label = "O motivo") =>
  z.object({
    reason: safeTextSchema(min, max, label),
  });

export const admissionGradeExamSchema = z.object({
  examScore: schoolGradeSchema("A nota da prova"),
});

