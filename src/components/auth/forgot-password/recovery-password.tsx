"use client";
import Logo from "@/assets/brand.png";
import { ButtonSubmit, Input } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { ForgotPasswordFormData } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schemas";
import { ErrorMessage } from "@/utils/messages";
import { OTPModal } from "./otp-modal";
import { AuthHeader, BackToLogin } from "../_components";
import { cn } from "@/lib";
import Image from "next/image";
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
        className={cn(
          "mx-auto flex w-full max-w-sm flex-col gap-5",
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Image src={Logo} alt="Logo" className="size-20" />
          </div>
          <AuthHeader
            title="Recuperar palavra-passe"
            description="Introduza o seu endereço de correio electrónico. Enviaremos as instruções para definir uma nova palavra-passe."
          />
        </div>

        <div className="grid gap-6">
          <Input
            label="Email"
            type="email"
            startIcon="Mail"
            {...register("email")}
            placeholder="Endereço de email"
            error={errors.email?.message}
          />

          <ButtonSubmit isLoading={isPending} className="w-full">
            {isPending ? "A enviar..." : "Verificar"}
          </ButtonSubmit>

          <BackToLogin />
        </div>
      </form>
      <OTPModal message={message} />
    </>
  );
}
