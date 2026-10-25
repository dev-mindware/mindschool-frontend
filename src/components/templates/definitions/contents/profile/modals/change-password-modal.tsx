"use client";

import { useModal } from "@/stores";
import { useChangePassword } from "@/hooks/users";
import { Button, Input, GlobalModal } from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage, SucessMessage } from "@/utils";
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from "@/schemas/change-password";

export function ChangePasswordModal() {
  const { closeModal } = useModal();
  const { mutate: changePassword, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          SucessMessage("Palavra-passe alterada com sucesso.");
          reset();
          closeModal("change-password");
        },
        onError: (error: any) => {
          ErrorMessage(
            error?.response?.data?.message || "Não foi possível alterar a palavra-passe.",
          );
        },
      },
    );
  };

  return (
    <GlobalModal
      id="change-password"
      title="Alterar palavra-passe"
      description="Defina uma palavra-passe segura para a sua conta."
      canClose
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Palavra-passe atual"
          type="password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
          className="h-10 text-xs"
        />
        <Input
          label="Nova palavra-passe"
          type="password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
          className="h-10 text-xs"
        />
        <Input
          label="Confirmar nova palavra-passe"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          className="h-10 text-xs"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal("change-password")}
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
