import api from "./api";

export interface ApiSession { id: string; current: boolean; started_at: string; last_active_at: string; ip: string | null; user_agent: string | null }
export interface ApiPasskey { id: string; device_name: string; transports: string[]; backed_up: boolean; created_at: string; last_used_at: string | null }

const b64uToBuf = (s: string): ArrayBuffer => {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
};
const bufToB64u = (b: ArrayBuffer): string => {
  let s = "";
  for (const byte of new Uint8Array(b)) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

interface RegistrationOptions {
  challenge: string;
  rp: PublicKeyCredentialRpEntity;
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  excludeCredentials?: Array<{ id: string; type: "public-key"; transports?: AuthenticatorTransport[] }>;
}

interface AuthenticationOptions {
  challenge: string;
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
  allowCredentials?: Array<{ id: string; type?: "public-key"; transports?: AuthenticatorTransport[] }>;
}

export const passkeysSupported = (): boolean => typeof window !== "undefined" && Boolean(window.PublicKeyCredential);

/**
 * Reautenticação com passkey (PIN/biometria): substitui a palavra-passe e o código do segundo factor.
 * Devolve o token de step-up de curta duração.
 */
export async function stepUpWithPasskey(): Promise<{ step_up_token: string; expires_in: number }> {
  if (!passkeysSupported()) throw new Error("Este navegador não suporta passkeys.");
  const { data } = await api.post<{ challenge_id: string; options: AuthenticationOptions }>("/auth/webauthn/step-up/options", {});
  const o = data.options;
  const cred = (await navigator.credentials.get({
    publicKey: {
      challenge: b64uToBuf(o.challenge),
      ...(o.rpId ? { rpId: o.rpId } : {}),
      ...(o.timeout ? { timeout: o.timeout } : {}),
      userVerification: o.userVerification ?? "required",
      allowCredentials: (o.allowCredentials ?? []).map((c) => ({ type: "public-key" as const, id: b64uToBuf(c.id), ...(c.transports ? { transports: c.transports } : {}) })),
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("Confirmação cancelada.");
  const a = cred.response as AuthenticatorAssertionResponse;
  const response = {
    id: cred.id,
    rawId: bufToB64u(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: bufToB64u(a.clientDataJSON),
      authenticatorData: bufToB64u(a.authenticatorData),
      signature: bufToB64u(a.signature),
      ...(a.userHandle ? { userHandle: bufToB64u(a.userHandle) } : {}),
    },
    clientExtensionResults: cred.getClientExtensionResults(),
  };
  return (await api.post<{ step_up_token: string; expires_in: number }>("/auth/step-up", { webauthn: { challenge_id: data.challenge_id, response } })).data;
}

export const securityService = {
  sessions: async (): Promise<ApiSession[]> => (await api.get<{ data: ApiSession[] }>("/auth/sessions")).data.data,
  revokeSession: async (id: string) => (await api.delete(`/auth/sessions/${id}`)).data,
  logoutAll: async () => (await api.post("/auth/logout-all", {})).data,

  mfaEnroll: async (): Promise<{ secret: string; otpauth_url: string }> => (await api.post<{ secret: string; otpauth_url: string }>("/auth/mfa/enroll", {})).data,
  mfaVerify: async (code: string): Promise<{ recovery_codes?: string[] }> => (await api.post<{ recovery_codes?: string[] }>("/auth/mfa/verify", { code })).data,
  mfaDisable: async (password: string, code: string) => (await api.post("/auth/mfa/disable", { password, code })).data,
  recoveryCodes: async (code: string): Promise<{ recovery_codes: string[] }> => (await api.post<{ recovery_codes: string[] }>("/auth/mfa/recovery-codes", { code })).data,

  passkeys: async (): Promise<ApiPasskey[]> => (await api.get<{ data: ApiPasskey[] }>("/auth/webauthn/credentials")).data.data,
  removePasskey: async (id: string, password: string) => (await api.delete(`/auth/webauthn/credentials/${id}`, { data: { password } })).data,

  /** Regista uma passkey (segundo factor): opcoes da API -> navegador (WebAuthn) -> verificacao na API. */
  registerPasskey: async (deviceName: string): Promise<{ recovery_codes?: string[] }> => {
    if (typeof window === "undefined" || !window.PublicKeyCredential) throw new Error("Este navegador não suporta passkeys.");
    const { data } = await api.post<{ challenge_id: string; options: RegistrationOptions }>("/auth/webauthn/register/options", {});
    const o = data.options;
    const cred = (await navigator.credentials.create({
      publicKey: {
        ...o,
        challenge: b64uToBuf(o.challenge),
        user: { ...o.user, id: b64uToBuf(o.user.id) },
        excludeCredentials: (o.excludeCredentials ?? []).map((c) => ({ ...c, id: b64uToBuf(c.id) })),
      },
    })) as PublicKeyCredential | null;
    if (!cred) throw new Error("Registo cancelado.");
    const att = cred.response as AuthenticatorAttestationResponse;
    const response = {
      id: cred.id,
      rawId: bufToB64u(cred.rawId),
      type: cred.type,
      response: {
        clientDataJSON: bufToB64u(att.clientDataJSON),
        attestationObject: bufToB64u(att.attestationObject),
        transports: att.getTransports?.() ?? [],
      },
      clientExtensionResults: cred.getClientExtensionResults(),
    };
    return (await api.post<{ recovery_codes?: string[] }>("/auth/webauthn/register/verify", { challenge_id: data.challenge_id, response, device_name: deviceName })).data;
  },
};
