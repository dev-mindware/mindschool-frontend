"use client";

import { useModal } from "@/stores";
import { useUpdateUser } from "@/hooks/users";
import { Button, Input, GlobalModal } from "@/components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage, SucessMessage } from "@/utils";

const schema = z.object({
  email: z.string().email("Formato de email inválido").min(1, "Campo obrigatório"),
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
    },
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
          SucessMessage("Email atualizado com sucesso.");
          closeModal("change-email");
        },
        onError: (error: any) => {
          ErrorMessage(
            error?.response?.data?.message || "Não foi possível atualizar o email.",
          );
        },
      },
    );
  };

  return (
    <GlobalModal
      id="change-email"
      title="Alterar email de acesso"
      description="Introduza o novo email para aceder à plataforma MindSchool."
      canClose
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Novo email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
          className="h-10 text-xs"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal("change-email")}
            className="h-9 text-xs"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="h-9 text-xs font-semibold">
            {isPending ? "A guardar..." : "Guardar alteração"}
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
