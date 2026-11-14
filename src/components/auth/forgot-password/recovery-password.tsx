"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonSubmit, Input } from "@/components";
import { MindSchoolLogo } from "@/components/common/logo/mindschool-logo";
import { useForgotPassword } from "@/hooks/auth";
import { cn } from "@/lib";
import { ForgotPasswordFormData, forgotPasswordSchema } from "@/schemas";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";
import {
  useAuthErrorReaction,
  useAuthScene,
  type AuthSceneBindings,
} from "../_components/auth-interactive-shell";
import { BackToLogin } from "../_components";
import { OTPModal } from "./otp-modal";

export type RecoveryPasswordProps = Partial<AuthSceneBindings>;

export function RecoveryPassword({
  onFocusTargetChange: explicitFocusTargetChange,
  onPasswordVisibilityChange: explicitPasswordVisibilityChange,
  onTypingActivity: explicitTypingActivity,
  onReactionChange: explicitReactionChange,
}: RecoveryPasswordProps = {}) {
  const { openModal } = useModal();
  const [message, setMessage] = useState("");
  const {
    onFocusTargetChange,
    onTypingActivity,
    onReactionChange,
  } = useAuthScene({
    onFocusTargetChange: explicitFocusTargetChange,
    onPasswordVisibilityChange: explicitPasswordVisibilityChange,
    onTypingActivity: explicitTypingActivity,
    onReactionChange: explicitReactionChange,
  });
  const triggerErrorReaction = useAuthErrorReaction(onReactionChange);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  async function onSubmit(data: ForgotPasswordFormData) {
    onReactionChange("submitting");
    try {
      const res = await forgotPassword(data.email);
      onReactionChange("success");
      setMessage(res.message);
      openModal("information-modal");
    } catch (error: unknown) {
      triggerErrorReaction();
      ErrorMessage(
        getApiErrorMessage(
          error,
          "Não foi possível enviar as instruções de recuperação. Verifique o e-mail indicado e tente novamente.",
        ),
      );
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, triggerErrorReaction)}
        className={cn("flex w-full max-w-md flex-col gap-6")}
      >
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
                Recuperação de Acesso
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">
            Recuperar palavra-passe
          </h1>
          <p className="text-sm text-muted-foreground">
            Introduza o seu email institucional. Enviaremos as instruções para definir uma nova palavra-passe.
          </p>
        </div>

        <div className="grid gap-5">
          <Input
            label="Email Institucional"
            type="email"
            startIcon="Mail"
            {...register("email", {
              onChange: (e) => onTypingActivity("email", e.target.value.length),
              onBlur: () => onFocusTargetChange("idle"),
            })}
            onFocus={() => onFocusTargetChange("email")}
            placeholder="exemplo@escola.ao"
            error={errors.email?.message}
            autoComplete="email"
          />

          <ButtonSubmit isLoading={isPending} disabled={!isValid} className="w-full">
            {isPending ? "A enviar instruções..." : "Verificar Email"}
          </ButtonSubmit>

          <div className="pt-2">
            <BackToLogin />
          </div>
        </div>
      </form>
      <OTPModal message={message} />
    </>
  );
}
