import { z } from "zod";
import { phoneNumberSchema } from "./helps";

// 1. Student Schema
export const studentSchema = z.object({
  fullName: z.string().trim().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  idDocumentType: z.enum(["BI", "BIRTH_CERTIFICATE", "PASSPORT"]).default("BI"),
  idDocumentNumber: z.string().trim().min(5, "Número de documento é obrigatório"),
  birthDate: z.string().nonempty("Data de nascimento é obrigatória"),
  gender: z.enum(["M", "F"], { required_error: "Selecione o género" }),
  educationCycle: z.enum(["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY"], {
    required_error: "Selecione o ciclo pedagógico",
  }),
  primaryPhone: phoneNumberSchema,
  secondaryPhone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").or(z.literal("")).optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().default("Luanda"),
  municipality: z.string().trim().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

// 2. Enrollment Schema
export const enrollmentSchema = z.object({
  studentId: z.string().nonempty("Selecione o estudante"),
  sectionId: z.string().nonempty("Selecione a turma de destino"),
  academicYear: z.string().default("2025/2026"),
  notes: z.string().trim().optional(),
});

export type EnrollmentFormDataValues = z.infer<typeof enrollmentSchema>;

// 3. Cancel Enrollment Schema
export const cancelEnrollmentSchema = z.object({
  reason: z.string().trim().min(5, "Informe o motivo da anulação com pelo menos 5 caracteres"),
  cancellationDate: z.string().nonempty("Data de cancelamento é obrigatória"),
});

export type CancelEnrollmentFormValues = z.infer<typeof cancelEnrollmentSchema>;

// 4. Guardian Schema
export const guardianSchema = z.object({
  fullName: z.string().trim().min(3, "Nome do encarregado deve ter pelo menos 3 caracteres"),
  idDocumentNumber: z.string().trim().optional().or(z.literal("")),
  phonePrimary: phoneNumberSchema,
  phoneSecondary: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").or(z.literal("")).optional(),
  address: z.string().trim().optional(),
  profession: z.string().trim().optional(),
  workplace: z.string().trim().optional(),
  preferredContactChannel: z.enum(["WHATSAPP", "SMS", "EMAIL", "PHONE_CALL"]).default("WHATSAPP"),
  studentId: z.string().optional().or(z.literal("")),
  relationship: z.enum(["FATHER", "MOTHER", "UNCLE", "GRANDPARENT", "LEGAL_GUARDIAN", "TUTOR", "OTHER"]).default("FATHER"),
});

export type GuardianFormDataValues = z.infer<typeof guardianSchema>;

// 5. Academic Section (Class) Schema
export const classSectionSchema = z.object({
  name: z.string().trim().min(2, "Nome da turma deve ter pelo menos 2 caracteres"),
  classLevel: z.string().trim().min(2, "Classe/Nível é obrigatório"),
  cycle: z.enum(["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY"], {
    required_error: "Selecione o ciclo",
  }),
  shift: z.enum(["MORNING", "AFTERNOON", "EVENING"], {
    required_error: "Selecione o turno",
  }),
  roomNumber: z.string().trim().min(1, "Identificação da sala é obrigatória"),
  capacity: z.coerce.number().int().min(1, "A lotação deve ser de pelo menos 1 aluno"),
  academicYear: z.string().default("2025/2026"),
});

export type ClassSectionFormData = z.infer<typeof classSectionSchema>;

// 6. Subject Schema
export const subjectSchema = z.object({
  code: z.string().trim().min(2, "Código curricular deve ter pelo menos 2 caracteres").toUpperCase(),
  name: z.string().trim().min(2, "Nome da disciplina é obrigatório"),
  cycle: z.enum(["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY"], {
    required_error: "Selecione o ciclo",
  }),
  weeklyHours: z.coerce.number().int().min(1, "Carga semanal deve ter pelo menos 1 tempo"),
  isCore: z.boolean().default(false),
});

export type SubjectFormDataValues = z.infer<typeof subjectSchema>;

// 7. Teacher Assignment Schema
export const teacherAssignmentSchema = z.object({
  teacherId: z.string().nonempty("Selecione o professor"),
  sectionId: z.string().nonempty("Selecione a turma"),
  subjectId: z.string().nonempty("Selecione a disciplina"),
  weeklyHours: z.coerce.number().int().min(1, "Carga horária deve ter pelo menos 1 tempo"),
  academicYear: z.string().default("2025/2026"),
});

export type TeacherAssignmentFormValues = z.infer<typeof teacherAssignmentSchema>;
