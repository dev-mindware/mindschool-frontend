import Image from "next/image";
import Link from "next/link";
import { HeroImageSide } from "@/components";

/**
 * A MindSchool nao tem auto-registo: a escola e criada pela equipa da plataforma (NIF, codigo MED, plano) e o titular
 * recebe um convite por e-mail para definir a palavra-passe. Esta pagina explica o percurso em vez de simular um formulario.
 */
export default function RegisterPage() {
  return (
    <div className="grid min-h-screen min-h-dvh w-full overflow-hidden lg:grid-cols-2">
      <div className="hidden lg:block">
        <HeroImageSide source="/login.png" />
      </div>

      <div className="flex min-h-[100svh] items-center justify-center bg-background p-5 md:p-8 lg:min-h-0">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Image src="/mindgest.png" alt="Logótipo do MindSchool" className="size-20" width={100} height={100} />
            <h1 className="text-2xl font-bold">Criar a conta da sua escola</h1>
            <p className="text-sm text-muted-foreground">A MindSchool ativa cada escola com os dados oficiais, para que as pautas e os mapas do MED saiam correctos desde o primeiro dia.</p>
          </div>

          <ol className="space-y-3 text-sm">
            {[
              ["Peça a activação", "Indique o nome da escola, o NIF e o código do MED à equipa MindSchool."],
              ["Receba o convite", "O titular (Direcção Geral) recebe um e-mail para definir a palavra-passe e activar o segundo factor."],
              ["Configure e convide", "Crie o ano lectivo, as turmas e os utilizadores (direcção, secretaria, professores, encarregados)."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                <span><strong className="block">{t}</strong><span className="text-muted-foreground">{d}</span></span>
              </li>
            ))}
          </ol>

          <p className="text-center text-sm text-muted-foreground">
            Já recebeu o convite? Use a ligação do e-mail, ou{" "}
            <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">entre na sua conta</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
