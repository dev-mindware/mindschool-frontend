/**
 * Pedido de autorização do MindGest (OAuth 2.0 código + PKCE) recebido pela página de consentimento. A validação
 * definitiva (client_id, redirect_uri registado, desafio PKCE) é da API; aqui só se confirma que o pedido está completo
 * e se constroem os URLs de retorno, que nunca vêm de outro sítio que não o `redirect_uri` já validado pela API.
 */
export const CONSENT_PATH = "/integrations/mindgest/authorize";

export interface ConsentParams {
  client_id: string;
  redirect_uri: string;
  state: string;
  code_challenge: string;
  code_challenge_method: "S256";
}

const KEYS = ["client_id", "redirect_uri", "state", "code_challenge", "code_challenge_method"] as const;

/** `null` quando falta algum parâmetro ou o método PKCE não é S256 (o MindSchool recusa pedidos sem desafio). */
export function parseConsentParams(search: URLSearchParams | { get(name: string): string | null }): ConsentParams | null {
  const out: Record<string, string> = {};
  for (const k of KEYS) {
    const v = search.get(k);
    if (!v) return null;
    out[k] = v;
  }
  if (out.code_challenge_method !== "S256") return null;
  try {
    const target = new URL(out.redirect_uri!);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
    if (target.protocol !== "https:" && !loopback) return null;
  } catch {
    return null;
  }
  return out as unknown as ConsentParams;
}

export const consentQuery = (p: ConsentParams): string => new URLSearchParams({ response_type: "code", ...p }).toString();

/** Recusa: volta ao MindGest com `error=access_denied` e o mesmo `state`. */
export function declineUrl(p: Pick<ConsentParams, "redirect_uri" | "state">): string {
  const u = new URL(p.redirect_uri);
  u.searchParams.set("error", "access_denied");
  u.searchParams.set("state", p.state);
  return u.toString();
}

/** Depois do login, só se retoma esta página (nunca um destino arbitrário: evita redireccionamentos abertos). */
export function safeResumePath(from: string | null | undefined): string | null {
  if (!from || !from.startsWith(`${CONSENT_PATH}?`)) return null;
  return from;
}

/**
 * Cabeçalhos da página de consentimento (aplicados em `next.config.ts`): não pode ser embebida (clickjacking, RFC 9700 §4.16),
 * nem ficar em cache, nem enviar o URL (com `state` e desafio PKCE) em `Referer`.
 */
export const CONSENT_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cache-Control", value: "no-store" },
  { key: "Referrer-Policy", value: "no-referrer" },
];
