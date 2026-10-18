import api from "./api";

export type RetentionState = "sem_prazo" | "em_retencao" | "a_expirar" | "expirado";

export interface ApiArchiveSummary {
  total_files: number;
  total_bytes: number;
  domains: Array<{ domain: string; files: number; bytes: number }>;
  retention: Record<RetentionState, number>;
  expiring_days: number;
}

export interface ApiArchiveItem {
  id: string;
  domain: string;
  file_name: string;
  mime_type: string;
  size_bytes: number | null;
  sha256: string | null;
  created_at: string;
  retention_until: string | null;
  retention_state: RetentionState;
  /** Presente quando o ficheiro é um documento emitido. */
  document: { number: string; type: string; issued_at: string } | null;
}

export interface ArchiveFilters {
  domain?: string;
  q?: string;
  retention?: RetentionState;
}

export const archiveService = {
  summary: async (): Promise<ApiArchiveSummary> => (await api.get<ApiArchiveSummary>("/s/archive/summary")).data,
  items: async (f: ArchiveFilters, cursor?: string): Promise<{ data: ApiArchiveItem[]; page: { has_more: boolean; next_cursor: string | null } }> =>
    (await api.get("/s/archive/items", { params: { ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)), limit: 25, ...(cursor ? { cursor } : {}) } })).data,
  extendRetention: async (id: string, retentionUntil: string, reason: string) =>
    (await api.post<{ id: string; retention_until: string; retention_state: RetentionState }>(`/s/archive/items/${id}/retention`, { retention_until: new Date(`${retentionUntil}T23:59:59Z`).toISOString(), reason })).data,
  /** Descarrega o pacote ZIP (ficheiros + manifesto com SHA-256). */
  downloadBundle: async (ids: string[]): Promise<void> => {
    const res = await api.post<Blob>("/s/archive/bundle", { object_ids: ids }, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arquivo-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
