import { z } from "zod";

export const requestAgtSeriesSchema = z
  .object({
    documentType: z.enum(["FT", "FR", "RC", "NC"], {
      required_error: "Seleccione o tipo de documento",
    }),
    seriesYear: z.string().min(4, "Ano fiscal inválido"),
    storeId: z.string().optional().or(z.literal("")),
    establishmentNumber: z
      .string()
      .trim()
      .max(20, "Máximo de 20 caracteres")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => Boolean(data.storeId) || Boolean(data.establishmentNumber?.trim()),
    {
      message: "Seleccione uma loja ou informe o código do estabelecimento",
      path: ["storeId"],
    },
  );

export type RequestAgtSeriesFormData = z.infer<typeof requestAgtSeriesSchema>;

export const agtPrivateKeySchema = z.object({
  privateKey: z
    .string()
    .trim()
    .min(100, "A chave parece ser demasiado curta.")
    .refine(
      (value) => value.includes("-----BEGIN PRIVATE KEY-----"),
      "A chave deve começar com -----BEGIN PRIVATE KEY-----",
    )
    .refine(
      (value) => value.includes("-----END PRIVATE KEY-----"),
      "A chave deve terminar com -----END PRIVATE KEY-----",
    ),
});

export type AgtPrivateKeyFormData = z.infer<typeof agtPrivateKeySchema>;

export const consultAgtInvoiceSchema = z.object({
  documentNo: z.string().trim().min(1, "Indique o número do documento"),
});

export type ConsultAgtInvoiceFormData = z.infer<typeof consultAgtInvoiceSchema>;

export const validateAgtDocumentSchema = z.object({
  documentNo: z.string().trim().min(1),
  action: z.enum(["CONFIRMAR", "REJEITAR"]),
  deductibleVATPercentage: z
    .number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%")
    .optional(),
  nonDeductibleAmount: z.number().optional(),
});

export type ValidateAgtDocumentFormData = z.infer<
  typeof validateAgtDocumentSchema
>;
