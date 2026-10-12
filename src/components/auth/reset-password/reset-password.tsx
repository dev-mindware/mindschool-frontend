"use client";

import Image from "next/image";
import { ButtonSubmit, Input, ResetPasswordSkeleton, Button, PasswordStrengthBar, AlertError } from "@/components";
import { MindSchoolLogo } from "@/components/common/logo/mindschool-logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordFormData, resetPasswordSchema } from "@/schemas";
import { ErrorMessage } from "@/utils/messages";
import { useSearchParams } from "next/navigation";
import { BackToLogin } from "../_components";
import { Suspense, useState } from "react";
import { Wand2 } from "lucide-react";
import { useModal } from "@/stores";
import { SuccessResetModal } from "./success-reset-modal";
import { resetPasswordAndLoginAction } from "@/actions/login";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { openModal } = useModal();
  const [redirectUrl, setRedirectUrl] = useState<string>("/");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  async function onChangePassword(data: ResetPasswordFormData) {
    if (!token) {
      ErrorMessage(
        "O código de recuperação da palavra-passe não foi encontrado ou é inválido. Solicite uma nova recuperação.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPasswordAndLoginAction({
        token,
        newPassword: data.newPassword,
      });

      if (!res.user && res.message && res.redirectPath === "/auth/login") {
        ErrorMessage(res.message);
        return;
      }

      setRedirectUrl(res.redirectPath || "/");
      openModal("success-reset-modal");
    } catch (error: any) {
      ErrorMessage(
        error?.message ||
        "Não foi possível alterar a palavra-passe. Tente novamente mais tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center size-20 rounded-md overflow-hidden p-1">
              <MindSchoolLogo size={64} priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground">
                MindSchool<span className="text-primary">.</span>
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
                Definição de Credencial
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2">
            Nova palavra-passe
          </h1>
          <p className="text-sm text-muted-foreground">
            Defina uma palavra-passe robusta para proteger a gestão da sua instituição.
          </p>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="grid gap-5">
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
                  title="Gerar uma palavra-passe segura automaticamente"
                  onClick={generateStrongPassword}
                >
                  <Wand2 className="size-4 text-primary" />
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
            error={errors.confirmPassword && errors.confirmPassword?.message}
          />

          <ButtonSubmit isLoading={isSubmitting} className="w-full">
            Confirmar e Concluir
          </ButtonSubmit>

          <div className="pt-2">
            <BackToLogin />
          </div>
        </form>
      </div>

      <SuccessResetModal redirectUrl={redirectUrl} />
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
