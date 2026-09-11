"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    GlobalModal,
    Input,
    Button,
    Textarea,
    InputCurrency,
} from "@/components";
import { useModal, currentStoreStore } from "@/stores";
import { cashSessionsService } from "@/services/cash-sessions-service";
import { SucessMessage } from "@/utils/messages";
import { CashSession } from "@/types/cash-session";
import { ErrorMessage, getApiErrorMessage } from "@/utils";

export const MODAL_POS_REGISTER_EXPENSE_ID = "pos-register-expense-modal";

const expenseSchema = z.object({
    description: z.string().min(1, "A descrição é obrigatória"),
    amount: z.coerce.number().positive("O valor deve ser maior que zero"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface PosRegisterExpenseModalProps {
    currentSession?: CashSession;
}

export function PosRegisterExpenseModal({ currentSession }: PosRegisterExpenseModalProps) {
    const { closeModal } = useModal();
    const { currentStore } = currentStoreStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
    });

    const onSubmit = async (data: ExpenseFormData) => {
        if (!currentStore?.id || !currentSession?.id) {
            return;
        }

        try {
            setIsLoading(true);
            await cashSessionsService.registerExpense({
                description: data.description,
                amount: data.amount,
                cashSessionId: currentSession.id,
            });
            SucessMessage("Despesa registada com sucesso!");
            closeModal(MODAL_POS_REGISTER_EXPENSE_ID);
            reset();
        } catch (err: any) {
            console.error(err);
            ErrorMessage(getApiErrorMessage(err, "Não foi possível registar a despesa."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GlobalModal
            id={MODAL_POS_REGISTER_EXPENSE_ID}
            title="Registar Despesa"
            description="Introduza a descrição e o valor da despesa."
            className="!w-max"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Textarea
                    label="Descrição"
                    placeholder="Ex: Material de escritório, Limpeza, etc."
                    error={errors.description?.message}
                    {...register("description")}
                />

                <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                        <InputCurrency
                            ref={field.ref}
                            label="Valor"
                            placeholder="0,00"
                            value={field.value}
                            onValueChange={(val) => field.onChange(val)}
                            error={errors.amount?.message}
                        />
                    )}
                />

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => closeModal(MODAL_POS_REGISTER_EXPENSE_ID)}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" loading={isLoading}>
                        Registar Despesa
                    </Button>
                </div>
            </form>
        </GlobalModal>
    );
}
