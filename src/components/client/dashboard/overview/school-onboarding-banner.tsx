"use client";

import Link from "next/link";
import { Card, CardContent, Icon } from "@/components";
import type { icons } from "lucide-react";

interface Step {
  step: string;
  title: string;
  description: string;
  href: string;
  icon: keyof typeof icons;
}

const STEPS: Step[] = [
  {
    step: "Passo 1",
    title: "Ano Lectivo & Turmas",
    description: "Defina o ano lectivo activo, cursos e crie as turmas da escola.",
    href: "/academic/classes",
    icon: "Layers",
  },
  {
    step: "Passo 2",
    title: "Matrículas & Alunos",
    description: "Inscreva os primeiros alunos e faça a enturmação nas classes.",
    href: "/students/enrollments",
    icon: "GraduationCap",
  },
  {
    step: "Passo 3",
    title: "Tabela de Propinas",
    description: "Configure os valores de mensalidade, propinas e contas de pagamento.",
    href: "/tuition",
    icon: "Wallet",
  },
  {
    step: "Passo 4",
    title: "Professores & Horários",
    description: "Atribua professores às disciplinas e monte a grade semanal de aulas.",
    href: "/academic/timetables",
    icon: "CalendarRange",
  },
];

export function SchoolOnboardingBanner() {
  return (
    <Card className="overflow-hidden border border-primary/20 bg-linear-to-br from-primary/5 via-card to-background shadow-xs">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Icon name="Sparkles" className="size-3.5" />
              Início rápido
            </div>
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              Bem-vindo ao MindSchool — Configure a sua escola
            </h3>
            <p className="text-xs text-muted-foreground sm:text-sm max-w-2xl">
              A sua instituição foi criada com sucesso. Siga o fluxo recomendado abaixo para parametrizar a escola e dar vida aos indicadores do painel.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <Link
              key={s.step}
              href={s.href}
              className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card/80 p-4 transition-all hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon name={s.icon} className="size-4" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.step}
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {s.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {s.description}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                Configurar agora
                <Icon name="ArrowRight" className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
