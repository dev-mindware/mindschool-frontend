"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import {
  useAuthErrorReaction,
  useAuthScene,
  type AuthSceneBindings,
} from "../_components/auth-interactive-shell";

export type LoginFormProps = Partial<AuthSceneBindings>;

export function LoginForm({
  onFocusTargetChange: explicitFocusTargetChange,
  onPasswordVisibilityChange: explicitPasswordVisibilityChange,
  onTypingActivity: explicitTypingActivity,
  onReactionChange: explicitReactionChange,
}: LoginFormProps = {}) {
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

  const router = useRouter();
  const { setUser, setIsAuthenticating } = useAuthStore();
  const [needsMfa, setNeedsMfa] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const errParam = new URLSearchParams(window.location.search).get("error");
    if (errParam === "impersonation") {
      ErrorMessage("A ligação de acesso de apoio expirou ou já foi utilizada. Inicie o acesso novamente a partir do painel.");
    }
  }, []);

  const triggerErrorReaction = useAuthErrorReaction(onReactionChange);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  async function handleLogin({ email, password, totpCode }: LoginFormData) {
    onReactionChange?.("submitting");
    try {
      const res = await loginAction({ email, password, totpCode });

      if (res.requiresMfa) {
        setNeedsMfa(true);
        if (totpCode) {
          triggerErrorReaction();
          ErrorMessage("O código de verificação está incorrecto. Confira os dígitos e tente novamente.");
        } else {
          onReactionChange?.("idle");
        }
        return;
      }

      if (!res.user) {
        triggerErrorReaction();
        ErrorMessage(res.message || "Não foi possível iniciar sessão. Verifique o seu e-mail e palavra-passe e tente novamente.");
        return;
      }

      onReactionChange?.("success");
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
      triggerErrorReaction();
      ErrorMessage(
        getApiErrorMessage(
          error,
          "Não foi possível iniciar sessão neste momento. Verifique a sua ligação à Internet e tente novamente.",
        ),
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleLogin, triggerErrorReaction)}
      className="flex flex-col gap-6 w-full max-w-md"
    >
      {/* Cabeçalho da marca e título */}
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
              Portal Institucional
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">
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
          {...register("email", {
            onChange: (e) => onTypingActivity?.("email", e.target.value.length),
            onBlur: () => onFocusTargetChange?.("idle"),
          })}
          onFocus={() => onFocusTargetChange?.("email")}
          error={errors?.email && errors?.email?.message}
          autoComplete="email"
        />

        <div className="flex flex-col space-y-2">
          <Input
            label="Palavra-passe"
            startIcon="Lock"
            type="password"
            placeholder="••••••••••••"
            {...register("password", {
              onChange: (e) => onTypingActivity?.("password", e.target.value.length),
              onBlur: () => onFocusTargetChange?.("idle"),
            })}
            onFocus={() => onFocusTargetChange?.("password")}
            onPasswordVisibilityChange={onPasswordVisibilityChange}
            error={errors.password?.message}
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
            {...register("totpCode", {
              onChange: (e) => onTypingActivity?.("totp", e.target.value.length),
              onBlur: () => onFocusTargetChange?.("idle"),
            })}
            onFocus={() => onFocusTargetChange?.("totp")}
            error={errors.totpCode?.message}
          />
        )}

        <ButtonSubmit isLoading={isSubmitting} disabled={!isValid}>
          {isSubmitting ? "" : "Entrar"}
        </ButtonSubmit>
      </div>

      <div className="text-sm text-center text-muted-foreground mt-2">
        As escolas são ativadas pela equipa Mindware; o Titular recebe um convite por email.
      </div>
    </form>
  );
}
