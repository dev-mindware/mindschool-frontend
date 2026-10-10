import { HeroImageSide, RecoveryPassword } from "@/components";

export default function ForgotPassPage() {
  return (
    <div className="grid min-h-screen min-h-dvh h-screen h-dvh w-full overflow-hidden lg:grid-cols-2 bg-background">
      {/* Lado Esquerdo: Formulário ocupando metade da tela */}
      <div className="flex h-full w-full items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-background">
        <div className="w-full max-w-sm">
          <RecoveryPassword />
        </div>
      </div>

      {/* Lado Direito: Imagem preenchendo a outra metade da tela em partes iguais */}
      <div className="hidden lg:flex h-full w-full items-center justify-center p-3 lg:p-4 xl:p-5 bg-background overflow-hidden">
        <HeroImageSide
          source="/auth/auth_school_hero.jpg"
          title="Acesso Seguro e Protegido"
          subtitle="Recuperação de credenciais com verificação de segurança em dois fatores e cifra de ponta a ponta."
          hoverTitle="Proteção Rigorosa de Dados"
          hoverSubtitle="Auditoria completa de acessos, logs protegidos e salvaguarda estrita dos registos dos estudantes."
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
