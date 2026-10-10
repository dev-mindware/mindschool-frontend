import { HeroImageSide, ResetPassword } from "@/components";

export default function ResetPassPage() {
  return (
    <div className="grid min-h-screen min-h-dvh h-screen h-dvh w-full overflow-hidden lg:grid-cols-2 bg-background">
      {/* Lado Esquerdo: Formulário ocupando metade da tela */}
      <div className="flex h-full w-full items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-background">
        <div className="w-full max-w-sm">
          <ResetPassword />
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
