"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { patchSettings } from "@/services/school-settings-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Regras do logotipo (iguais às da API): o espaço do logotipo na sidebar e nos documentos é quadrado. */
export const LOGO_RULES = {
  minSide: 256,
  maxSide: 4096,
  squareTolerance: 0.02,
  maxBytes: 2_000_000,
  mimes: ["image/png", "image/jpeg", "image/webp"] as const,
};

/** Cor por omissão dos documentos (igual à API). */
export const DEFAULT_BRAND_COLOR = "#1F3A5F";

export interface SchoolBranding {
  name: string;
  nif: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  medCode: string | null;
  logoPath: string | null;
  color: string;
  motto: string;
  website: string;
  directorName: string;
  directorTitle: string;
}

interface ApiSchool {
  id: string;
  name: string;
  nif: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  med_code: string | null;
  logo_path: string | null;
  settings: { branding?: { primary_color?: string; motto?: string | null; website?: string | null; director_name?: string | null; director_title?: string } };
}

const toBranding = (s: ApiSchool): SchoolBranding => ({
  name: s.name,
  nif: s.nif,
  address: s.address,
  phone: s.phone,
  email: s.email,
  medCode: s.med_code,
  logoPath: s.logo_path,
  color: s.settings?.branding?.primary_color ?? DEFAULT_BRAND_COLOR,
  motto: s.settings?.branding?.motto ?? "",
  website: s.settings?.branding?.website ?? "",
  directorName: s.settings?.branding?.director_name ?? "",
  directorTitle: s.settings?.branding?.director_title ?? "A Direcção",
});

/** Problema de um ficheiro de logotipo, ou `null` se cumpre as regras (a API volta a validar o conteúdo real). */
export async function checkLogoFile(file: File): Promise<string | null> {
  if (!(LOGO_RULES.mimes as readonly string[]).includes(file.type)) return "Use uma imagem PNG, JPEG ou WebP (SVG não é aceite).";
  if (file.size > LOGO_RULES.maxBytes) return `A imagem tem ${(file.size / 1_000_000).toFixed(1)} MB; o máximo é 2 MB.`;
  let w = 0;
  let h = 0;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    w = bmp.width;
    h = bmp.height;
    bmp.close();
  } catch {
    return "Não foi possível ler a imagem. Verifique se o ficheiro não está corrompido.";
  }
  const { minSide, maxSide, squareTolerance } = LOGO_RULES;
  if (Math.min(w, h) < minSide) return `A imagem tem ${w}×${h} px; o mínimo é ${minSide}×${minSide} px para ficar nítida nos documentos.`;
  if (Math.max(w, h) > maxSide) return `A imagem tem ${w}×${h} px; o máximo é ${maxSide}×${maxSide} px.`;
  if (Math.abs(w - h) / Math.max(w, h) > squareTolerance) {
    return `O logótipo tem de ser quadrado (1:1) para não ficar deformado na barra lateral e nos documentos. A imagem tem ${w}×${h} px — recorte-a para ${Math.min(w, h)}×${Math.min(w, h)} px.`;
  }
  return null;
}

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

/** Identidade visual da escola activa: logotipo (upload/remoção), cor, lema e website. */
export function useSchoolBranding() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const patchMembership = useActiveSchoolStore((s) => s.patchMembership);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["school", schoolId, "branding"],
    queryFn: async () => toBranding((await api.get<ApiSchool>("/s")).data),
    enabled: Boolean(schoolId),
  });

  const refresh = (s: ApiSchool) => {
    queryClient.setQueryData(["school", schoolId, "branding"], toBranding(s));
    queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
    if (schoolId) patchMembership(schoolId, { logoPath: s.logo_path, brandColor: s.settings?.branding?.primary_color ?? DEFAULT_BRAND_COLOR });
  };

  const uploadLogo = useMutation({
    mutationFn: async (file: File) =>
      (await api.put<ApiSchool>("/s/logo", { file_name: file.name, mime_type: file.type, content_base64: await toBase64(file) })).data,
    onSuccess: refresh,
  });

  const removeLogo = useMutation({
    mutationFn: async () => (await api.delete<ApiSchool>("/s/logo")).data,
    onSuccess: refresh,
  });

  const saveStyle = useMutation({
    mutationFn: async (v: { color: string; motto: string; website: string }) => {
      await patchSettings({ branding: { primary_color: v.color, motto: v.motto.trim() || null, website: v.website.trim() || null } });
      return (await api.get<ApiSchool>("/s")).data;
    },
    onSuccess: refresh,
  });

  return { branding: query.data, isLoading: query.isLoading, uploadLogo, removeLogo, saveStyle };
}
