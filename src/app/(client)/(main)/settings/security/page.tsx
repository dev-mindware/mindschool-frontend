import { redirect } from "next/navigation";

/** As configuracoes vivem todas no menu Definicoes (abas): esta rota antiga redirecciona para a aba correspondente. */
export default function Page() {
  redirect("/settings?tab=security");
}
