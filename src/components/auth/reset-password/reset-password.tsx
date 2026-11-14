"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2 } from "lucide-react";
import { resetPasswordAndLoginAction } from "@/actions/login";
import {
  AlertError,
  Button,
  ButtonSubmit,
  Input,
  PasswordStrengthBar,
  ResetPasswordSkeleton,
} from "@/components";
import { MindSchoolLogo } from "@/components/common/logo/mindschool-logo";
import { ResetPasswordFormData, resetPasswordSchema } from "@/schemas";
import { useModal } from "@/stores";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";
import {
  useAuthErrorReaction,
  useAuthScene,
  type AuthSceneBindings,
} from "../_components/auth-interactive-shell";
import { BackToLogin } from "../_components";
import { SuccessResetModal } from "./success-reset-modal";

export type ResetPasswordProps = Partial<AuthSceneBindings>;

function ResetPasswordForm({
  onFocusTargetChange: explicitFocusTargetChange,
  onPasswordVisibilityChange: explicitPasswordVisibilityChange,
  onTypingActivity: explicitTypingActivity,
  onReactionChange: explicitReactionChange,
}: ResetPasswordProps = {}) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { openModal } = useModal();
  const [redirectUrl, setRedirectUrl] = useState<string>("/");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const {
    onFocusTargetChange,
    onPasswordVisibilityChange,
    onTypingActivity,
    onReactionChange,
  } = useAuthScene({
    onFocusTargetChange: explicitFocusTargetChange,
    onPasswordVisibilityChange: explicitPasswordVisibilityChange,
    onTypingActivity: explicitTypingActivity,
    onReactionChange: explicitReactionChange,
  });
  const triggerErrorReaction = useAuthErrorReaction(onReactionChange);

  useEffect(() => {
    onPasswordVisibilityChange(newPasswordVisible || confirmPasswordVisible);
  }, [newPasswordVisible, confirmPasswordVisible, onPasswordVisibilityChange]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
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
    onTypingActivity("password", pass.length);
  };

  async function onChangePassword(data: ResetPasswordFormData) {
    if (!token) {
      triggerErrorReaction();
      ErrorMessage(
        "A ligação para definir a palavra-passe não foi encontrada ou expirou. Peça uma nova recuperação de palavra-passe.",
      );
      return;
    }

    onReactionChange("submitting");
    setIsSubmitting(true);
    try {
      const res = await resetPasswordAndLoginAction({
        token,
        newPassword: data.newPassword,
      });

      if (!res.user && res.message && res.redirectPath === "/auth/login") {
        triggerErrorReaction();
        ErrorMessage(res.message);
        return;
      }

      onReactionChange("success");
      setRedirectUrl(res.redirectPath || "/");
      openModal("success-reset-modal");
    } catch (error: unknown) {
      triggerErrorReaction();
      ErrorMessage(
        getApiErrorMessage(
          error,
          "Não foi possível alterar a palavra-passe. Tente novamente mais tarde.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center size-16 sm:size-20 rounded-xs overflow-hidden p-1">
              <MindSchoolLogo size={64} priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold tracking-tight text-foreground">
                MindSchool<span className="text-primary">.</span>
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
                Definição de Credencial
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">
            Nova palavra-passe
          </h1>
          <p className="text-sm text-muted-foreground">
            Defina uma palavra-passe robusta para proteger a gestão da sua instituição.
          </p>
        </div>

        <form onSubmit={handleSubmit(onChangePassword, triggerErrorReaction)} className="grid gap-5">
          <div className="space-y-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Nova palavra-passe
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="password"
                    startIcon="Lock"
                    placeholder="Introduza a nova palavra-passe"
                    {...register("newPassword", {
                      onChange: (e) => onTypingActivity("password", e.target.value.length),
                      onBlur: () => onFocusTargetChange("idle"),
                    })}
                    onFocus={() => onFocusTargetChange("password")}
                    onPasswordVisibilityChange={setNewPasswordVisible}
                    autoComplete="new-password"
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
            startIcon="Lock"
            label="Confirmar nova palavra-passe"
            placeholder="Confirme a nova palavra-passe"
            {...register("confirmPassword", {
              onChange: (e) => onTypingActivity("password", e.target.value.length),
              onBlur: () => onFocusTargetChange("idle"),
            })}
            onFocus={() => onFocusTargetChange("password")}
            onPasswordVisibilityChange={setConfirmPasswordVisible}
            error={errors.confirmPassword && errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          <ButtonSubmit isLoading={isSubmitting} disabled={!isValid} className="w-full">
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

export function ResetPassword(props: ResetPasswordProps = {}) {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm {...props} />
    </Suspense>
  );
}
