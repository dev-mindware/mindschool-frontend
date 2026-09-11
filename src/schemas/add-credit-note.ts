import { z } from "zod";
import { optionalTaxNumberSchema } from "./helps";

const BaseCreditNoteSchema = z.object({
  // Art. 8.º n.º 4 do D.P. 71/25: a nota de crédito deve indicar o motivo.
  notes: z.string().trim().min(1, "Indique o motivo da nota de crédito"),
});

// Motivos de correção/rectificação (art. 3.º l) do D.P. 71/25):
// rectificação genérica, devolução de bens ou desconto.
export const CORRECTION_REASONS = ["CORRECTION", "RETURN", "DISCOUNT"] as const;

export const CorrectionSchema = BaseCreditNoteSchema.extend({
  reason: z.enum(CORRECTION_REASONS),
  managerBarcode: z.string().trim().optional(),
  invoiceBody: z.object({
    client: z.object({
      // O cliente é herdado da factura original (não é escolhido aqui). Fica
      // opcional para suportar facturas ao consumidor final (sem registo).
      id: z.string().trim().optional().or(z.literal("")),
      name: z.string().trim().optional().or(z.literal("")),
      phone: z.string().trim().optional().or(z.literal("")),
      email: z.string().trim().optional().or(z.literal("")),
      address: z.string().trim().optional().or(z.literal("")),
      taxNumber: optionalTaxNumberSchema,
    }),
    items: z.array(
      z.object({
        id: z.string().trim().min(1),
        name: z.string().optional(),
        description: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        quantity: z.number().positive("A quantidade deve ser superior a zero"),
        price: z.number().positive("O preço deve ser superior a zero"),
        cost: z.number().optional(),
        type: z.enum(["PRODUCT", "SERVICE"]).optional(),
        unit: z.string().optional(),
        // Taxa de imposto do item (em %) e respectivo id — usados para o
        // cálculo separado por taxa (art. 10.º n.º 2 do D.P. 71/25).
        tax: z.number().optional(),
        taxId: z.string().optional(),
      }),
    ).min(1, "Adicione, pelo menos, um item ao documento corrigido"),
    issueDate: z.string().trim().date(),
    dueDate: z.string().trim().optional(), // opcional para permitir esconder em factura-recibo
    total: z.number(),
    taxAmount: z.number(),
    subtotal: z.number(),
    discountAmount: z.number(),
    notes: z.string().optional(),
  }),
  creditNote: z.object({
    subtotal: z.number(),
    taxAmount: z.number(),
    discountAmount: z.number(),
    total: z.number(),
    items: z.array(
      z.object({
        id: z.string(),
        itemsId: z.string(),
        itemName: z.string(),
        originalPrice: z.number(),
        newPrice: z.number(),
        originalQuantity: z.number(),
        quantity: z.number(),
        originalTotal: z.number(),
        newTotal: z.number(),
        originalTaxAmount: z.number(),
        newTaxAmount: z.number(),
      }),
    ),
  }),
});

export const AnnulmentSchema = BaseCreditNoteSchema.extend({
  reason: z.literal("ANNULMENT"),
  // A autorização do gerente é obrigatória na anulação, mas é recolhida via
  // ManagerAuthModal (scanner) já depois da validação do formulário; por isso
  // fica opcional no schema — a presença é garantida pelo modal.
  managerBarcode: z.string().trim().optional(),
  // invoiceBody is allowed but ignored for simple annulment payload
});

export const CreditNoteSchema = z.union([CorrectionSchema, AnnulmentSchema]);

export type CreditNoteFormData = z.infer<typeof CreditNoteSchema>;
