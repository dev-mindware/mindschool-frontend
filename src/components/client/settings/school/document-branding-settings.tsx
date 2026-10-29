"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone, type Accept } from "react-dropzone";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Button, Icon, Input, Label, RadioGroup, RadioGroupItem, Separator, TitleList } from "@/components";
import { useSchoolProfile } from "@/hooks/school/use-school-profile";
import { savePrimary, DEFAULT_PRIMARY } from "@/lib/appearance";
import { patchSettings, uploadSchoolLogo, deleteSchoolLogo } from "@/services/school-settings-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { cn } from "@/lib/utils";

type Identity = "estado" | "escola";

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const OPTIONS: Array<{ value: Identity; title: string; text: string }> = [
  { value: "estado", title: "Informações do Estado", text: "Insígnia nacional e linhas oficiais (República de Angola, Ministério da Educação) no topo de cada documento." },
  { value: "escola", title: "Informações da escola", text: "Logótipo e nome da escola no topo, sem as linhas do Estado. Sem logótipo, usa-se a insígnia nacional." },
];

const LOGO_ACCEPT: Accept = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],
};

function getLogoDisplayUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3011/api/v1";
  const apiRoot = base.replace(/\/api\/v1\/?$/, "");
  return url.startsWith("/") ? `${apiRoot}${url}` : `${base}/${url}`;
}

/** Componente de carregamento directo do logótipo institucional para o storage privado. */
function SchoolLogoUploader({
  currentLogoUrl,
  onLogoChange,
  disabled,
}: {
  currentLogoUrl: string | null;
  onLogoChange: (newUrl: string | null) => void;
  disabled?: boolean;
}) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(getLogoDisplayUrl(currentLogoUrl));

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadSchoolLogo(file);
      const displayUrl = getLogoDisplayUrl(res.logo_url);
      setPreviewUrl(displayUrl);
      onLogoChange(res.logo_url);
      queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
      SucessMessage("Logótipo da escola carregado com sucesso.");
    } catch (err) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível carregar o logótipo da escola."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSchoolLogo();
      setPreviewUrl(null);
      onLogoChange(null);
      queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
      SucessMessage("Logótipo da escola removido.");
    } catch (err) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível remover o logótipo."));
    } finally {
      setIsDeleting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: LOGO_ACCEPT,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    noClick: Boolean(previewUrl),
    disabled: disabled || isUploading || isDeleting,
    onDropAccepted: (files) => {
      if (files[0]) void handleUpload(files[0]);
    },
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code;
      ErrorMessage(code === "file-too-large" ? "O logótipo excede o limite máximo de 5 MB." : "Formato não suportado. Utilize PNG, JPG, WEBP ou SVG.");
    },
  });

  return (
    <div className="space-y-1.5">
      <Label htmlFor="school-logo-dropzone">Logótipo institucional da escola</Label>
      <div
        {...getRootProps()}
        id="school-logo-dropzone"
        className={cn(
          "relative flex min-h-[108px] flex-col items-center justify-center rounded-xs border border-dashed p-3 transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/30",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input {...getInputProps()} />

        {previewUrl ? (
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xs border bg-background/90 p-1 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Logótipo da escola"
                  className="max-h-full max-w-full object-contain"
                  onError={() => {
                    // Imagem remota inacessível
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Logótipo ativo</p>
                <p className="text-2xs text-muted-foreground">Guardado com segurança no armazenamento da escola</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={open}
                disabled={isUploading || isDeleting}
                className="h-8 rounded-xs text-xs"
              >
                <Icon name="RefreshCw" className={cn("mr-1.5 size-3.5", isUploading && "animate-spin")} />
                {isUploading ? "A carregar…" : "Substituir"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
                className="h-8 rounded-xs text-xs"
              >
                <Icon name="Trash2" className={cn("mr-1.5 size-3.5", isDeleting && "animate-spin")} />
                {isDeleting ? "A remover…" : "Remover"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex cursor-pointer flex-col items-center justify-center gap-1.5 py-2 text-center">
            <div className="flex size-9 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Icon name={isUploading ? "RefreshCw" : "Upload"} className={cn("size-4.5", isUploading && "animate-spin")} />
            </div>
            <p className="text-xs font-medium text-foreground">
              {isUploading ? "A transferir logótipo para o armazenamento…" : "Clique para seleccionar ou arraste o logótipo"}
            </p>
            <p className="text-2xs text-muted-foreground">
              PNG, JPG, WEBP ou SVG · Limite máximo 5 MB
            </p>
          </div>
        )}
      </div>
      <p className="text-2xs text-muted-foreground">
        Utilizado no modo «Informações da escola» em declarações, boletins e relatórios. Sem logótipo, exibe a insígnia nacional.
      </p>
    </div>
  );
}

/** Aspecto dos PDF emitidos (declarações, boletins, certificados, diplomas e relatórios): quem assina o cabeçalho, logótipo e cor da escola. */
export function DocumentBrandingSettings() {
  const { school } = useSchoolProfile();
  if (!school) return null;
  const b = school.settings?.branding;
  // A chave volta a montar o formulário quando o valor gravado muda (após guardar ou trocar de escola).
  return <BrandingForm key={`${school.id}|${b?.document_identity}|${b?.primary_color}|${b?.logo_url}`} branding={b} />;
}

type ApiBranding = NonNullable<ReturnType<typeof useSchoolProfile>["school"]>["settings"]["branding"];

function BrandingForm({ branding }: { branding: ApiBranding }) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [identity, setIdentity] = useState<Identity>(branding?.document_identity === "escola" ? "escola" : "estado");
  const [color, setColor] = useState(branding?.primary_color ?? "");
  const [logo, setLogo] = useState(branding?.logo_url ?? "");

  const colorValid = color === "" || HEX.test(color);
  const save = useMutation({
    mutationFn: () => patchSettings({ branding: { document_identity: identity, primary_color: color || null, logo_url: logo ? logo.trim() : null } }),
    onSuccess: () => {
      savePrimary(color && HEX.test(color) ? color : DEFAULT_PRIMARY);
      queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
    },
  });

  const submit = () =>
    save.mutateAsync()
      .then(() => SucessMessage("Aspecto dos documentos atualizado."))
      .catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar o aspecto dos documentos.")));

  return (
    <div className="space-y-4">
      <TitleList title="Aspecto dos documentos" suTitle="Cabeçalho, logótipo e cor institucional dos documentos." />
      <Separator />
      <div className="space-y-5">
        <RadioGroup
          value={identity}
          onValueChange={(val) => setIdentity(val as Identity)}
          aria-label="Informações usadas no cabeçalho"
          className="grid gap-3 sm:grid-cols-2"
        >
          {OPTIONS.map((o) => (
            <Label
              key={o.value}
              htmlFor={`identity-${o.value}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xs border p-3 text-left font-normal transition-colors",
                identity === o.value ? "border-primary bg-primary/5" : "hover:bg-muted/50",
              )}
            >
              <RadioGroupItem id={`identity-${o.value}`} value={o.value} className="mt-0.5" />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-foreground">{o.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{o.text}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="doc-color">Cor institucional da escola</Label>
            <div className="flex items-center gap-2">
              <input id="doc-color" type="color" aria-label="Escolher cor" value={HEX.test(color) && color.length === 7 ? color : "#000000"} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-xs border bg-transparent p-1" />
              <div className="min-w-0 flex-1"><Input aria-label="Cor em hexadecimal" placeholder="#1d4ed8" value={color} onChange={(e) => setColor(e.target.value)} /></div>
              {color && <Button type="button" variant="ghost" size="sm" className="shrink-0 rounded-xs" onClick={() => setColor("")}>Limpar</Button>}
            </div>
            <p className={cn("text-xs", colorValid ? "text-muted-foreground" : "text-destructive")}>{colorValid ? "Usada na interface, molduras, títulos e cabeçalhos de tabela." : "Use um valor hexadecimal, por exemplo #1d4ed8."}</p>
          </div>

          <SchoolLogoUploader
            currentLogoUrl={logo}
            onLogoChange={(newUrl) => setLogo(newUrl ?? "")}
          />
        </div>

        <Can permission="school:update">
          <Button type="button" onClick={submit} disabled={!colorValid || save.isPending} className="rounded-xs">{save.isPending ? "A guardar…" : "Guardar aspecto"}</Button>
        </Can>
      </div>
    </div>
  );
}
