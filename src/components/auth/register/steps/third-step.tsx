"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { RegisterFormData } from "@/schemas";
import { AlertError } from "@/components/common";
import { Checkbox, Label } from "@/components/ui";
import { StepsHeader } from "./steps-header";

const terms = [
  "Utilizar a plataforma de forma responsável e em conformidade com a lei.",
  "Fornecer informações verdadeiras e mantê-las actualizadas.",
  "Autorizar o tratamento dos dados conforme a Política de Privacidade.",
  "Aceitar cookies necessários à utilização e melhoria da plataforma.",
  "Receber comunicações relacionadas com os serviços contratados.",
];

export function ThirdStep() {
  const { control } = useFormContext<RegisterFormData>();

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-2">
      <div className="text-center">
        <StepsHeader title="Termos e políticas" />
        <p className="mt-1 text-sm text-muted-foreground">
          Confirme os pontos abaixo para concluir o registo.
        </p>
      </div>

      <ul className="space-y-2 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
        {terms.map((term) => (
          <li key={term} className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            <span>{term}</span>
          </li>
        ))}
      </ul>

      <Controller
        name="step3.terms"
        control={control}
        rules={{ required: "É necessário aceitar os termos para continuar." }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="termos"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="termos" className="text-sm font-normal">
                Li e concordo com os termos e políticas.
              </Label>
            </div>
            {fieldState.error && (
              <AlertError errorMessage={fieldState.error.message} />
            )}
          </div>
        )}
      />
    </div>
  );
}
