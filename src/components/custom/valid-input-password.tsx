"use client";

import * as React from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { AlertError } from "@/components/common/alert-error";
import { cn } from "@/lib/utils";

export interface ValidInputPasswordProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  showRequirements?: boolean;
  onValueChange?: (value: string) => void;
}

export const ValidInputPassword = React.forwardRef<
  HTMLInputElement,
  ValidInputPasswordProps
>(
  (
    {
      label = "Palavra-passe",
      error,
      showRequirements = true,
      className,
      value,
      onChange,
      onValueChange,
      name,
      id,
      disabled,
      placeholder = "••••••••",
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || name || generatedId;
    const [isVisible, setIsVisible] = React.useState(false);

    const stringValue = String(value ?? props.defaultValue ?? "");

    const requirements = React.useMemo(() => {
      return [
        {
          id: "length",
          regex: /.{8,}/,
          text: "Pelo menos 8 caracteres",
        },
        {
          id: "number",
          regex: /[0-9]/,
          text: "Pelo menos 1 número",
        },
        {
          id: "lower",
          regex: /[a-z]/,
          text: "Pelo menos 1 letra minúscula",
        },
        {
          id: "upper",
          regex: /[A-Z]/,
          text: "Pelo menos 1 letra maiúscula",
        },
        {
          id: "special",
          regex: /[^A-Za-z0-9]/,
          text: "Pelo menos 1 carácter especial (!@#$%...)",
        },
      ].map((req) => ({
        ...req,
        met: req.regex.test(stringValue),
      }));
    }, [stringValue]);

    const strengthScore = React.useMemo(() => {
      return requirements.filter((r) => r.met).length;
    }, [requirements]);

    const getStrengthColor = (score: number) => {
      if (score === 0) return "bg-muted";
      if (score <= 2) return "bg-rose-500";
      if (score <= 4) return "bg-amber-500";
      return "bg-emerald-500";
    };

    const getStrengthText = (score: number) => {
      if (score === 0) return "Introduza uma palavra-passe";
      if (score <= 2) return "Palavra-passe fraca";
      if (score <= 4) return "Palavra-passe média";
      return "Palavra-passe forte e segura";
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <div className={cn("w-full space-y-1.5", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "relative flex items-center rounded-md border text-sm transition-colors duration-200 overflow-hidden bg-background",
            error
              ? "border-red-500 ring-1 ring-red-400"
              : "border-input focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-ring/50",
            disabled && "opacity-50 cursor-not-allowed bg-muted/30"
          )}
        >
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={isVisible ? "text" : "password"}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent placeholder:text-muted-foreground text-foreground outline-none px-3 py-2 pe-10 min-w-0",
              "disabled:cursor-not-allowed"
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            disabled={disabled}
            aria-label={isVisible ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
            className="absolute inset-y-0 end-0 flex items-center justify-center w-10 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {/* Barra de progresso de força */}
        {stringValue.length > 0 && (
          <div className="space-y-2 pt-1">
            <div
              className="w-full h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={strengthScore}
              aria-valuemin={0}
              aria-valuemax={5}
              aria-label="Segurança da palavra-passe"
            >
              <div
                className={cn(
                  "h-full transition-all duration-300 ease-out",
                  getStrengthColor(strengthScore)
                )}
                style={{ width: `${(strengthScore / 5) * 100}%` }}
              />
            </div>

            <p className="text-xs font-medium text-muted-foreground">
              {getStrengthText(strengthScore)}
            </p>
          </div>
        )}

        {/* Lista de requisitos visuais */}
        {showRequirements && stringValue.length > 0 && strengthScore < 5 && (
          <ul className="space-y-1 pt-1" aria-label="Requisitos da palavra-passe">
            {requirements.map((req) => (
              <li key={req.id} className="flex items-center gap-1.5 text-xs">
                {req.met ? (
                  <Check className="size-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <X className="size-3.5 text-muted-foreground/60 shrink-0" />
                )}
                <span
                  className={cn(
                    req.met ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-muted-foreground"
                  )}
                >
                  {req.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {error && <AlertError errorMessage={error} />}
      </div>
    );
  }
);

ValidInputPassword.displayName = "ValidInputPassword";

export default ValidInputPassword;
