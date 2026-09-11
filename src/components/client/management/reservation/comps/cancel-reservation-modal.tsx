"use client";
import { useCancelReservation } from "@/hooks";
import { Button, GlobalModal } from "@/components";
import { currentStockStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { useRouter } from "next/navigation";

export function CancelReservationModal() {
    const router = useRouter();
    const { closeModal, open } = useModal();
    const isOpen = open["cancel-reservation"];
    const { currentReservation, setCurrentReservation } = currentStockStore();
    const { mutateAsync: cancelMutation, isPending } = useCancelReservation();

    async function handleCancel() {
        if (!currentReservation) return;
        try {
            await cancelMutation(currentReservation.id);
            router.push("/management/reservation");
            setCurrentReservation(null);
            closeModal("cancel-reservation");
        } catch (error: any) {
            ErrorMessage(
                error?.response?.data?.message || "Erro ao cancelar a reserva."
            );
        }
    }

    if (!isOpen) return null;

    return (
        <GlobalModal
            warning
            canClose
            className="!w-max"
            id="cancel-reservation"
            title="Tem certeza que deseja cancelar esta reserva?"
            description="Esta acção removerá a reserva do sistema e devolverá a quantidade ao stock disponível."
        >
            <div className="flex justify-end gap-4 mt-6">
                <Button onClick={() => closeModal("cancel-reservation")} variant="outline">
                    Voltar
                </Button>
                <Button
                    disabled={isPending}
                    variant="destructive"
                    onClick={handleCancel}
                >
                    {isPending ? "Cancelando..." : "Confirmar Cancelamento"}
                </Button>
            </div>
        </GlobalModal>
    );
}
