"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, DynamicMetricCard, FormModal, FormSelect, FormTextarea, Icon, Input, TitleList, type Column } from "@/components";
import { useAnnouncements } from "@/hooks/school/use-announcements";
import { useSections } from "@/hooks/school/use-sections";
import type { AnnouncementAudience, AnnouncementStatus, ApiAnnouncement } from "@/services/announcements-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<AnnouncementStatus, string> = { rascunho: "Rascunho", publicado: "Publicado", arquivado: "Arquivado" };
const STATUS_VARIANT: Record<AnnouncementStatus, "warning" | "success" | "secondary"> = { rascunho: "warning", publicado: "success", arquivado: "secondary" };
const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = { escola: "Toda a escola", turma: "Turma" };
const fail = (e: unknown): never => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };

/** Comunicados da direcção e dos professores (API): chegam ao portal dos encarregados quando publicados. */
export function CommunicationPageContent() {
  const a = useAnnouncements();
  const { data: sections = [] } = useSections();
  const { openModal } = useModal();
  const [editing, setEditing] = useState<ApiAnnouncement | null>(null);
  const [viewing, setViewing] = useState<ApiAnnouncement | null>(null);
  const [archiving, setArchiving] = useState<ApiAnnouncement | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("escola");
  const [sectionId, setSectionId] = useState("");

  const sectionName = (id: string | null) => (id ? sections.find((s) => s.id === id)?.name ?? "—" : "—");
  const openNew = () => { setEditing(null); setTitle(""); setBody(""); setAudience("escola"); setSectionId(""); openModal("announcement-form"); };
  const openEdit = (x: ApiAnnouncement) => { setEditing(x); setTitle(x.title); setBody(x.body); openModal("announcement-form"); };

  const save = () =>
    (editing
      ? a.update.mutateAsync({ id: editing.id, title: title.trim(), body: body.trim() }).then(() => { SucessMessage("Comunicado actualizado."); })
      : a.create.mutateAsync({ title: title.trim(), body: body.trim(), audience, sectionId: sectionId || undefined }).then(() => { SucessMessage("Comunicado criado como rascunho."); })
    ).catch(fail);

  const columns: Column<ApiAnnouncement>[] = [
    { key: "title", header: "Comunicado", render: (_, x) => (<div className="max-w-md"><button type="button" className="text-left font-medium hover:underline" onClick={() => { setViewing(x); openModal("announcement-view"); }}>{x.title}</button><p className="line-clamp-1 text-xs text-muted-foreground">{x.body}</p></div>) },
    { key: "audience", header: "Destinatários", render: (_, x) => (<div><p className="text-sm">{AUDIENCE_LABEL[x.audience]}</p>{x.section_id && <p className="text-xs text-muted-foreground">{sectionName(x.section_id)}</p>}</div>) },
    { key: "status", header: "Estado", render: (_, x) => <Badge variant={STATUS_VARIANT[x.status]}>{STATUS_LABEL[x.status]}</Badge> },
    { key: "created_at", header: "Criado em", render: (_, x) => <span className="text-xs">{x.created_at.slice(0, 10)}</span> },
    { key: "published_at", header: "Publicado em", render: (_, x) => <span className="text-xs">{x.published_at?.slice(0, 10) ?? "—"}</span> },
    {
      key: "actions", header: "Acção",
      render: (_, x) => (
        <ButtonOnlyAction data={x} actions={[
          { label: "Ver", icon: "Eye", onClick: (r) => { setViewing(r); openModal("announcement-view"); } },
          ...(x.status === "rascunho" ? [
            { permission: "announcement:write", label: "Editar", icon: "Pencil" as const, onClick: openEdit },
            { permission: "announcement:write", label: "Publicar", icon: "Send" as const, onClick: (r: ApiAnnouncement) => void a.publish.mutateAsync(r.id).then(() => { SucessMessage("Comunicado publicado."); }).catch(fail) },
          ] : []),
          ...(x.status !== "arquivado" ? [{ permission: "announcement:write", label: "Arquivar", icon: "Archive" as const, variant: "destructive" as const, onClick: (r: ApiAnnouncement) => { setArchiving(r); openModal("announcement-archive"); } }] : []),
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Comunicados" suTitle="Comunicação institucional da direcção e dos professores, publicada no portal dos encarregados.">
        <Can permission="announcement:write"><Button onClick={openNew} className="gap-2 text-xs shadow-xs"><Icon name="Plus" className="size-4" />Novo comunicado</Button></Can>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={a.counts.total} subtitle="Comunicados" description="Todos os estados" icon="Files" />
        <DynamicMetricCard title={a.counts.published} subtitle="Publicados" description="Visíveis no portal" icon="Send" />
        <DynamicMetricCard title={a.counts.drafts} subtitle="Rascunhos" description="Aguardam publicação" icon="Pencil" />
        <DynamicMetricCard title={a.counts.school} subtitle="Para toda a escola" description="Publicados a todos os encarregados" icon="Building2" />
      </div>

      <DataList<ApiAnnouncement>
        prefix="comunicados"
        rows={a.announcements}
        columns={columns}
        isLoading={a.isLoading}
        isError={a.isError}
        refetch={a.refetch}
        pageSize={10}
        searchPlaceholder="Pesquisar por título ou conteúdo"
        searchText={(x) => `${x.title} ${x.body}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: (Object.keys(STATUS_LABEL) as AnnouncementStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] })), match: (x, v) => x.status === v },
          { key: "destino", label: "Destinatários", icon: "Users", options: [{ value: "escola", label: "Toda a escola" }, { value: "turma", label: "Turma" }], match: (x, v) => x.audience === v },
          { key: "turma", label: "Turma", icon: "DoorOpen", options: sections.map((s) => ({ value: s.id, label: s.name })), match: (x, v) => x.section_id === v },
        ]}
        dateFilters={[{ key: "criado", label: "Criação", getDate: (x) => x.created_at }]}
        sorts={[
          { value: "data", label: "Data de criação", compare: (x, y) => x.created_at.localeCompare(y.created_at) },
          { value: "titulo", label: "Título", compare: (x, y) => x.title.localeCompare(y.title, "pt") },
        ]}
        emptyTitle="Nenhum comunicado"
        emptyDescription="Crie o primeiro comunicado para os encarregados."
        emptyIcon="Megaphone"
      />

      <FormModal id="announcement-form" title={editing ? "Editar comunicado" : "Novo comunicado"} description={editing ? "Só rascunhos podem ser editados." : "É criado como rascunho; publique-o para chegar ao portal."} submitLabel={editing ? "Guardar" : "Criar rascunho"} size="md"
        isLoading={a.create.isPending || a.update.isPending} disabled={title.trim().length < 3 || body.trim().length < 3 || (!editing && audience === "turma" && !sectionId)} onSubmit={save}>
        <div className="grid grid-cols-1 gap-3.5 sm:col-span-2">
          <Input label="Título *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Reunião geral de encarregados de educação" />
          {!editing && (
            <div className={cn("grid grid-cols-1 gap-3", audience === "turma" && "sm:grid-cols-2")}>
              <FormSelect label="Destinatários" value={audience} onValueChange={(v) => setAudience(v as AnnouncementAudience)} options={[{ value: "escola", label: "Toda a escola" }, { value: "turma", label: "Uma turma" }]} />
              {audience === "turma" && <FormSelect label="Turma *" value={sectionId} onValueChange={setSectionId} options={sections.map((s) => ({ value: s.id, label: s.name }))} />}
            </div>
          )}
          <FormTextarea label="Mensagem *" value={body} onChange={setBody} rows={5} placeholder="Escreva o comunicado a publicar no portal..." />
        </div>
      </FormModal>

      <FormModal id="announcement-view" title={viewing?.title ?? "Comunicado"} description={viewing ? `${AUDIENCE_LABEL[viewing.audience]}${viewing.section_id ? ` — ${sectionName(viewing.section_id)}` : ""} • ${STATUS_LABEL[viewing.status]}` : undefined} size="md" readOnly onSubmit={() => undefined}>
        {viewing && <div className="sm:col-span-2 whitespace-pre-wrap text-sm leading-relaxed">{viewing.body}</div>}
      </FormModal>

      <ConfirmModal id="announcement-archive" title="Arquivar comunicado" description={archiving ? `Arquivar "${archiving.title}"? Deixa de aparecer no portal.` : ""} destructive confirmLabel="Arquivar"
        onConfirm={() => (archiving ? a.archive.mutateAsync(archiving.id).then(() => { SucessMessage("Comunicado arquivado."); }).catch(fail) : Promise.resolve())} />
    </div>
  );
}
