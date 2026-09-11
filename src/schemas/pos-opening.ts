import { z } from "zod";

export const posOpeningSchema = z.object({
  initialCapital: z.string().trim().min(1, "Capital inicial é obrigatório"),
  workTime: z.string().trim().min(1, "Tempo de expediente é obrigatório"),
  storeId: z.string().trim().min(1, "Loja é obrigatória"),
  cashierIds: z
    .array(z.string().trim())
    .min(1, "Seleccione, pelo menos, um caixa"),
  fundType: z.string().trim().optional(),
  reason: z.string().trim().optional(),
});

export const posOpeningCashierSchema = z.object({
  initialCapital: z.string().trim().min(1, "Capital inicial é obrigatório"),
  workTime: z.string().trim().min(1, "Tempo de expediente é obrigatório"),
  storeId: z.string().trim().min(1, "Loja é obrigatória"),
  cashierIds: z
    .array(z.string().trim())
    .min(1, "Seleccione, pelo menos, um caixa"),
  fundType: z.string().trim().optional(),
  managerBarcode: z.string().trim().min(1, "Código do gerente é obrigatório"),
});

export type PosOpeningFormData = z.infer<typeof posOpeningSchema>;
export type PosOpeningCashierFormData = z.infer<typeof posOpeningCashierSchema>;
