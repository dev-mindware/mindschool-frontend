import { z } from "zod";

export const stockSchema = z.object({
  quantity: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  itemsId: z.string().trim().min(1, "Produto é obrigatório"),
  storeId: z.string().trim().min(1, "Loja é obrigatória"),
  reserved: z
    .number()
    .min(0, "Reservado deve ser maior ou igual a 0")
    .optional(),
});

export const stockAdjustSchema = z.object({
  adjustment: z.number().min(1, "Ajuste deve ser maior que 0"),
  reason: z.string().trim().min(3, "Motivo deve ter pelo menos 3 caracteres"),
});

export const stockReserveSchema = z
  .object({
    itemsId: z.string().trim().min(1, "Produto é obrigatório"),
    clientId: z.string().trim().min(1, "Cliente é obrigatório"),
    quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
    startDate: z.string().trim().min(1, "Data de início é obrigatória"),
    endDate: z.string().trim().min(1, "Data de fim é obrigatória"),
    startTime: z.string().trim().min(1, "Hora de início é obrigatória"),
    endTime: z.string().trim().min(1, "Hora de fim é obrigatória"),
    description: z
      .string()
      .trim()
      .min(3, "Descrição deve ter pelo menos 3 caracteres"),
  })
  .superRefine((data, ctx) => {
    const now = new Date();

    const startDateTime = new Date(`${data.startDate}T${data.startTime}:00`);
    const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);

    if (startDateTime < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A data/hora de início não pode ser no passado",
        path: ["startDate"],
      });
    }

    if (endDateTime <= startDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A data/hora de fim deve ser posterior à data/hora de início",
        path: ["endDate"],
      });
    }
  });

export const stockUnreserveSchema = z.object({
  amount: z.number().min(1, "Quantidade deve ser maior que 0"),
  reason: z.string().trim().min(3, "Motivo deve ter pelo menos 3 caracteres"),
});

export type StockFormData = z.infer<typeof stockSchema>;
export type StockAdjustFormData = z.infer<typeof stockAdjustSchema>;
export type StockReserveFormData = z.infer<typeof stockReserveSchema>;
export type StockUnreserveFormData = z.infer<typeof stockUnreserveSchema>;
