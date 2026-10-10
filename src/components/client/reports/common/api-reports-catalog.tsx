"use client";

import { useMemo, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, DataList, EmptyState, FormModal, Icon, type Column } from "@/components";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { ReportDefinition, ReportPreview, useReportsCatalog } from "@/hooks/school/use-reports";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

interface ApiReportsCatalogProps {
  /** Dominios do catalogo a mostrar (por omissao todos os que o utilizador pode ler). */
  domains?: string[];
  title: string;
  description: string;
}

const FORMAT_LABEL = { csv: "CSV", xlsx: "Excel", pdf: "PDF" } as const;
const MODAL_ID = "report-preview";

type PreviewRow = { id: string } & Record<string, unknown>;

/** Relatorios oficiais da API: cada cartao tem pre-visualizacao (modal com lista filtravel) e exportacao (CSV, XLSX, PDF). */
export function ApiReportsCatalog({ domains, title, description }: ApiReportsCatalogProps) {
  const { reports, isLoading, preview, exportReport } = useReportsCatalog(domains);
  const { openModal } = useModal();
  const [open, setOpen] = useState<{ report: ReportDefinition; data: ReportPreview } | null>(null);
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? reports.filter((r) => `${r.name} ${r.description}`.toLowerCase().includes(q)) : reports;
  }, [reports, search]);

  const showPreview = (report: ReportDefinition) =>
    preview.mutate(report.code, {
      onSuccess: (data) => { setOpen({ report, data }); openModal(MODAL_ID); },
      onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível gerar a pré-visualização.")),
    });

  const download = (code: string, format: "csv" | "xlsx" | "pdf") =>
    exportReport.mutate({ code, format }, { onSuccess: () => SucessMessage("Exportação concluída."), onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível exportar.")) });

  const rows: PreviewRow[] = useMemo(() => (open?.data.data ?? []).map((r, i) => ({ ...r, id: String(i) })), [open]);
  const columns: Column<PreviewRow>[] = useMemo(
    () => (open?.data.columns ?? []).map((c) => ({ key: c.key, header: c.label, render: (_: unknown, row: PreviewRow) => String(row[c.key] ?? "") })),
    [open],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <SearchHandlerWrapper search={search} setSearch={setSearch} placeholder="Pesquisar relatório" className="w-full sm:max-w-xs" />
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">A carregar relatórios…</div>}
      {!isLoading && visible.length === 0 && <EmptyState icon="FileText" title="Sem relatórios" description="Não há relatórios disponíveis para o seu perfil ou pesquisa." />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visible.map((r) => (
          <div key={r.code} className="space-y-3 rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{r.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
              </div>
              {r.contains_sensitive_data && <Badge variant="outline" className="shrink-0 text-[10px]">Dados pessoais</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => showPreview(r)} disabled={preview.isPending}>
                <Icon name="Eye" className="size-3.5" />
                Pré-visualizar
              </Button>
              {(["xlsx", "pdf", "csv"] as const).filter((f) => r.formats.includes(f)).map((f) => (
                <Button key={f} size="sm" variant="secondary" className="h-8 gap-1.5 text-xs" onClick={() => download(r.code, f)} disabled={exportReport.isPending}>
                  <Icon name="Download" className="size-3.5" />
                  {FORMAT_LABEL[f]}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <FormModal id={MODAL_ID} title={open?.report.name ?? "Pré-visualização"} description={open?.report.description} size="xl" readOnly onSubmit={() => undefined}>
        {open && (
          <div className="sm:col-span-2">
            <DataList<PreviewRow>
              prefix="prev"
              rows={rows}
              columns={columns}
              pageSize={10}
              searchPlaceholder="Pesquisar nos resultados"
              searchText={(row) => Object.values(row).join(" ")}
              emptyTitle="Sem dados"
              emptyDescription="Este relatório não devolveu linhas."
              emptyIcon="FileText"
            />
          </div>
        )}
      </FormModal>
    </div>
  );
}
