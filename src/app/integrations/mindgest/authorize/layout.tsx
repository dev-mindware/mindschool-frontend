import { StepUpDialog } from "@/components";
import { RouteProtector } from "@/contexts";
import { STAFF_ROLES } from "@/constants/roles";
import type { Role } from "@/types";

/**
 * Página de consentimento do MindGest: janela própria (sem menu), só para pessoal da escola autenticado. A API decide quem é
 * titular; aqui só se evita mostrar a página a famílias/alunos. Os cabeçalhos anti-framing estão em `next.config.ts`.
 */
export default function ConsentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtector allowed={[...STAFF_ROLES] as Role[]} checkPlan={false}>
      <main className="flex min-h-dvh items-center justify-center bg-background p-4">{children}</main>
      <StepUpDialog />
    </RouteProtector>
  );
}
