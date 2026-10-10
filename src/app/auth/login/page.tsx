import { LoginForm, HeroImageSide } from "@/components";

export default function LoginPage() {
  return (
    <div className="min-h-screen min-h-dvh w-full flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 bg-[#f8f9fa] dark:bg-slate-950">
      <div className="w-full max-w-[1240px] rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] bg-white dark:bg-card shadow-2xl shadow-slate-200/60 dark:shadow-black/70 border border-slate-100 dark:border-border/40 p-3 sm:p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch min-h-[660px]">
        {/* Lado Esquerdo: Formulário de Autenticação */}
        <div className="flex w-full items-center justify-center px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
          <LoginForm />
        </div>

        {/* Lado Direito: Imagem com cantos contornados, morphing e textos alternados */}
        <div className="hidden lg:flex w-full h-full min-h-[580px]">
          <HeroImageSide
            source="/auth/auth_school_hero.jpg"
            title="Inovação e Rigor no Ensino"
            subtitle="Pautas oficiais do MED, propinas, matrículas e acompanhamento pedagógico num único ecossistema inteligente."
            badge="MindSchool • Educação & Ensino"
            hoverTitle="Conformidade Oficial & MED"
            hoverSubtitle="Geração imediata de mapas de aproveitamento, minipautas seguras e gestão integrada para o futuro da sua escola."
            hoverBadge="Ministério da Educação (MED) • Angola"
          />
        </div>
      </div>
    </div>
  );
}
