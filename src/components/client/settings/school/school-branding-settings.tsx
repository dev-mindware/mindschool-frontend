"use client";

import { useRef, useState } from "react";
import { Badge, Button, Can, Card, CardContent, CardHeader, CardTitle, Icon, Input, TitleList } from "@/components";
import { SchoolLogo } from "@/components/common/logo/school-logo";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { DEFAULT_BRAND_COLOR, LOGO_RULES, checkLogoFile, useSchoolBranding, type SchoolBranding } from "@/hooks/school/use-school-branding";
import { useCan } from "@/hooks/auth/use-can";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

/** Cores sóbrias que imprimem bem (também a preto e branco); a escola pode escolher qualquer outra. */
const PRESETS = [
  { hex: "#1F3A5F", name: "Azul-marinho" },
  { hex: "#0E7C66", name: "Verde" },
  { hex: "#8B1E3F", name: "Bordô" },
  { hex: "#1D4ED8", name: "Azul" },
  { hex: "#5B21B6", name: "Roxo" },
  { hex: "#C2410C", name: "Laranja" },
  { hex: "#A16207", name: "Dourado" },
  { hex: "#374151", name: "Grafite" },
];

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Texto legível sobre a cor (branco ou tinta), pelo mesmo critério de contraste usado nos documentos. */
function onColor(hex: string): string {
  const lum = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const l = 0.2126 * lum[0]! + 0.7152 * lum[1]! + 0.0722 * lum[2]!;
  return (1.05 / (l + 0.05)) >= ((l + 0.05) / (0.0285 + 0.05)) ? "#FFFFFF" : "#111827";
}

/** Miniatura do cabeçalho dos PDF e da tabela Excel, para ver o resultado antes de gravar. */
function DocumentPreview({ b, color, motto, website }: { b: SchoolBranding; color: string; motto: string; website: string }) {
  const safe = HEX.test(color) ? color : DEFAULT_BRAND_COLOR;
  const lines = [[`NIF ${b.nif}`, b.medCode ? `Cód. MED ${b.medCode}` : null, b.address].filter(Boolean).join("  ·  "), [b.phone, b.email, website || null].filter(Boolean).join("  ·  ")].filter(Boolean);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border bg-white p-5 text-[#111827] shadow-sm">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">PDF · cabeçalho</p>
        <div className="flex items-start gap-3">
          {b.logoPath ? <SchoolLogo path={b.logoPath} name={b.name} size={40} /> : <div className="flex size-10 shrink-0 items-center justify-center rounded border border-dashed text-[9px] text-muted-foreground">logo</div>}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{b.name}</p>
            {motto && <p className="truncate text-[11px] italic text-[#6B7280]">{motto}</p>}
            {lines.map((l) => <p key={l} className="truncate text-[9px] text-[#6B7280]">{l}</p>)}
          </div>
        </div>
        <div className="relative mt-3 h-px bg-[#E5E7EB]"><div className="absolute -top-px left-0 h-[2px] w-10" style={{ background: safe }} /></div>
        <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: safe }}>Documento oficial</p>
        <p className="text-base font-bold">Declaração</p>
        <div className="mt-3 border-b pb-1 text-[8px] font-bold uppercase tracking-wide text-[#6B7280]" style={{ borderColor: safe }}>Disciplina <span className="float-right">MT</span></div>
        {["Língua Portuguesa", "Matemática"].map((n, i) => (
          <div key={n} className="flex justify-between border-b border-[#E5E7EB] px-0.5 py-1 text-[10px]" style={{ background: i % 2 ? "#F9FAFB" : undefined }}>
            <span>{n}</span><span className={i ? "font-bold text-[#B42318]" : "font-bold"}>{i ? "8.5" : "14.0"}</span>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-5 text-[#111827] shadow-sm">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Excel · relatório</p>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{b.name}</p>
            <p className="text-xs font-bold" style={{ color: safe }}>Relação de devedores</p>
            <p className="text-[9px] text-[#6B7280]">Ano lectivo 2026/2027 · 48 registos</p>
          </div>
          {b.logoPath && <SchoolLogo path={b.logoPath} name={b.name} size={32} />}
        </div>
        <div className="mt-3 overflow-hidden rounded-sm text-[10px]">
          <div className="grid grid-cols-[1fr_auto] px-2 py-1.5 font-bold" style={{ background: safe, color: onColor(safe) }}><span>Aluno</span><span>Dívida (Kz)</span></div>
          {[["Ana Silva", "45 000,00"], ["Bruno Costa", "90 000,00"], ["Carla Neto", "45 000,00"]].map(([n, v], i) => (
            <div key={n} className="grid grid-cols-[1fr_auto] border-b border-[#E5E7EB] px-2 py-1" style={{ background: i % 2 ? `color-mix(in srgb, ${safe} 8%, white)` : undefined }}>
              <span>{n}</span><span>{v}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_auto] px-2 py-1 font-bold" style={{ borderTop: `1px solid ${safe}` }}><span>Total</span><span>180 000,00</span></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Identidade visual da escola: logótipo (quadrado, mostrado na barra lateral e em todos os documentos), cor institucional,
 * lema e website. Tudo é aplicado aos PDF (declarações, boletins, pautas, recibos, relatórios) e às folhas Excel.
 */
export function SchoolBrandingSettings() {
  const state = useSchoolBranding();
  if (state.isLoading || !state.branding) return <div className="h-64 animate-pulse rounded-lg bg-muted/40" />;
  // O formulário reinicia com os valores gravados sempre que estes mudam (sem sincronizar estado num effect).
  const b = state.branding;
  return <BrandingEditor key={`${b.color}|${b.motto}|${b.website}`} {...state} branding={b} />;
}

function BrandingEditor({ branding, uploadLogo, removeLogo, saveStyle }: ReturnType<typeof useSchoolBranding> & { branding: SchoolBranding }) {
  const { can } = useCan();
  const editable = can("school:update");
  const fileRef = useRef<HTMLInputElement>(null);
  const [color, setColor] = useState(branding.color);
  const [motto, setMotto] = useState(branding.motto);
  const [website, setWebsite] = useState(branding.website);
  const [logoError, setLogoError] = useState<string | null>(null);
  const { openModal } = useModal();

  const dirty = color.toUpperCase() !== branding.color.toUpperCase() || motto !== branding.motto || website !== branding.website;
  const colorValid = HEX.test(color);

  const onFile = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    const problem = await checkLogoFile(file);
    setLogoError(problem);
    if (problem) return;
    uploadLogo.mutate(file, {
      onSuccess: () => SucessMessage("Logótipo actualizado. Já aparece na barra lateral e nos novos documentos."),
      onError: (e) => setLogoError(getApiErrorMessage(e, "Não foi possível guardar o logótipo.")),
    });
  };

  const save = () =>
    saveStyle.mutate({ color: color.toUpperCase(), motto, website }, {
      onSuccess: () => SucessMessage("Identidade visual guardada."),
      onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar.")),
    });

  return (
    <div className="space-y-6">
      <TitleList title="Identidade Visual" suTitle="Logótipo, cor e lema aplicados à barra lateral, aos documentos PDF (declarações, boletins, pautas, recibos) e às folhas Excel." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card className="gap-0 py-4">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon name="Image" className="size-4" /></span>
              Logótipo
            </CardTitle>
            {branding.logoPath && <Badge variant="outline" className="text-[10px]">PNG 512 × 512</Badge>}
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            <div className="flex items-center gap-4">
              <div className="flex size-28 shrink-0 items-center justify-center rounded-xl border border-dashed bg-[repeating-conic-gradient(#f4f4f5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] p-2 dark:bg-zinc-900 dark:bg-none">
                {branding.logoPath ? <SchoolLogo path={branding.logoPath} name={branding.name} size={96} /> : <Icon name="ImagePlus" className="size-8 text-muted-foreground" />}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Requisitos</p>
                <p>Quadrado (proporção 1:1)</p>
                <p>Mínimo {LOGO_RULES.minSide} × {LOGO_RULES.minSide} px</p>
                <p>PNG, JPEG ou WebP · até 2 MB</p>
                <p>Fundo transparente recomendado</p>
              </div>
            </div>
            {logoError && (
              <div role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <Icon name="CircleAlert" className="mt-0.5 size-4 shrink-0" />
                <span>{logoError}</span>
              </div>
            )}
            <Can permission="school:update">
              <input ref={fileRef} type="file" accept={LOGO_RULES.mimes.join(",")} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploadLogo.isPending}>
                  <Icon name={uploadLogo.isPending ? "LoaderCircle" : "Upload"} className={uploadLogo.isPending ? "size-4 animate-spin" : "size-4"} />
                  {branding.logoPath ? "Substituir logótipo" : "Carregar logótipo"}
                </Button>
                {branding.logoPath && (
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => openModal("remove-school-logo")} disabled={removeLogo.isPending}>
                    <Icon name="Trash2" className="size-4" />Remover
                  </Button>
                )}
              </div>
            </Can>
          </CardContent>
        </Card>

        <Card className="gap-0 py-4">
          <CardHeader className="px-4 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon name="Palette" className="size-4" /></span>
              Cor e textos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Cor institucional</p>
              <div className="flex flex-wrap items-center gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    title={p.name}
                    aria-label={`${p.name} (${p.hex})`}
                    aria-pressed={color.toUpperCase() === p.hex}
                    disabled={!editable}
                    onClick={() => setColor(p.hex)}
                    className="flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:ring-2 aria-pressed:ring-foreground"
                    style={{ background: p.hex }}
                  >
                    {color.toUpperCase() === p.hex && <Icon name="Check" className="size-4" style={{ color: onColor(p.hex) }} />}
                  </button>
                ))}
                <label className="ml-1 flex items-center gap-2 rounded-md border px-2 py-1">
                  <input type="color" value={colorValid ? color : DEFAULT_BRAND_COLOR} onChange={(e) => setColor(e.target.value.toUpperCase())} disabled={!editable} className="size-6 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Escolher outra cor" />
                  <input value={color} onChange={(e) => setColor(e.target.value.trim())} disabled={!editable} maxLength={7} className="w-20 bg-transparent font-mono text-xs uppercase outline-none" aria-label="Código da cor (#RRGGBB)" />
                </label>
              </div>
              {!colorValid && <p className="text-xs text-destructive">Use o formato #RRGGBB (ex.: #1F3A5F).</p>}
              <p className="text-xs text-muted-foreground">Usada em detalhes (títulos, filetes, cabeçalho das tabelas). Cores muito claras são escurecidas automaticamente no texto para continuarem legíveis.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Lema (opcional)" startIcon="Quote" value={motto} maxLength={120} onChange={(e) => setMotto(e.target.value)} disabled={!editable} placeholder="Ex.: Educar com excelência" />
              <Input label="Website (opcional)" startIcon="Globe" value={website} maxLength={150} onChange={(e) => setWebsite(e.target.value)} disabled={!editable} placeholder="escola.ao" />
            </div>
            <Can permission="school:update">
              <div className="flex justify-end gap-2">
                {dirty && <Button size="sm" variant="ghost" onClick={() => { setColor(branding.color); setMotto(branding.motto); setWebsite(branding.website); }}>Repor</Button>}
                <Button size="sm" className="gap-2" onClick={save} disabled={!dirty || !colorValid || saveStyle.isPending}>
                  <Icon name={saveStyle.isPending ? "LoaderCircle" : "Save"} className={saveStyle.isPending ? "size-4 animate-spin" : "size-4"} />Guardar
                </Button>
              </div>
            </Can>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Pré-visualização</p>
        <DocumentPreview b={branding} color={color} motto={motto} website={website} />
        <p className="text-xs text-muted-foreground">Os documentos já emitidos mantêm o conteúdo; ao voltar a descarregá-los usam a identidade actual.</p>
      </div>

      <ConfirmModal
        id="remove-school-logo"
        title="Remover logótipo?"
        description="A barra lateral volta a mostrar o símbolo MindSchool e os novos documentos saem sem logótipo."
        confirmLabel="Remover"
        destructive
        isLoading={removeLogo.isPending}
        onConfirm={() =>
          removeLogo.mutateAsync().then(
            () => SucessMessage("Logótipo removido."),
            (e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível remover o logótipo.")); throw e; },
          )
        }
      />
    </div>
  );
}
