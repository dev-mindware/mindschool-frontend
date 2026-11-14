"use client";

import { AuthInteractiveShell } from "../_components/auth-interactive-shell";
import { LoginForm } from "./login-form";

/**
 * Ecrã de login a ecrã inteiro (100vw × 100dvh) sem contentores centralizados nem splash de bloqueio.
 * Palco interativo à esquerda com a paleta oficial MindSchool (`--primary`, `--primary-50..300`, `--warning`)
 * e painel do formulário à direita ocupando toda a largura e altura disponíveis.
 */
export function LoginInteractiveShell() {
  return (
    <AuthInteractiveShell
      badge="Ecossistema MindSchool"
      title="Gestão escolar inteligente com rigor institucional."
      subtitle="Pautas do MED, horários, assiduidade e propinas integrados num único portal para a sua instituição."
    >
      <LoginForm />
    </AuthInteractiveShell>
  );
}
