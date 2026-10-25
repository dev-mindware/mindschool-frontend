"use client";

import { useState } from "react";
import { Badge, Button, EmptyState, FormModal, FormSelect, Icon, Input, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useArchive } from "@/hooks/school/use-archive";
import type { ApiArchiveItem, ArchiveFilters, RetentionState } from "@/services/archive-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatDate } from "@/utils/format-date";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const MAX_BUNDLE = 200;
const ALL = "todos";

const RETENTION_LABEL: Record<RetentionState, string> = {
  sem_prazo: "Sem prazo (guardado)",
  em_retencao: "Em retenção",
  a_expirar: "A expirar",
  expirado: "Expirado",
};
const RETENTION_TONE: Record<RetentionState, "outline" | "warning" | "destructive"> = { sem_prazo: "outline", em_retencao: "outline", a_expirar: "warning", expirado: "destructive" };

const DOC_TYPE: Record<string, string> = {
  certificado: "Certificado", declaracao: "Declaração", boletim: "Boletim", historico: "Histórico", cartao: "Cartão",
};

const bytes = (n: number | null | undefined) => {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
};
const fail = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));

function ExtendModal({ item, onSubmit, pending }: { item: ApiArchiveItem | null; onSubmit: (until: string, reason: string) => Promise<unknown>; pending: boolean }) {
  const { open } = useModal();
  const [until, setUntil] = useState("");
  const [reason, setReason] = useState("");
  if (!open["archive-retention"]) return null;
  return (
    <FormModal
      id="archive-retention" title="Prorrogar a retenção" description={item ? `${item.file_name} — prazo atual ${item.retention_until ? formatDate(item.retention_until) : "—"}` : undefined}
      submitLabel="Prorrogar" isLoading={pending} disabled={!until || reason.trim().length < 5}
      onSubmit={() => onSubmit(until, reason.trim()).then(() => { setUntil(""); setReason(""); })}
    >
      <Input label="Novo prazo *" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
      <div className="sm:col-span-2"><Input label="Motivo * (ex.: processo individual, obrigação legal)" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      <p className="text-xs text-muted-foreground sm:col-span-2">O prazo só pode ser prorrogado, nunca encurtado. Depois dele, o ficheiro é apagado pela limpeza diária.</p>
    </FormModal>
  );
}

/** Arquivo documental avançado (Enterprise): pesquisa em todos os ficheiros da escola, retenção e pacote ZIP com manifesto. */
export function ArchivePageContent() {
  const [filters, setFilters] = useState<ArchiveFilters>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [extending, setExtending] = useState<ApiArchiveItem | null>(null);
  const a = useArchive(filters);
  const { openModal } = useModal();

  if (a.summaryError) {
    return <EmptyState icon="Archive" title="Arquivo indisponível" description="Não foi possível carregar o arquivo. O arquivo documental avançado faz parte do plano Enterprise e exige permissão de documentos." />;
  }

  const s = a.summary;
  const set = (patch: Partial<ArchiveFilters>) => { setFilters((f) => ({ ...f, ...patch })); setSelected(new Set()); };
  const toggle = (id: string) => setSelected((cur) => { const n = new Set(cur); if (n.has(id)) n.delete(id); else if (n.size < MAX_BUNDLE) n.add(id); return n; });
  const allOnPage = a.items.length > 0 && a.items.every((i) => selected.has(i.id));
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(a.items.slice(0, MAX_BUNDLE).map((i) => i.id)));

  const download = () => a.bundle.mutateAsync([...selected]).then(() => SucessMessage(`Pacote com ${selected.size} ficheiro(s) descarregado.`)).catch(fail);

  return (
    <div className="space-y-6">
      <TitleList title="Arquivo Documental" suTitle="Todos os ficheiros da escola num só sítio: pesquise, controle a retenção e descarregue pacotes com manifesto (SHA-256).">
        <Button size="sm" className="gap-1.5" disabled={selected.size === 0 || a.bundle.isPending} onClick={() => void download()}>
          <Icon name="Download" className="size-4" />Descarregar pacote{selected.size > 0 ? ` (${selected.size})` : ""}
        </Button>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={s?.total_files ?? 0} subtitle="Ficheiros" icon="Archive" description={`${bytes(s?.total_bytes)} no total`} />
        <DynamicMetricCard title={s?.retention.em_retencao ?? 0} subtitle="Em retenção" icon="ShieldCheck" description="Com prazo para além do período de aviso" />
        <DynamicMetricCard title={s?.retention.a_expirar ?? 0} subtitle="A expirar" icon="Clock" description={`Nos próximos ${s?.expiring_days ?? 90} dias`} colors={(s?.retention.a_expirar ?? 0) > 0 ? "destructive" : "default"} />
        <DynamicMetricCard title={s?.retention.sem_prazo ?? 0} subtitle="Sem prazo" icon="Infinity" description="Guardados até serem removidos" />
      </div>

      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Input label="Pesquisar pelo nome do ficheiro" startIcon="Search" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") set({ q: search.trim().length >= 2 ? search.trim() : undefined }); }} />
        </div>
        <FormSelect label="Origem" value={filters.domain ?? ALL} onValueChange={(v) => set({ domain: v === ALL ? undefined : v })}
          options={[{ value: ALL, label: "Todas" }, ...(s?.domains ?? []).map((d) => ({ value: d.domain, label: `${d.domain} (${d.files})` }))]} />
        <FormSelect label="Retenção" value={filters.retention ?? ALL} onValueChange={(v) => set({ retention: v === ALL ? undefined : (v as RetentionState) })}
          options={[{ value: ALL, label: "Todas" }, ...(Object.keys(RETENTION_LABEL) as RetentionState[]).map((k) => ({ value: k, label: RETENTION_LABEL[k] }))]} />
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">Prima Enter para pesquisar pelo nome. O pacote admite até {MAX_BUNDLE} ficheiros e 100 MB e conta como uma exportação do mês.</p>

      {a.isLoading ? (
        <p className="text-sm text-muted-foreground">A carregar…</p>
      ) : a.items.length === 0 ? (
        <EmptyState icon="Archive" title="Sem ficheiros" description="Nenhum ficheiro corresponde aos critérios." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={allOnPage} onCheckedChange={toggleAll} aria-label="Seleccionar todos" /></TableHead>
                <TableHead>Ficheiro</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Tamanho</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Retenção</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {a.items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell><Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggle(i.id)} aria-label={`Seleccionar ${i.file_name}`} /></TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{i.file_name}</span>
                      {i.document && <span className="text-xs text-muted-foreground">{DOC_TYPE[i.document.type] ?? i.document.type} · {i.document.number}</span>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{i.domain}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-xs">{bytes(i.size_bytes)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{formatDate(i.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Badge variant={RETENTION_TONE[i.retention_state]} className="w-fit text-[10px]">{RETENTION_LABEL[i.retention_state]}</Badge>
                      {i.retention_until && <span className="text-[11px] text-muted-foreground">até {formatDate(i.retention_until)}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {i.retention_until && (
                      <Button size="sm" variant="ghost" onClick={() => { setExtending(i); openModal("archive-retention"); }}>Prorrogar</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {a.hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" disabled={a.loadingMore} onClick={() => void a.loadMore()}>{a.loadingMore ? "A carregar…" : "Carregar mais"}</Button>
        </div>
      )}

      <ExtendModal item={extending} pending={a.extend.isPending}
        onSubmit={(until, reason) => (extending ? a.extend.mutateAsync({ id: extending.id, until, reason }).then(() => SucessMessage("Retenção prorrogada.")).catch((e) => { fail(e); throw e; }) : Promise.resolve())} />
    </div>
  );
}
