"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

export interface ReportColumn { key: string; label: string; type: string }
export interface ReportDefinition {
  code: string;
  name: string;
  description: string;
  domain: string;
  formats: Array<"json" | "csv" | "xlsx" | "pdf">;
  columns: ReportColumn[];
  filters: Record<string, string>;
  contains_sensitive_data: boolean;
  /** Como o relatório é calculado (texto da API). */
  calculation?: string;
  /** Linhas mostradas na pré-visualização e máximo por exportação. */
  sync_preview_limit?: number;
  export_max_rows?: number;
  /** Horas durante as quais o ficheiro exportado fica disponível. */
  retention_hours?: number;
}
export interface ReportPreview { columns: ReportColumn[]; data: Array<Record<string, unknown>> }

/** Catalogo de relatorios oficiais da API (pre-visualizacao e exportacao CSV/XLSX/PDF). */
export function useReportsCatalog(domains?: string[]) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const query = useQuery({
    queryKey: ["reports-catalog", schoolId],
    queryFn: async () => (await api.get<{ data: ReportDefinition[] }>("/s/reports/catalog")).data.data,
    enabled: Boolean(schoolId),
    staleTime: 10 * 60 * 1000,
  });
  const reports = (query.data ?? []).filter((r) => !domains || domains.includes(r.domain));

  const preview = useMutation({
    mutationFn: async (code: string) => (await api.post<ReportPreview>(`/s/reports/${code}/preview`, { filters: {} })).data,
  });

  /** Gera a exportacao e descarrega o ficheiro (o download e autorizado e registado na API). */
  const exportReport = useMutation({
    mutationFn: async (v: { code: string; format: "csv" | "xlsx" | "pdf" }) => {
      const job = (await api.post<{ id: string }>(`/s/reports/${v.code}/export`, { filters: {}, format: v.format })).data;
      const res = await api.get<Blob>(`/s/reports/jobs/${job.id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${v.code}.${v.format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  return { reports, isLoading: query.isLoading, preview, exportReport };
}
