import Image from "next/image";
import Link from "next/link";
import { HeroImageSide } from "@/components";

/**
 * A MindSchool nao tem auto-registo: a escola e criada pela equipa da plataforma (NIF, codigo MED, plano) e o titular
 * recebe um convite por e-mail para definir a palavra-passe. Esta pagina explica o percurso em vez de simular um formulario.
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen min-h-dvh w-full flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 bg-[#f8f9fa] dark:bg-slate-950">
      <div className="w-full max-w-[1240px] rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] bg-white dark:bg-card shadow-2xl shadow-slate-200/60 dark:shadow-black/70 border border-slate-100 dark:border-border/40 p-3 sm:p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch min-h-[660px]">
        {/* Lado Esquerdo: Percurso de Ativação */}
        <div className="flex w-full items-center justify-center px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex w-full max-w-md flex-col gap-6">
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative size-11 rounded-2xl overflow-hidden bg-primary/10 p-1.5 border border-primary/20 shadow-sm">
                  <Image
                    src="/mindgest.png"
                    alt="Logótipo do MindSchool"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    MindSchool<span className="text-primary">.</span>
                  </span>
                  <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
                    Ativação Institucional
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-2">
                Criar a conta da sua escola
              </h1>
              <p className="text-sm text-muted-foreground">
                A MindSchool ativa cada escola com os dados oficiais, garantindo pautas e mapas do MED validados desde o primeiro dia.
              </p>
            </div>

            <ol className="space-y-3.5 text-sm">
              {[
                ["1. Peça a ativação", "Indique o nome da escola, o NIF e o código do MED à equipa MindSchool."],
                ["2. Receba o convite oficial", "O titular (Direção Geral) recebe um e-mail para definir a palavra-passe e ativar o 2FA."],
                ["3. Configure turmas e utilizadores", "Crie o ano letivo, as turmas e os acessos de professores, secretaria e encarregados."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3.5 p-3 rounded-2xl bg-muted/40 border border-border/40 transition-colors hover:bg-muted/60">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                  <div>
                    <strong className="block text-foreground font-semibold text-sm mb-0.5">{t}</strong>
                    <span className="text-xs text-muted-foreground leading-relaxed">{d}</span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 text-center text-sm text-muted-foreground">
              Já recebeu o convite por e-mail? Use a ligação enviada ou{" "}
              <Link href="/auth/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                entre na sua conta
              </Link>.
            </div>
          </div>
        </div>

        {/* Lado Direito: Imagem com cantos contornados e morphing */}
        <div className="hidden lg:flex w-full h-full min-h-[580px]">
          <HeroImageSide
            source="/auth/auth_school_modern.jpg"
            title="Ativação Oficial da sua Escola"
            subtitle="Configuração inicial rigorosa e homologada para colégios, complexos escolares e institutos."
            badge="Homologação & Ativação • MED"
            hoverTitle="Pronto para o Ano Letivo"
            hoverSubtitle="Pautas automáticas, secretaria digital e sincronização segura de todas as turmas da instituição."
            hoverBadge="Educação de Futuro • Angola"
          />
        </div>
      </div>
    </div>
  );
}
