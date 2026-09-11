import { z } from "zod";

const restockItemSchema = z.object({
  itemId: z.string().min(1, "Obrigatório"),
  quantity: z.coerce.number().min(0.01, "Mínimo 0.01"),
  costAtEntry: z.coerce.number().min(0, "Custo inválido"),
});

export const restockSchema = z.object({
  number: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(restockItemSchema).min(1, "Adicione pelo menos um artigo"),
});

export type RestockFormValues = z.infer<typeof restockSchema>;

export const restockDefaultValues: RestockFormValues = {
  number: "",
  notes: "",
  items: [{ itemId: "", quantity: 1, costAtEntry: 0 }],
};
