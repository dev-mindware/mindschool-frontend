import { LoginForm, HeroImageSide } from "@/components";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen min-h-dvh h-screen h-dvh w-full overflow-hidden lg:grid-cols-2 bg-background">
      {/* Lado Esquerdo: Formulário ocupando metade da tela */}
      <div className="flex h-full w-full items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-background">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>

      {/* Lado Direito: Imagem preenchendo a outra metade da tela em partes iguais */}
      <div className="hidden lg:flex h-full w-full items-center justify-center p-3 lg:p-4 xl:p-5 bg-background overflow-hidden">
        <HeroImageSide
          source="/auth/auth_school_hero.jpg"
          title="Inovação e Rigor no Ensino"
          subtitle="Pautas oficiais do MED, propinas, matrículas e acompanhamento pedagógico num único ecossistema inteligente."
          hoverTitle="Conformidade Oficial & MED"
          hoverSubtitle="Geração imediata de mapas de aproveitamento, minipautas seguras e gestão integrada para o futuro da sua escola."
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
