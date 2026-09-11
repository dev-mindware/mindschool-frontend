"use client";

import { useModal } from "@/stores";
import { useUpdateUser } from "@/hooks/users";
import { Button, Input } from "@/components";
import { GlobalModal } from "@/components/modal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage, SucessMessage } from "@/utils";

const schema = z.object({
    email: z.string().email("Formato de email inválido").nonempty("Campo obrigatório"),
});

type FormData = z.infer<typeof schema>;

interface Props {
    currentEmail: string;
}

export function ChangeEmailModal({ currentEmail }: Props) {
    const { closeModal } = useModal();
    const { mutate: updateProfile, isPending } = useUpdateUser();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: currentEmail,
        }
    });

    const onSubmit = (data: FormData) => {
        if (data.email === currentEmail) {
            closeModal("change-email");
            return;
        }

        updateProfile(
            { email: data.email },
            {
                onSuccess: () => {
                    SucessMessage("Email alterado com sucesso!");
                    closeModal("change-email");
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError: (error: any) => {
                    ErrorMessage(error?.response?.data?.message || "Erro ao alterar o email.");
                },
            }
        );
    };

    return (
        <GlobalModal
            id="change-email"
            title="Alterar Email"
            description="Introduza o seu novo endereço de email."
            canClose
            className="max-w-md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <Input
                    label="Novo Email"
                    type="email"
                    placeholder="exemplo@email.com"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="ghost" onClick={() => closeModal("change-email")} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "A guardar..." : "Guardar alterações"}
                    </Button>
                </div>
            </form>
        </GlobalModal>
    );
}
