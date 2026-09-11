"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal, currentStockStore } from "@/stores";
import { StockAdjustFormData, stockAdjustSchema } from "@/schemas/stock-schema";
import { useAdjustStock } from "@/hooks/stock";
import { Button, Input, GlobalModal, ButtonSubmit, Textarea } from "@/components";

export function AdjustStockModal() {
    const { closeModal, open } = useModal();
    const isOpen = open["adjust-stock"];
    const { currentStock } = currentStockStore();
    const { mutateAsync: adjustStock, isPending } = useAdjustStock();

    const {
        reset,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<StockAdjustFormData>({
        resolver: zodResolver(stockAdjustSchema),
        mode: "onChange",
    });

    async function onSubmit(data: StockAdjustFormData) {
        if (!currentStock) return;

        try {
            await adjustStock({ id: currentStock.id, data });
            handleCancel();
        } catch (error: any) {
            ErrorMessage(
                error?.response?.data?.message ||
                "Ocorreu um erro ao ajustar o stock."
            );
        }
    }

    const handleCancel = () => {
        reset();
        closeModal("adjust-stock");
    };

    if (!currentStock || !isOpen) return null;

    return (
        <GlobalModal
            canClose
            id="adjust-stock"
            title="Ajustar Stock"
            className="!max-w-md"
        >
            <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Produto:</span>{" "}
                    {currentStock.item?.name || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Quantidade actual:</span>{" "}
                    {currentStock.quantity}
                </p>
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Disponível:</span>{" "}
                    {currentStock.available}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    type="number"
                    label="Ajuste"
                    placeholder="Ex: 10 ou -5"
                    {...register("adjustment", { valueAsNumber: true })}
                    error={errors.adjustment?.message}
                />
                <p className="text-xs text-muted-foreground">Use valores positivos para adicionar e negativos para remover</p>

                <Textarea
                    label="Motivo"
                    placeholder="Ex: Ajuste de inventário"
                    {...register("reason")}
                    error={errors.reason?.message}
                    rows={3}
                />

                <div className="flex justify-end gap-4 mt-5">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <ButtonSubmit
                        className="w-max"
                        isLoading={isSubmitting || isPending}
                    >
                        Ajustar Stock
                    </ButtonSubmit>
                </div>
            </form>
        </GlobalModal>
    );
}
