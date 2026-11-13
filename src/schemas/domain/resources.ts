import { z } from "zod";
import {
  officialDocumentNumberRegex,
  optionalAngolanPlateSchema,
  optionalIsbnSchema,
  optionalPersonNameSchema,
  optionalPhoneNumberSchema,
  optionalSafeTextSchema,
  personNameSchema,
  quantitySchema,
  safeTextSchema,
  timeHHMMSchema,
} from "../helps";

export const libraryBookSchema = z.object({
  title: safeTextSchema(2, 200, "O título da obra"),
  author: personNameSchema(3, 150, "O autor principal"),
  isbn: optionalIsbnSchema,
  copies: quantitySchema(1, 5000, "O número de exemplares"),
  category: optionalSafeTextSchema(100, 2, "A categoria"),
  location: optionalSafeTextSchema(120, 2, "A localização"),
});
export type LibraryBookFormData = z.infer<typeof libraryBookSchema>;

export const transportStopSchema = z.object({
  name: optionalSafeTextSchema(120, 2, "O nome da paragem"),
  time: z
    .string()
    .trim()
    .refine((v) => v === "" || timeHHMMSchema("A hora da paragem").safeParse(v).success, "Hora inválida (HH:MM).")
    .optional(),
});

export const transportRouteSchema = z
  .object({
    name: safeTextSchema(2, 120, "O nome da rota"),
    plate: optionalAngolanPlateSchema,
    capacity: quantitySchema(1, 120, "A lotação"),
    driver: optionalPersonNameSchema(3, 150, "O nome do motorista"),
    phone: optionalPhoneNumberSchema,
    stops: z.array(transportStopSchema),
  })
  .superRefine((data, ctx) => {
    data.stops.forEach((s, idx) => {
      if (s.time && !s.name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stops", idx, "name"],
          message: "Indique o nome da paragem quando definir uma hora.",
        });
      }
    });
  });
export type TransportRouteFormData = z.infer<typeof transportRouteSchema>;

export const announcementSchema = z
  .object({
    title: safeTextSchema(3, 200, "O título do comunicado"),
    body: safeTextSchema(5, 5000, "A mensagem"),
    audience: z.enum(["escola", "turma"]),
    sectionId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.audience === "turma" && !data.sectionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sectionId"],
        message: "Seleccione a turma destinatária.",
      });
    }
  });
export type AnnouncementFormData = z.infer<typeof announcementSchema>;

export const verifyDocumentCodeSchema = z.object({
  documentNumber: z
    .string({ error: "Indique o número do documento." })
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => v.length > 0, "Indique o número do documento.")
    .refine(
      (v) => officialDocumentNumberRegex.test(v),
      "Código inválido (ex.: DEC-5000000001-2026-000001)."
    ),
});
export type VerifyDocumentCodeFormData = z.infer<typeof verifyDocumentCodeSchema>;
