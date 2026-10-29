import api from "./api";

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** Fusao profunda: objectos fundem-se, listas e escalares do `patch` substituem. */
export function deepMerge(base: Json, patch: Json): Json {
  const out: Json = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = isObj(v) && isObj(base[k]) ? deepMerge(base[k] as Json, v) : v;
  return out;
}

/** Configuracao crua da escola (o que foi gravado; os valores por omissao resolvem-se na API). */
export async function readRawSettings(): Promise<Json> {
  const { data } = await api.get<{ settings?: Json | null }>("/s");
  return (data.settings ?? {}) as Json;
}

/**
 * A API substitui `settings` por inteiro no PATCH: por isso le-se o atual, funde-se e envia-se o resultado completo
 * (nunca se envia so um bloco, ou as restantes definicoes seriam apagadas).
 */
export async function patchSettings(patch: Json, extra: Json = {}): Promise<void> {
  const current = await readRawSettings();
  await api.patch("/s", { ...extra, settings: deepMerge(current, patch) });
}

export interface UploadLogoResult {
  logo_url: string;
  object_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
}

/** Carregamento directo do logótipo da escola para o storage privado. */
export async function uploadSchoolLogo(file: File): Promise<UploadLogoResult> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const { data } = await api.post<UploadLogoResult>("/s/logo", {
    file_name: file.name,
    mime_type: file.type || "image/png",
    content_base64: base64,
  });
  return data;
}

/** Remoção do logótipo da escola do storage. */
export async function deleteSchoolLogo(): Promise<void> {
  await api.delete("/s/logo");
}
