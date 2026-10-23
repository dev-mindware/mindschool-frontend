import api from "@/services/api";
import { consentQuery, type ConsentParams } from "@/lib/mindgest-consent";

export interface ApiMindgestCatalogueItem {
  service_ref: string;
  name: string;
  state: "por_configurar" | "pronto";
  reference_price: string | null;
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

  /** Página de consentimento: a API valida o pedido e devolve as escolas onde o utilizador é titular. */
  consentInfo: async (p: ConsentParams): Promise<ApiConsentInfo> =>
    (await api.get<ApiConsentInfo>(`/integrations/mindgest/authorization?${consentQuery(p)}`)).data,
  /** O titular aceita: a API devolve o URL do MindGest com o código (uso único, 60 s). */
  authorize: async (schoolId: string, p: ConsentParams): Promise<{ redirect_to: string }> =>
    (await api.post<{ redirect_to: string }>(`/schools/${schoolId}/integrations/mindgest/authorize`, p)).data,
};
