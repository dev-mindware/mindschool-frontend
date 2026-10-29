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
import { MindSchoolLogo } from "@/components/common/logo/mindschool-logo";
import { loginAction } from "@/actions/login";
import { useAuthStore } from "@/stores";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { queryClient } from "@/lib";
import { safeResumePath } from "@/lib/mindgest-consent";
import { getApiErrorMessage } from "@/utils";

export function LoginForm() {
  const router = useRouter();
  const { setUser, setIsAuthenticating } = useAuthStore();
  const [needsMfa, setNeedsMfa] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

      // Popula o cache do React Query antes de redirecionar para evitar requisição redundante
      queryClient.setQueryData(["user"], res.user);

      setUser(res.user);
      // Retoma a página de consentimento do MindGest (único destino aceite em `from`); o resto vai para a página do papel.
      const resume = safeResumePath(new URLSearchParams(window.location.search).get("from"));
      router.replace(resume ?? (res.redirectPath || "/"));
    } catch (error) {
      setIsAuthenticating(false);
      ErrorMessage(getApiErrorMessage(error, "Ocorreu um erro inesperado. Tente novamente."));
    }
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-6 w-full max-w-sm">
      {/* Cabeçalho da marca e título adaptado à referência */}
      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center size-20 rounded-xs overflow-hidden bg- p-1">
            <MindSchoolLogo size={64} priority />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground">
              MindSchool<span className="text-primary">.</span>
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
              Portal Institucional
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2">
          Bem-vindo(a) de volta
        </h1>
        <p className="text-sm text-muted-foreground">
          Inicie sessão para gerir a sua escola, turmas e pautas.
        </p>
      </div>

      <div className="grid gap-5">
        <Input
          type="email"
          label="Endereço de Email"
          startIcon="AtSign"
          placeholder="exemplo@escola.ao"
          {...register("email")}
          error={errors?.email && errors?.email?.message}
          autoComplete="email"
        />

        <div className="flex flex-col space-y-2">
          <Input
            label="Palavra-passe"
            startIcon="Lock"
            type="password"
            placeholder="••••••••••••"
            {...register("password")}
            autoComplete="current-password"
          />
        </div>

        {/* Linha com 'Lembrar-me' e 'Esqueceu a palavra-passe?' */}
        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground select-none">
            <input
              type="checkbox"
              className="size-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Lembrar-me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Esqueceu a palavra-passe?
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

      <div className="text-sm text-center text-muted-foreground mt-2">
        As escolas são ativadas pela equipa Mindware; o Titular recebe um convite por email.
      </div>
    </form>
  );
}
