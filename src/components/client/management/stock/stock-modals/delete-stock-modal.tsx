"use client";
import { useState } from "react";
import { useModal, currentStockStore } from "@/stores";
import { useDeleteStock } from "@/hooks/stock";
import { Button, GlobalModal, Icon, ButtonSubmit } from "@/components";
import { ErrorMessage } from "@/utils/messages";

export function DeleteStockModal() {
    const { closeModal, open } = useModal();
    const isOpen = open["delete-stock"];
    const { currentStock } = currentStockStore();
    const { mutateAsync: deleteStock } = useDeleteStock();
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!currentStock) return;

        try {
            setIsDeleting(true);
            await deleteStock(currentStock.id);
            closeModal("delete-stock");
        } catch (error: any) {
            ErrorMessage(
                error?.response?.data?.message || "Não foi possível apagar o registo de stock."
            );
        } finally {
            setIsDeleting(false);
        }
    }

    if (!currentStock || !isOpen) return null;

    return (
        <GlobalModal
            warning
            canClose
            id="delete-stock"
            title={`Tem certeza que deseja apagar?`}
            description="Esta acção não pode ser anulada."
            className="!w-max"
        >

            <div className="flex justify-end gap-4 mt-6">
                <Button
                    variant="outline"
                    onClick={() => closeModal("delete-stock")}
                    disabled={isDeleting}
                >
                    Cancelar
                </Button>
                <Button
                    disabled={isDeleting}
                    variant="destructive"
                    onClick={() => handleDelete()}
                >
                    {isDeleting ? "Apagando..." : `Apagar`}
                </Button>
            </div>
        </GlobalModal>
    );
}
