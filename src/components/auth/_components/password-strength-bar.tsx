"use client";
import { cn } from "@/lib/utils";

export type StrengthLevel = 0 | 1 | 2 | 3;

export interface StrengthConfig {
  level: StrengthLevel;
  label: string;
  color: string;
  textColor: string;
}

export function getStrength(pass: string): StrengthConfig {
  if (!pass) return { level: 0, label: "", color: "", textColor: "" };

  const hasLength = pass.length >= 8;
  const hasLower = /[a-z]/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);

  let criteriaMet = 0;
  if (hasLength) criteriaMet++;
  if (hasLower && hasUpper) criteriaMet++;
  if (hasNumber) criteriaMet++;
  if (hasSpecial) criteriaMet++;

  // Senha forte exige OBRIGATORIAMENTE carácter especial além dos outros requisitos
  if (hasLength && hasLower && hasUpper && hasNumber && hasSpecial) {
    return { level: 3, label: "Forte", color: "bg-green-500", textColor: "text-green-600" };
  }

  // Se atende 2 ou 3 requisitos mas falta carácter especial ou maiúsculas/minúsculas
  if (hasLength && criteriaMet >= 2) {
    return { level: 2, label: "Média (adicione símbolos ex: @, #, $)", color: "bg-yellow-400", textColor: "text-yellow-600" };
  }

  return { level: 1, label: "Fraca", color: "bg-red-500", textColor: "text-red-500" };
}

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;

  const { level, label, color, textColor } = getStrength(password);

  return (
    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex gap-1.5">
        {([1, 2, 3] as const).map((seg) => (
          <div
            key={seg}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              level >= seg ? color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", textColor)}>{label}</p>
    </div>
  );
}
