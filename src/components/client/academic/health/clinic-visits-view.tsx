"use client";

import { Badge, DataList, EmptyState, type Column } from "@/components";
import { useHealth } from "@/hooks/school/use-health";
import type { ApiVisit } from "@/services/health-service";

export function ClinicVisitsView() {
  const { visits, nameOf, visitsLoading, visitsForbidden } = useHealth();

  if (visitsForbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não tem acesso à enfermaria." />;

  const columns: Column<ApiVisit>[] = [
    { key: "visited_at", header: "Data", render: (_, v) => <span className="font-mono text-xs whitespace-nowrap">{new Date(v.visited_at).toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" })}</span> },
    { key: "student_id", header: "Aluno", render: (_, v) => <span className="font-medium">{nameOf.get(v.student_id) ?? "—"}</span> },
    { key: "reason", header: "Motivo" },
    { key: "treatment", header: "Tratamento", render: (_, v) => <span className="text-muted-foreground">{v.treatment ?? "—"}</span> },
    { key: "guardian_notified", header: "Encarregado", render: (_, v) => (v.guardian_notified ? <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">Avisado</Badge> : <Badge variant="warning">Por avisar</Badge>) },
  ];

  return (
    <DataList<ApiVisit>
      prefix="enfermaria"
      rows={visits}
      columns={columns}
      isLoading={visitsLoading}
      searchPlaceholder="Pesquisar por aluno ou motivo"
      searchText={(v) => `${nameOf.get(v.student_id) ?? ""} ${v.reason} ${v.treatment ?? ""}`}
      filters={[
        { key: "aviso", label: "Encarregado", icon: "Bell", options: [{ value: "avisado", label: "Avisado" }, { value: "por_avisar", label: "Por avisar" }], match: (v, x) => (x === "avisado" ? v.guardian_notified : !v.guardian_notified) },
        { key: "tratamento", label: "Tratamento", icon: "Cross", options: [{ value: "com", label: "Com tratamento" }, { value: "sem", label: "Sem tratamento" }], match: (v, x) => (x === "com" ? Boolean(v.treatment) : !v.treatment) },
      ]}
      dateFilters={[{ key: "data", label: "Atendimento", getDate: (v) => v.visited_at }]}
      sorts={[{ value: "data", label: "Data", compare: (a, b) => a.visited_at.localeCompare(b.visited_at) }, { value: "aluno", label: "Aluno", compare: (a, b) => (nameOf.get(a.student_id) ?? "").localeCompare(nameOf.get(b.student_id) ?? "") }]}
      emptyTitle="Sem atendimentos"
      emptyDescription="Registe o primeiro atendimento da enfermaria."
      emptyIcon="HeartPulse"
    />
  );
}
