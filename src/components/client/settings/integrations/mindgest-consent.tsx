"use client";

import { useState, type MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Icon } from "@/components";
import { declineUrl, parseConsentParams } from "@/lib/mindgest-consent";
import { mindgestService } from "@/services/mindgest-service";
import { getApiErrorMessage } from "@/utils/api-error";

/**
 * Consentimento da ligação ao MindGest (janela aberta pelo MindGest). Mostra quem pede, o que passa a poder fazer e o que
 * nunca poderá, e só o titular da escola escolhida pode aceitar. O «Aceitar» exige um clique real (não um evento sintético).
 */
export function MindgestConsent() {
  const params = parseConsentParams(useSearchParams());
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const info = useQuery({ queryKey: ["mindgest-consent", params?.state], queryFn: () => mindgestService.consentInfo(params!), enabled: Boolean(params), retry: false });
  const accept = useMutation({
    mutationFn: () => mindgestService.authorize(schoolId!, params!),
    onSuccess: (r) => window.location.replace(r.redirect_to),
  });

  if (!params) {
    return <Notice title="Pedido incompleto" text="Esta página abre-se a partir do MindGest (Configurações › Plugins › MindSchool › Conectar). Volte ao MindGest e repita." />;
  }
  if (info.isLoading) return <p className="text-sm text-muted-foreground">A verificar o pedido…</p>;
  if (info.isError || !info.data) {
    return <Notice title="Pedido não reconhecido" text={getApiErrorMessage(info.error, "O endereço de retorno ou o cliente não estão registados no MindSchool. Não foi feita nenhuma ligação.")} />;
  }

  const { client, schools } = info.data;
  const free = schools.filter((s) => !s.already_connected);
  const selected = schools.find((s) => s.id === schoolId);
  const onAccept = (e: MouseEvent<HTMLButtonElement>) => {
    if (!e.isTrusted || !schoolId) return;
    accept.mutate();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="Link" className="size-5 text-primary" />Ligar a escola ao MindGest
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          O <strong className="text-foreground">{client.name}</strong> ({client.redirect_origin.replace(/^https?:\/\//, "")}) pede para emitir as faturas da sua escola.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {schools.length === 0 ? (
          <p className="rounded-md border border-warning-border bg-warning-muted p-3">
            Só o <strong>titular</strong> da escola pode autorizar esta ligação, e a sua conta não é titular de nenhuma escola. Peça ao titular para a fazer.
          </p>
        ) : (
          <>
            <fieldset className="space-y-2">
              <legend className="mb-1 font-medium">Escolha a escola</legend>
              {schools.map((s) => (
                <label key={s.id} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${s.already_connected ? "opacity-60" : "hover:bg-muted"}`}>
                  <input type="radio" name="school" className="mt-1" disabled={s.already_connected} checked={schoolId === s.id} onChange={() => setSchoolId(s.id)} />
                  <span>
                    <span className="font-medium">{s.name}</span> <span className="text-xs text-muted-foreground">NIF {s.nif}</span>
                    {s.already_connected && <Badge variant="secondary" className="ml-2">Já ligada a {s.connected_company ?? "uma empresa"}</Badge>}
                  </span>
                </label>
              ))}
              {free.length === 0 && <p className="text-xs text-muted-foreground">Todas as suas escolas já estão ligadas. Para ligar outra empresa, desligue primeiro em Definições › Integrações.</p>}
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-muted/50 p-3">
                <p className="mb-1 font-medium">O MindGest poderá</p>
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  <li>Receber o catálogo de emolumentos da escola.</li>
                  <li>Emitir faturas-recibo quando a secretaria marcar um pagamento.</li>
                  <li>Consultar essas faturas e o seu estado.</li>
                </ul>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="mb-1 font-medium">O MindGest não poderá</p>
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  <li>Ver alunos, notas ou dados pessoais.</li>
                  <li>Registar pagamentos nem alterar cobranças.</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              A empresa e a loja que emitem as faturas são as da conta do MindGest que iniciou o pedido; aparecem em Definições › Integrações assim que a ligação terminar.
              Pode desligar a qualquer momento.
            </p>

            {accept.isError && <p className="text-xs text-destructive">{getApiErrorMessage(accept.error, "Não foi possível autorizar a ligação.")}</p>}
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" disabled={accept.isPending} onClick={() => window.location.replace(declineUrl(params))}>Recusar</Button>
              <Button type="button" disabled={!selected || accept.isPending} onClick={onAccept}>
                {accept.isPending ? "A autorizar…" : "Aceitar e ligar"}
              </Button>
            </div>
          </>
        )}
        {schools.length === 0 && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => window.location.replace(declineUrl(params))}>Voltar ao MindGest</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}
