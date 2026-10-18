"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Button, Card, CardContent, CardHeader, CardTitle, Icon, Input, TitleList } from "@/components";
import { useSchoolProfile } from "@/hooks/school/use-school-profile";
import { patchSettings } from "@/services/school-settings-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { cn } from "@/lib/utils";

type Identity = "estado" | "escola";

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const OPTIONS: Array<{ value: Identity; title: string; text: string }> = [
  { value: "estado", title: "Informações do Estado", text: "Insígnia nacional e linhas oficiais (República de Angola, Ministério da Educação) no topo de cada documento." },
  { value: "escola", title: "Informações da escola", text: "Logo e nome da escola no topo, sem as linhas do Estado. Sem logo, usa-se a insígnia nacional." },
];

/** Aspecto dos PDF emitidos (declarações, boletins, certificados, diplomas e relatórios): quem assina o cabeçalho, logo e cor da escola. */
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
    mutationFn: () => patchSettings({ branding: { document_identity: identity, primary_color: color || null, logo_url: logo.trim() || null } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["school", schoolId] }),
  });

  const submit = () =>
    save.mutateAsync()
      .then(() => SucessMessage("Aspecto dos documentos atualizado."))
      .catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar o aspecto dos documentos.")));

  return (
    <div className="space-y-4">
      <TitleList title="Aspecto dos documentos" suTitle="Como os PDF emitidos pela escola se apresentam: cabeçalho, logo e cor." />
      <Card className="gap-0 py-4">
        <CardHeader className="px-4 pb-3"><CardTitle className="flex items-center gap-2 text-base font-semibold"><Icon name="FileText" className="size-4 text-primary" />Cabeçalho dos PDF</CardTitle></CardHeader>
        <CardContent className="space-y-5 px-4">
          <div role="radiogroup" aria-label="Informações usadas no cabeçalho" className="grid gap-3 sm:grid-cols-2">
            {OPTIONS.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={identity === o.value} onClick={() => setIdentity(o.value)}
                className={cn("rounded-lg border p-3 text-left transition-colors", identity === o.value ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                <span className="block text-sm font-semibold">{o.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{o.text}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="doc-color" className="text-sm font-medium">Cor da escola</label>
              <div className="flex items-center gap-2">
                <input id="doc-color" type="color" aria-label="Escolher cor" value={HEX.test(color) && color.length === 7 ? color : "#000000"} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded border bg-transparent p-1" />
                <div className="min-w-0 flex-1"><Input aria-label="Cor em hexadecimal" placeholder="#1d4ed8" value={color} onChange={(e) => setColor(e.target.value)} /></div>
                {color && <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={() => setColor("")}>Limpar</Button>}
              </div>
              <p className={cn("text-xs", colorValid ? "text-muted-foreground" : "text-destructive")}>{colorValid ? "Usada em molduras, títulos e cabeçalhos de tabela. Sem cor, os documentos ficam a preto e branco." : "Use um valor hexadecimal, por exemplo #1d4ed8."}</p>
            </div>
            <div className="space-y-1.5">
              <Input label="Logo da escola (endereço da imagem)" startIcon="Image" placeholder="https://..." value={logo} onChange={(e) => setLogo(e.target.value)} />
              <p className="text-xs text-muted-foreground">PNG ou JPG. Usado no modo «Informações da escola»; sem logo (ou se não abrir), aparece a insígnia nacional.</p>
            </div>
          </div>

          <Can permission="school:update">
            <Button type="button" onClick={submit} disabled={!colorValid || save.isPending}>{save.isPending ? "A guardar…" : "Guardar aspecto"}</Button>
          </Can>
        </CardContent>
      </Card>
    </div>
  );
}
