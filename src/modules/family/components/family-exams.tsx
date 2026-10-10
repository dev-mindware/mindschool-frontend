"use client";
import { formatDateTime } from "@/utils";

import Link from "next/link";
import { Badge, Button, DataList, DynamicMetricCard, EmptyState, Icon, type Column } from "@/components";
import { usePortal } from "@/modules/family/hooks/use-portal";
import type { PortalExam } from "@/modules/family/services/portal-service";
import { useAuthStore } from "@/stores/auth/auth-store";

const ATTEMPT_LABEL: Record<string, string> = { em_curso: "Em curso", submetida: "Enviada", corrigida_automaticamente: "Corrigida", corrigida_manualmente: "Corrigida", confirmada: "Nota confirmada" };
const latest = (e: PortalExam) => e.attempts[e.attempts.length - 1];

function Action({ e }: { e: PortalExam }) {
  const last = latest(e);
  if (e.delivery === "google_forms") {
    return e.google_form_url && e.is_open
      ? <Button size="sm" variant="outline" className="gap-1.5" asChild><a href={e.google_form_url} target="_blank" rel="noreferrer"><Icon name="Link" className="size-3.5" />Abrir Google Form</a></Button>
      : <span className="text-xs text-muted-foreground">—</span>;
  }
  const running = last?.status === "em_curso";
  const canStart = e.is_open && (running || e.attempts.length < e.max_attempts);
  return (
    <div className="flex items-center gap-2">
      {canStart && <Button size="sm" className="gap-1.5" asChild><Link href={`/familia/provas/${e.id}`}><Icon name={running ? "Play" : "Pencil"} className="size-3.5" />{running ? "Continuar" : e.attempts.length ? "Nova tentativa" : "Iniciar"}</Link></Button>}
      {last && !running && <Button size="sm" variant="outline" asChild><Link href={`/familia/provas/${e.id}?tentativa=${last.id}`}>Ver resultado</Link></Button>}
      {!canStart && !last && <span className="text-xs text-muted-foreground">Fora da janela</span>}
    </div>
  );
}

const columns: Column<PortalExam>[] = [
  { key: "title", header: "Prova", render: (_, e) => <span className="font-medium">{e.title}</span> },
  { key: "opens_at", header: "Janela", render: (_, e) => <span className="text-xs">{formatDateTime(e.opens_at)} → {formatDateTime(e.closes_at)}{e.time_limit_minutes ? ` • ${e.time_limit_minutes} min` : ""}</span> },
  { key: "delivery", header: "Realização", render: (_, e) => <Badge variant="outline">{e.delivery === "google_forms" ? "Google Forms" : "Plataforma"}</Badge> },
  {
    key: "attempts", header: "Tentativas",
    render: (_, e) => (
      <div className="text-xs">{e.attempts.length}/{e.max_attempts}{latest(e) && <span className="ml-1 text-muted-foreground">• {ATTEMPT_LABEL[latest(e)!.status] ?? latest(e)!.status}</span>}</div>
    ),
  },
  { key: "is_open", header: "Estado", render: (_, e) => <Badge variant={e.is_open ? "success" : "secondary"}>{e.is_open ? "Aberta" : "Fora da janela"}</Badge> },
  { key: "actions", header: "Acção", render: (_, e) => <Action e={e} /> },
];

/** Provas online da turma do aluno: iniciar, continuar ou ver o resultado. */
export function FamilyExams() {
  const role = useAuthStore((s) => s.user?.role);
  const { exams } = usePortal(undefined, role === "STUDENT" ? ["exams"] : []);
  // As provas são realizadas pelo aluno com a sua própria conta (a API recusa o encarregado).
  if (role !== "STUDENT") return <EmptyState icon="FileText" title="Provas realizadas pelo aluno" description="As provas online são feitas pelo próprio aluno, com a conta dele. Aqui o encarregado não as vê." />;
  const open = exams.filter((e) => e.is_open && e.delivery === "nativa" && latest(e)?.status !== "confirmada" && e.attempts.length < e.max_attempts).length;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={exams.length} subtitle="Provas" icon="FileText" description="Publicadas para a turma" />
        <DynamicMetricCard title={exams.filter((e) => e.is_open).length} subtitle="Abertas agora" icon="Play" description="Dentro da janela" />
        <DynamicMetricCard title={open} subtitle="Por fazer" icon="Pencil" colors={open > 0 ? "destructive" : "default"} description="Com tentativas disponíveis" />
        <DynamicMetricCard title={exams.filter((e) => e.attempts.some((a) => a.status !== "em_curso")).length} subtitle="Já realizadas" icon="CircleCheck" description="Com resultado" />
      </div>
      <DataList<PortalExam>
        prefix="provas" rows={exams} columns={columns} pageSize={10}
        searchPlaceholder="Pesquisar prova" searchText={(e) => e.title}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: [{ value: "aberta", label: "Abertas" }, { value: "fechada", label: "Fora da janela" }], match: (e, v) => (v === "aberta" ? e.is_open : !e.is_open) },
          { key: "realizacao", label: "Realização", icon: "Link", options: [{ value: "nativa", label: "Plataforma" }, { value: "google_forms", label: "Google Forms" }], match: (e, v) => e.delivery === v },
        ]}
        dateFilters={[{ key: "abertura", label: "Abertura", getDate: (e) => e.opens_at }]}
        sorts={[{ value: "abertura", label: "Data de abertura", compare: (a, b) => a.opens_at.localeCompare(b.opens_at) }]}
        emptyTitle="Sem provas online" emptyDescription="Sem provas online publicadas para a turma." emptyIcon="FileText"
      />
    </>
  );
}
