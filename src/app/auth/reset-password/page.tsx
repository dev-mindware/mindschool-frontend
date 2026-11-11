import Link from "next/link";
import { HeroImageSide, ResetPassword } from "@/components";

export default function ResetPassPage() {
  return (
    <div className="grid min-h-screen min-h-dvh h-screen h-dvh w-full overflow-hidden lg:grid-cols-2 bg-background">
      {/* Lado Esquerdo: Formulário ocupando metade da tela */}
      <div className="flex flex-col justify-between h-full w-full p-6 sm:p-10 lg:p-12 xl:p-16 bg-background overflow-y-auto">
        <div />
        <div className="w-full max-w-sm mx-auto my-auto">
          <ResetPassword />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-6 w-full max-w-sm mx-auto">
          <span>&copy; {new Date().getFullYear()} MINDWARE — Comércio e Serviços.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>

      {/* Lado Direito: Imagem preenchendo a outra metade da tela em partes iguais */}
      <div className="hidden lg:flex h-full w-full items-center justify-center p-3 lg:p-4 xl:p-5 bg-background overflow-hidden">
        <HeroImageSide
          source="/auth/auth_school_hero.jpg"
          title="Credenciais Fortes & Protegidas"
          subtitle="Garantia de integridade para a conta da sua instituição de ensino e acesso a pautas confidenciais."
          hoverTitle="Controlo de Acesso Centralizado"
          hoverSubtitle="Apenas utilizadores autorizados acedem a pautas e informações financeiras dos estudantes."
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
