"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components";
import { useAuth } from "@/hooks/auth/use-auth";
import { academicService } from "@/services/academic-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { cn } from "@/lib/utils";

/** Quem prepara a escola: a direção, a secretaria e o titular. */
const SETUP_ROLES = ["DIRECTOR_GENERAL", "OWNER", "ADMIN", "MANAGER", "PEDAGOGIC_DIRECTOR", "SECRETARY"];

export interface SetupStep { key: string; title: string; text: string; href: string; done: boolean }

/** Os passos do arranque por ordem: cada um só faz sentido depois do anterior (ano → turmas → disciplinas → alunos → matrículas). */
export function setupSteps(s: { hasYear: boolean; sections: number; subjects: number; students: number; enrolled: number }): SetupStep[] {
  return [
    { key: "year", title: "Ano letivo ativo", text: "Crie o ano letivo com os seus períodos e active-o.", href: "/academic/calendar", done: s.hasYear },
    { key: "sections", title: "Turmas", text: "Crie as turmas do ano (classe, turno, capacidade).", href: "/academic/classes", done: s.sections > 0 },
    { key: "subjects", title: "Disciplinas", text: "Registe as disciplinas e atribua-as a professores em cada turma.", href: "/academic/subjects", done: s.subjects > 0 },
    { key: "students", title: "Alunos", text: "Cadastre os alunos (ou importe-os por Excel).", href: "/students/list", done: s.students > 0 },
    { key: "enrollments", title: "Matrículas", text: "Matricule os alunos nas turmas: só então há propinas, notas e pautas.", href: "/students/enrollments", done: s.enrolled > 0 },
  ];
}

/**
 * Guia de arranque do dashboard. Numa escola nova, matrículas, notas, pautas e propinas aparecem vazias sem dizer
 * porquê: este cartão diz qual é o próximo passo. Desaparece quando tudo está feito.
 */
export function SetupGuide({ studentsTotal, enrolled }: { studentsTotal: number; enrolled: number }) {
  const { user } = useAuth();
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const allowed = SETUP_ROLES.includes(user?.role ?? "");
  const year = useQuery({ queryKey: ["active-year", schoolId], queryFn: academicService.activeYear, enabled: Boolean(schoolId) && allowed, staleTime: 5 * 60 * 1000 });
  const sections = useQuery({ queryKey: ["setup-sections", schoolId], queryFn: academicService.sections, enabled: Boolean(schoolId) && allowed, staleTime: 60 * 1000 });
  const subjects = useQuery({ queryKey: ["setup-subjects", schoolId], queryFn: academicService.subjects, enabled: Boolean(schoolId) && allowed, staleTime: 60 * 1000 });

  if (!allowed || year.isLoading || sections.isLoading || subjects.isLoading) return null;
  const steps = setupSteps({ hasYear: Boolean(year.data), sections: sections.data?.length ?? 0, subjects: subjects.data?.length ?? 0, students: studentsTotal, enrolled });
  const next = steps.find((s) => !s.done);
  if (!next) return null;
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <section aria-label="Primeiros passos" className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Primeiros passos da escola</h2>
          <p className="text-xs text-muted-foreground">{doneCount} de {steps.length} concluídos. Próximo: <strong className="text-foreground">{next.title}</strong>.</p>
        </div>
        <Link href={next.href} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90">
          {next.title} <Icon name="ArrowRight" className="size-3.5" />
        </Link>
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <li key={s.key} className={cn("rounded-lg border p-2.5 text-xs", s.done ? "border-emerald-500/30 bg-emerald-500/5" : s.key === next.key ? "border-primary/50 bg-background" : "bg-background/60 opacity-80")}>
            <div className="flex items-center gap-1.5 font-semibold">
              <Icon name={s.done ? "CircleCheck" : "Circle"} className={cn("size-3.5", s.done ? "text-emerald-600" : "text-muted-foreground")} />
              {i + 1}. {s.title}
            </div>
            <p className="mt-1 text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
