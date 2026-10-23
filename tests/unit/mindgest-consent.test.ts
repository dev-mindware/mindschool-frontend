import nextConfig from "../../next.config";
import { CONSENT_PATH, declineUrl, parseConsentParams, safeResumePath } from "../../src/lib/mindgest-consent";

const valid = {
  client_id: "mindgest",
  redirect_uri: "https://app.mindgest.example/plugins/callback",
  state: "state-state-state-state-1",
  code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  code_challenge_method: "S256",
};
const q = (over: Record<string, string> = {}, drop: string[] = []) => {
  const p = new URLSearchParams({ ...valid, ...over });
  drop.forEach((k) => p.delete(k));
  return p;
};

describe("consentimento MindGest: pedido de autorização", () => {
  it("aceita o pedido completo", () => {
    expect(parseConsentParams(q())).toEqual(valid);
  });

  it("recusa pedido sem code_challenge, sem state ou com método que não seja S256", () => {
    expect(parseConsentParams(q({}, ["code_challenge"]))).toBeNull();
    expect(parseConsentParams(q({}, ["state"]))).toBeNull();
    expect(parseConsentParams(q({ code_challenge_method: "plain" }))).toBeNull();
  });

  it("recusa redirect_uri inválido ou sem https", () => {
    expect(parseConsentParams(q({ redirect_uri: "javascript:alert(1)" }))).toBeNull();
    expect(parseConsentParams(q({ redirect_uri: "http://app.mindgest.example/cb" }))).toBeNull();
  });

  it("a recusa volta ao MindGest com access_denied e o mesmo state", () => {
    const u = new URL(declineUrl(valid));
    expect(`${u.origin}${u.pathname}`).toBe("https://app.mindgest.example/plugins/callback");
    expect(u.searchParams.get("error")).toBe("access_denied");
    expect(u.searchParams.get("state")).toBe(valid.state);
  });
});

describe("consentimento MindGest: retomar depois do login", () => {
  it("só retoma a página de consentimento", () => {
    expect(safeResumePath(`${CONSENT_PATH}?client_id=mindgest&state=x`)).toBe(`${CONSENT_PATH}?client_id=mindgest&state=x`);
    expect(safeResumePath("https://evil.example/")).toBeNull();
    expect(safeResumePath("//evil.example/")).toBeNull();
    expect(safeResumePath("/dashboard")).toBeNull();
    expect(safeResumePath(CONSENT_PATH)).toBeNull();
    expect(safeResumePath(null)).toBeNull();
  });
});

describe("consentimento MindGest: página não embebível", () => {
  it("serve frame-ancestors 'none' e X-Frame-Options DENY só na página de consentimento", async () => {
    const rules = await nextConfig.headers!();
    const rule = rules.find((r) => r.source === CONSENT_PATH);
    expect(rule).toBeDefined();
    const h = Object.fromEntries(rule!.headers.map((x) => [x.key.toLowerCase(), x.value]));
    expect(h["content-security-policy"]).toBe("frame-ancestors 'none'");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["cache-control"]).toBe("no-store");
    expect(h["referrer-policy"]).toBe("no-referrer");
  });
});
