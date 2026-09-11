"use client";

import { useModal, currentStockStore } from "@/stores";
import { useAuth } from "@/hooks/auth";
import { useGetUser } from "@/hooks/users";
import { useCancelReservation } from "@/hooks";
import { GlobalModal, Button, Badge } from "@/components";
import { StockReservationResponse } from "@/types/stock";
import { Loader2, Calendar, User, Package, FileText, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateTimeRaw } from "@/utils";
import { CancelReservationModal } from "./cancel-reservation-modal";
import { ReserveStockModal } from "../../stock";

interface ReservationDetailModalProps {
    reservation: StockReservationResponse | null;
}

export function ReservationDetailModal({ reservation }: ReservationDetailModalProps) {
    const router = useRouter();
    const { closeModal, openModal } = useModal();
    const { setCurrentReservation } = currentStockStore();
    const { user } = useAuth();
    const isOwner = user?.role === "OWNER";
    const { data: creator, isLoading: isLoadingCreator } = useGetUser(isOwner ? reservation?.createdById : undefined);
    const { mutateAsync: cancelReservation, isPending: isCancelling } = useCancelReservation();

    if (!reservation) return null;

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "SCHEDULED": return { label: "Agendada", variant: "pending" as const };
            case "ACTIVE": return { label: "Activa", variant: "default" as const };
            case "COMPLETED": return { label: "Concluída", variant: "success" as const };
            case "CANCELLED": return { label: "Cancelada", variant: "destructive" as const };
            default: return { label: status, variant: "outline" as const };
        }
    };

    const statusInfo = getStatusInfo(reservation.status);

    return (
        <>
        <GlobalModal
            canClose
            id="reservation-detail"
            title="Detalhes da Reserva"
            className="!max-w-2xl"
        >
            <div className="space-y-6 py-4">
                {/* Header Info */}
                <div className="flex items-start justify-between border-b pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold">{reservation.item?.name}</h3>
                            <Badge variant={statusInfo.variant}>
                                {statusInfo.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            Ref: {reservation.id.slice(0, 8)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                            {reservation.quantity} {reservation.item?.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">Reservado</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {/* Dates */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" /> Período
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Início</p>
                                <p className="font-medium">{formatDateTimeRaw(reservation.startDate)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Fim</p>
                                <p className="font-medium">{formatDateTimeRaw(reservation.endDate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Entities */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" /> Participantes
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Cliente</p>
                                <p className="font-medium">{reservation.client?.name}</p>
                                <p className="text-xs text-muted-foreground">{reservation.client?.email}</p>
                            </div>
                            {isOwner && (
                                <div className="pt-1">
                                    <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Criado Por</p>
                                    {isLoadingCreator ? (
                                        <div className="flex items-center gap-2 text-xs py-1">
                                            <Loader2 className="h-3 w-3 animate-spin" /> A carregar...
                                        </div>
                                    ) : (
                                        <p className="font-medium">{creator?.name || "Desconhecido"}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {reservation.description && (
                    <div className="space-y-2 border-t pt-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" /> Descrição
                        </h4>
                        <p className="text-sm bg-muted p-3 rounded-md text-muted-foreground italic">
                            "{reservation.description}"
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                            setCurrentReservation(reservation);
                            openModal("cancel-reservation");
                            closeModal("reservation-detail");
                        }}
                    >
                        <Trash2 className="h-4 w-4" /> Cancelar Reserva
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                            setCurrentReservation(reservation);
                            openModal("reserve-stock");
                            closeModal("reservation-detail");
                        }}
                    >
                        <Edit className="h-4 w-4" /> Editar Reserva
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => closeModal("reservation-detail")}>
                        Fechar
                    </Button>
                </div>
            </div>
        </GlobalModal>
        <CancelReservationModal />
        <ReserveStockModal />
        </>
    );
}
