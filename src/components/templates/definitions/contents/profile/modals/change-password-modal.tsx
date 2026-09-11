"use client";

import { useModal } from "@/stores";
import { useChangePassword } from "@/hooks/users";
import { Button, Input } from "@/components";
import { GlobalModal } from "@/components/modal";
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <Input
          label="Palavra-passe actual"
          type="password"
          placeholder="Introduza a palavra-passe actual"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <Input
          label="Nova palavra-passe"
          type="password"
          placeholder="Introduza a nova palavra-passe"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <Input
          label="Confirmar palavra-passe"
          type="password"
          placeholder="Repita a nova palavra-passe"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => closeModal("change-password")}
            disabled={isPending}
          >
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
