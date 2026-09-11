"use client";
import Logo from "@/assets/brand.png";
import Image from "next/image";
import { ButtonSubmit, Input, ResetPasswordSkeleton, Button, PasswordStrengthBar, AlertError } from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordFormData, resetPasswordSchema } from "@/schemas";
import { ErrorMessage } from "@/utils/messages";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "@/hooks/auth";
import { AuthHeader, BackToLogin } from "../_components";
import { Suspense } from "react";
import { Wand2 } from "lucide-react";
import { useModal } from "@/stores";
import { SuccessResetModal } from "./success-reset-modal";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { openModal } = useModal();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const newPassword = watch("newPassword") || "";

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("newPassword", pass, { shouldValidate: true });
    setValue("confirmPassword", pass, { shouldValidate: true });
  };

  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  async function onChangePassword(data: ResetPasswordFormData) {
    if (!token) {
      ErrorMessage(
        "O código de recuperação da palavra-passe não foi encontrado ou é inválido. Solicite uma nova recuperação.",
      );
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: data.newPassword,
      });
      openModal("success-reset-modal");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
        "Não foi possível alterar a palavra-passe. Tente novamente mais tarde.",
      );
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Image src={Logo} alt="Logo" className="size-20" />
          </div>
          <AuthHeader
            title="Nova palavra-passe"
            description="Introduza e confirme a nova palavra-passe para recuperar o acesso à conta."
          />
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="grid gap-6">
          <div className="space-y-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Nova palavra-passe
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="password"
                    placeholder="Introduza a nova palavra-passe"
                    {...register("newPassword")}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  title="Gerar uma palavra-passe segura"
                  onClick={generateStrongPassword}
                >
                  <Wand2 className="size-4" />
                </Button>
              </div>
            </div>

            <PasswordStrengthBar password={newPassword} />

            {errors.newPassword?.message && (
              <AlertError errorMessage={errors.newPassword.message} />
            )}
          </div>

          <Input
            type="password"
            label="Confirmar nova palavra-passe"
            placeholder="Confirme a nova palavra-passe"
            {...register("confirmPassword")}
            error={
              errors.confirmPassword &&
              errors.confirmPassword?.message
            }
          />
          <ButtonSubmit isLoading={isPending} className="w-full">
            Confirmar
          </ButtonSubmit>
          <BackToLogin />
        </form>
      </div>

      <SuccessResetModal />
    </>
  );
}

export function ResetPassword() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
