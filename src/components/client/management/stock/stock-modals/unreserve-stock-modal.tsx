"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import {
  StockUnreserveFormData,
  stockUnreserveSchema,
} from "@/schemas/stock-schema";
import { useUnreserveStock } from "@/hooks/stock";
import {
  Button,
  Input,
  GlobalModal,
  ButtonSubmit,
  Textarea,
} from "@/components";
import { currentStockStore } from "@/stores/stock";

export function UnreserveStockModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["unreserve-stock"];
  const { currentStock } = currentStockStore();
  const { mutateAsync: unreserveStock, isPending } = useUnreserveStock();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StockUnreserveFormData>({
    resolver: zodResolver(stockUnreserveSchema),
    mode: "onChange",
  });

  async function onSubmit(data: StockUnreserveFormData) {
    if (!currentStock) return;

    // Validate amount doesn't exceed reserved
    if (data.amount > currentStock.reserved) {
      ErrorMessage(
        `A quantidade não pode ser maior que ${currentStock.reserved} (reservado)`
      );
      return;
    }

    try {
      await unreserveStock({ id: currentStock.id, data });
      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
          "Ocorreu um erro ao liberar a reserva."
      );
    }
  }

  const handleCancel = () => {
    reset();
    closeModal("unreserve-stock");
  };

  if (!currentStock || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="unreserve-stock"
      title="Liberar Reserva de Stock"
      className="!max-w-md"
    >
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Produto:</span>{" "}
          {currentStock.item?.name || "N/A"}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Reservado:</span>{" "}
          <span className="text-orange-600 font-semibold">
            {currentStock.reserved}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Disponível:</span>{" "}
          {currentStock.available}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="number"
          label="Quantidade a Liberar"
          placeholder="Ex: 5"
          {...register("amount", { valueAsNumber: true })}
          error={errors.amount?.message}
          max={currentStock.reserved}
        />
        <p className="text-xs text-muted-foreground">
          Máximo: {currentStock.reserved}
        </p>

        <Textarea
          label="Motivo"
          placeholder="Ex: Cancelamento de pedido #12345"
          {...register("reason")}
          error={errors.reason?.message}
          rows={3}
        />

        <div className="flex justify-end gap-4 mt-5">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <ButtonSubmit className="w-max" isLoading={isSubmitting || isPending}>
            Liberar Reserva
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
