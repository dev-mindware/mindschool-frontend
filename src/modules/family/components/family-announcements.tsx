"use client";

import { DataList, Icon, type Column } from "@/components";
import { usePortal } from "@/modules/family/hooks/use-portal";
import type { PortalAnnouncement } from "@/modules/family/services/portal-service";

const columns: Column<PortalAnnouncement>[] = [
  {
    key: "title", header: "Comunicado",
    render: (_, a) => (
      <div className="max-w-2xl">
        <div className="flex items-center gap-2"><Icon name="Megaphone" className="size-4 shrink-0 text-primary" /><span className="font-medium">{a.title}</span></div>
        <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">{a.body}</p>
      </div>
    ),
  },
  { key: "published_at", header: "Publicado", render: (_, a) => <span className="font-mono text-xs">{a.published_at?.slice(0, 10) ?? "—"}</span> },
];

/** Comunicados da escola dirigidos à família (da escola toda ou da turma). */
export function FamilyAnnouncements() {
  const { announcements } = usePortal(undefined, ["announcements"]);
  return (
    <DataList<PortalAnnouncement>
      prefix="comunicados" rows={announcements} columns={columns} pageSize={10}
      searchPlaceholder="Pesquisar comunicado" searchText={(a) => `${a.title} ${a.body}`}
      filters={[{ key: "destino", label: "Destinatários", icon: "Users", options: [...new Set(announcements.map((a) => a.audience))].map((value) => ({ value, label: value.replaceAll("_", " ") })), match: (a, v) => a.audience === v }]}
      dateFilters={[{ key: "data", label: "Publicação", getDate: (a) => a.published_at ?? "" }]}
      sorts={[{ value: "data", label: "Data", compare: (a, b) => (a.published_at ?? "").localeCompare(b.published_at ?? "") }]}
      emptyTitle="Sem comunicados" emptyDescription="A escola ainda não publicou comunicados." emptyIcon="Megaphone"
    />
  );
}
