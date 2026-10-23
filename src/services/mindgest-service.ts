import api from "@/services/api";
import { consentQuery, type ConsentParams } from "@/lib/mindgest-consent";

export interface ApiMindgestCatalogueItem {
  service_ref: string;
  name: string;
  state: "por_configurar" | "pronto";
  reference_price: string | null;
}

export interface ApiMindgestDiscrepancy {
  id: string;
  kind: "sem_liquidacao_local" | "estado_diferente" | "origem_desconhecida";
  detail: string;
  detected_at: string;
}

export interface ApiMindgestStatus {
  status: "not_connected" | "pending" | "active" | "revoked";
  company: { id: string; name: string; nif: string } | null;
  store: { id: string; name: string } | null;
  connected_at: string | null;
  last_ok_at: string | null;
  last_error: string | null;
  catalogue: { synced_at: string | null; ready: boolean; pending_items: number; items: ApiMindgestCatalogueItem[] };
  /** `incomplete`: ligada, mas há emolumentos sem imposto definido no MindGest. */
  setup: "not_connected" | "incomplete" | "ready";
  /** Emissões suspensas pelo titular (a ligação mantém-se). */
  paused: boolean;
  paused_at: string | null;
  reconciliation: { last_at: string | null; lag_seconds: number | null; consecutive_failures: number; discrepancies: ApiMindgestDiscrepancy[] };
  /** Durante a rotação do segredo do webhook, o anterior continua válido até esta data. */
  secret_rotation: { previous_valid_until: string } | null;
}

export interface ApiBackfillPreview {
  from: string;
  to: string;
  payments: number;
  total: string;
  without_nif: number;
  /** Quantos entram nesta execução (tecto por execução) e quantos ficam para a seguinte. */
  will_issue: number;
  remaining: number;
  limits: { max_documents: number; max_range_months: number };
  integration: "ready" | "sem_ligacao" | "sem_catalogo" | "pausada";
}

export interface ApiBackfillResult {
  created: number;
  skipped: number;
  remaining: number;
}

export interface ApiConsentInfo {
  client: { id: string; name: string; redirect_origin: string };
  schools: Array<{ id: string; name: string; nif: string; already_connected: boolean; connected_company: string | null }>;
}

export const mindgestService = {
  status: async (): Promise<ApiMindgestStatus> => (await api.get<ApiMindgestStatus>("/s/integrations/mindgest")).data,
  test: async (): Promise<{ ok: boolean; error?: string }> => (await api.post<{ ok: boolean; error?: string }>("/s/integrations/mindgest/test")).data,
  syncCatalogue: async (): Promise<ApiMindgestStatus> => (await api.post<ApiMindgestStatus>("/s/integrations/mindgest/catalogue")).data,
  disconnect: async () => (await api.post("/s/integrations/mindgest/disconnect")).data,

  /** «Sincronizar agora»: corre já a reconciliação com o MindGest. */
  reconcile: async (): Promise<{ ok: boolean; fetched: number; applied: number; discrepancies: number; reprocessed: number; error: string | null }> =>
    (await api.post("/s/integrations/mindgest/reconcile")).data,
  pause: async () => (await api.post<{ paused: true; documents_held: number }>("/s/integrations/mindgest/pause")).data,
  resume: async () => (await api.post<{ paused: false }>("/s/integrations/mindgest/resume")).data,
  /** O segredo novo só é devolvido nesta resposta. */
  rotateSecret: async () => (await api.post<{ webhook_secret: string; previous_valid_until: string }>("/s/integrations/mindgest/webhook-secret/rotate")).data,
  backfillPreview: async (from: string, to: string): Promise<ApiBackfillPreview> =>
    (await api.get<ApiBackfillPreview>("/s/integrations/mindgest/backfill", { params: { from, to } })).data,
  backfillRun: async (from: string, to: string, expectedPayments: number): Promise<ApiBackfillResult> =>
    (await api.post<ApiBackfillResult>("/s/integrations/mindgest/backfill", { from, to, expected_payments: expectedPayments })).data,

  /** Página de consentimento: a API valida o pedido e devolve as escolas onde o utilizador é titular. */
  consentInfo: async (p: ConsentParams): Promise<ApiConsentInfo> =>
    (await api.get<ApiConsentInfo>(`/integrations/mindgest/authorization?${consentQuery(p)}`)).data,
  /** O titular aceita: a API devolve o URL do MindGest com o código (uso único, 60 s). */
  authorize: async (schoolId: string, p: ConsentParams): Promise<{ redirect_to: string }> =>
    (await api.post<{ redirect_to: string }>(`/schools/${schoolId}/integrations/mindgest/authorize`, p)).data,
};
