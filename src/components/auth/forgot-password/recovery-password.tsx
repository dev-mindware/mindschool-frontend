"use client";

import { ButtonSubmit, Input } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { ForgotPasswordFormData } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schemas";
import { ErrorMessage } from "@/utils/messages";
import { OTPModal } from "./otp-modal";
import { BackToLogin } from "../_components";
import { cn } from "@/lib";
import Image from "next/image";
import { MindSchoolLogo } from "@/components/common/logo/mindschool-logo";
import { useState } from "react";
import { useForgotPassword } from "@/hooks/auth";

export function RecoveryPassword() {
  const { openModal } = useModal();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      const res = await forgotPassword(data.email);
      setMessage(res.message);
      openModal("information-modal");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
          "Ocorreu um erro ao enviar o email. Tente mais tarde.",
      );
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("mx-auto flex w-full max-w-sm flex-col gap-6")}
      >
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
                Recuperação de Acesso
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2">
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
            {...register("email")}
            placeholder="exemplo@escola.ao"
            error={errors.email?.message}
          />

          <ButtonSubmit isLoading={isPending} className="w-full">
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
