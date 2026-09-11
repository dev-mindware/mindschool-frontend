"use client";
import { cn } from "@/lib/utils";
import { Input, Button, PasswordStrengthBar, AlertError } from "@/components";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RegisterFormData } from "@/schemas";
import { useFormContext } from "react-hook-form";
import { StepsHeader } from "./steps-header";
import { Wand2 } from "lucide-react";

type FirstStepProps = {
  affiliateLocked?: boolean;
};

export function FirstStep({ affiliateLocked = false }: FirstStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<RegisterFormData>();

  const password = watch("step1.password") || "";

  // Isolando os campos para customizar o onChange
  const emailField = register("step1.email");
  const phoneField = register("step1.phone");

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("step1.password", pass, { shouldValidate: true });
    setValue("step1.passwordConfirmation", pass, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 mt text-center">
        <StepsHeader title="Dados do titular da conta" />
      </div>
      <div className="grid gap-6">
        <Input
          label="Nome"
          startIcon="User"
          placeholder="Introduza o seu nome"
          {...register("step1.name")}
          error={errors?.step1?.name?.message}
        />
        
        <Input
          label="Email"
          startIcon="Mail"
          placeholder="Introduza o seu endereço de email"
          {...emailField}
          onChange={(e) => {
            // Transforma o texto em minúsculas em tempo real
            e.target.value = e.target.value.toLowerCase();
            emailField.onChange(e);
          }}
          error={errors?.step1?.email?.message}
        />

        <Input
          label="Telefone"
          maxLength={9}
          inputMode="numeric"
          startIcon="Phone"
          placeholder="Introduza o seu número de telefone"
          {...phoneField}
          onChange={(e) => {
            // Bloqueia tudo o que não for dígito antes de chegar ao input/form
            e.target.value = e.target.value.replace(/\D/g, "");
            phoneField.onChange(e);
          }}
          error={errors?.step1?.phone?.message}
        />

        <div className="space-y-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Palavra-passe
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="password"
                  startIcon="Lock"
                  placeholder="********"
                  {...register("step1.password")}
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

          <PasswordStrengthBar password={password} />

          {errors?.step1?.password?.message && (
            <AlertError errorMessage={errors.step1.password.message} />
          )}
        </div>

        <Input
          type="password"
          startIcon="Lock"
          placeholder="********"
          label="Confirmar palavra-passe"
          {...register("step1.passwordConfirmation")}
          error={errors?.step1?.passwordConfirmation?.message}
        />

        {affiliateLocked ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Input
                    type="text"
                    startIcon="Tag"
                    endIcon="BadgeCheck"
                    placeholder="MWD-AO-1234"
                    label="Código de Afiliado"
                    readOnly
                    className="bg-muted/40"
                    title="Este é o código do parceiro que o convidou para o Mindgest."
                    {...register("step1.affiliateCode")}
                    error={errors?.step1?.affiliateCode?.message}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-center">
                Este é o código do parceiro que o trouxe ao Mindgest. Foi preenchido
                automaticamente através do link de convite e não pode ser alterado.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Input
            type="text"
            startIcon="Tag"
            placeholder="MWD-AO-1234"
            label="Código de Afiliado (Opcional)"
            {...register("step1.affiliateCode")}
            error={errors?.step1?.affiliateCode?.message}
          />
        )}
      </div>
    </div>
  );
}