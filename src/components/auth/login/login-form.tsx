"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/schemas";
import { ButtonSubmit, Input } from "@/components";
import { loginAction } from "@/actions/login";
import { useAuthStore } from "@/stores";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { queryClient } from "@/lib";
import { getApiErrorMessage } from "@/utils";

export function LoginForm() {
  const router = useRouter();
  const { setUser, setIsAuthenticating } = useAuthStore();
  const [needsMfa, setNeedsMfa] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  async function handleLogin({ email, password, totpCode }: LoginFormData) {
    try {
      const res = await loginAction({ email, password, totpCode });

      if (res.requiresMfa) {
        setNeedsMfa(true);
        if (totpCode) ErrorMessage("Código inválido. Tente novamente.");
        return;
      }

      if (!res.user) {
        ErrorMessage(res.message || "Erro ao tentar fazer login.");
        return;
      }

      setIsAuthenticating(true);
      useActiveSchoolStore.getState().setMemberships(res.memberships ?? []);

      // ✅ Popula o cache do React Query antes de redirecionar para evitar requisição redundante
      queryClient.setQueryData(["user"], res.user);

      setUser(res.user);
      router.replace(res.redirectPath || "/");
    } catch (error) {
      setIsAuthenticating(false);
      ErrorMessage(getApiErrorMessage(error, "Ocorreu um erro inesperado. Tente novamente."));
    }
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Image src={"/mindgest.png"} alt="Logótipo do MindSchool" className="size-20" width={100} height={100} />
        <h1 className="text-2xl font-bold">Bem-vindo(a) ao MindSchool</h1>
      </div>

      <div className="grid gap-6">
        <Input
          type="email"
          label="Email"
          startIcon="AtSign"
          placeholder="Endereço de email"
          {...register("email")}
          error={errors?.email && errors?.email?.message}
          autoComplete="email"
        />
        <div className="flex flex-col space-y-2 items-center">
          <Input
            label="Palavra-passe"
            startIcon="Lock"
            type="password"
            placeholder="Introduza a palavra-passe"
            {...register("password")}
            autoComplete="current-password"
          />
          <Link
            href="/auth/forgot-password"
            className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
          >
            Esqueceu a sua palavra-passe?
          </Link>
        </div>

        {needsMfa && (
          <Input
            label="Código de verificação"
            startIcon="ShieldCheck"
            placeholder="Código de 6 dígitos ou de recuperação"
            autoComplete="one-time-code"
            inputMode="numeric"
            {...register("totpCode")}
          />
        )}

        <ButtonSubmit isLoading={isSubmitting}>
          {isSubmitting ? "" : "Entrar"}
        </ButtonSubmit>

      </div>
      <div className="text-sm text-center">
        A sua escola ainda não está na MindSchool?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Saiba como activar
        </Link>
      </div>
    </form>
  );
}
