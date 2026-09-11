"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    GlobalModal,
    Input,
    Button,
    Textarea,
    Icon,
    InputCurrency,
} from "@/components";
import { useModal } from "@/stores";
import { useCloseCashSession } from "@/hooks";
import { CashSession } from "@/types/cash-session";
import { ErrorMessage, formatCurrency, getApiErrorMessage } from "@/utils";

export const MODAL_POS_CLOSE_SESSION_ID = "pos-close-session-modal";

const closeSessionSchema = z.object({
    closingCash: z.coerce.number().min(0, "O valor de fecho deve ser pelo menos 0"),
    totalSales: z.coerce.number(),
    notes: z.string().optional(),
});

type CloseSessionFormData = z.infer<typeof closeSessionSchema>;

interface PosCloseSessionModalProps {
    currentSession?: CashSession;
}

export function PosCloseSessionModal({ currentSession }: PosCloseSessionModalProps) {
    const { closeModal } = useModal();
    const { mutateAsync: closeSession, isPending: isLoading } = useCloseCashSession();

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CloseSessionFormData>({
        resolver: zodResolver(closeSessionSchema),
        defaultValues: {
            totalSales: currentSession?.totalSales || 0,
            closingCash: 0,
            notes: "",
        }
    });

    useEffect(() => {
        if (currentSession) {
            setValue("totalSales", currentSession.totalSales || 0);
        }
    }, [currentSession, setValue]);

    const onSubmit = async (data: CloseSessionFormData) => {
        if (!currentSession?.id) {
            return;
        }

        try {
            await closeSession({
                id: currentSession.id,
                data: {
                    closingCash: data.closingCash,
                    totalSales: data.totalSales,
                    notes: data.notes || "",
                },
            });
            closeModal(MODAL_POS_CLOSE_SESSION_ID);
            reset();
        } catch (err: any) {
            console.error(err);
            ErrorMessage(getApiErrorMessage(err, "Não foi possível fechar a sessão de caixa."));
        }
    };

    return (
        <GlobalModal
            id={MODAL_POS_CLOSE_SESSION_ID}
            title="Fechar Sessão de Caixa"
            description="Confirme os valores finais e encerre a sessão actual."
            className="!w-max"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 min-w-[350px]">
                <div className="p-4 bg-muted/30 rounded-lg border border-primary/5 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total de Vendas</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(currentSession?.totalSales || 0)}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Icon name="TrendingUp" className="h-5 w-5 text-primary" />
                    </div>
                </div>

                <Controller
                    name="closingCash"
                    control={control}
                    render={({ field }) => (
                        <InputCurrency
                            ref={field.ref}
                            label="Valor em Caixa (Fecho)"
                            placeholder="0,00"
                            value={field.value}
                            onValueChange={(val) => field.onChange(val)}
                            error={errors.closingCash?.message}
                        />
                    )}
                />

                <Textarea
                    label="Notas / Observações"
                    placeholder="Alguma ocorrência durante o turno?"
                    error={errors.notes?.message}
                    {...register("notes")}
                />

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => closeModal(MODAL_POS_CLOSE_SESSION_ID)}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" loading={isLoading} variant="destructive">
                        Fechar Sessão
                    </Button>
                </div>
            </form>
        </GlobalModal>
    );
}
