"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, ConfirmModal, GenericTable, Icon, Separator, type Column } from "@/components";
import { mindgestService, type ApiMindgestStatus } from "@/services/mindgest-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { MindgestBackfill } from "./mindgest-backfill";
import { MindgestOperations } from "./mindgest-operations";

const DISCONNECT = "mindgest-disconnect";
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "ainda não");
const money = (v: string | null) => (v ? `${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 2 })} Kz` : "—");

const ERRORS: Record<string, string> = {
  connection_revoked: "O MindGest recusou a credencial desta ligação (pode ter sido desligada lá). Desligue e ligue de novo a partir do MindGest.",
  unreachable: "Não foi possível contactar o MindGest. Tente de novo dentro de instantes.",
};
const errorText = (e: string) => ERRORS[e] ?? `O MindGest respondeu com um erro (${e}).`;

type CatalogueRow = ApiMindgestStatus["catalogue"]["items"][number] & { id: string };

/** Definições › Integrações › MindGest (só o titular): estado da ligação de faturação, catálogo de emolumentos, testar e desligar. */
export function MindgestSettings() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const key = ["mindgest", schoolId];
  const status = useQuery({ queryKey: key, queryFn: mindgestService.status, enabled: Boolean(schoolId), retry: false });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });
  const fail = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));

  const test = useMutation({
    mutationFn: mindgestService.test,
    onSuccess: (r) => { if (r.ok) SucessMessage("Ligação ao MindGest a funcionar."); else ErrorMessage(errorText(r.error ?? "unreachable")); void refresh(); },
    onError: fail,
  });
  const sync = useMutation({ mutationFn: mindgestService.syncCatalogue, onSuccess: () => { SucessMessage("Catálogo enviado ao MindGest."); void refresh(); }, onError: fail });
  const disconnect = useMutation({ mutationFn: mindgestService.disconnect, onSuccess: () => { SucessMessage("Ligação ao MindGest desfeita."); void refresh(); }, onError: fail });

  if (status.isLoading) return <p className="text-sm text-muted-foreground">A carregar…</p>;
  if (status.isError || !status.data) return <p className="text-sm text-destructive">Não foi possível carregar o estado da integração com o MindGest. Só o titular da escola a pode gerir.</p>;

  const s = status.data;
  const connected = s.status === "active";
  const badge = !connected ? { label: "Não ligado", variant: "secondary" as const } : s.paused ? { label: "Emissões em pausa", variant: "warning" as const } : s.setup === "ready" ? { label: "Ligado", variant: "success" as const } : { label: "Configuração incompleta", variant: "warning" as const };

  const catalogueRows: CatalogueRow[] = s.catalogue.items.map((i) => ({ ...i, id: i.service_ref }));
  const catalogueColumns: Column<CatalogueRow>[] = [
    {
      key: "name",
      header: "Serviço / Emolumento",
      render: (_, i) => <span className="font-medium text-xs">{i.name}</span>,
    },
    {
      key: "reference_price",
      header: "Valor de Referência",
      render: (_, i) => <span className="text-xs text-muted-foreground">{money(i.reference_price)}</span>,
    },
    {
      key: "state",
      header: "Estado Fiscal",
      render: (_, i) => (
        <Badge variant={i.state === "pronto" ? "success" : "warning"}>
          {i.state === "pronto" ? "Pronto" : "Falta definir o imposto"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="ReceiptText" className="size-4 text-primary" />MindGest — faturação
          </h3>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <div className="space-y-3 text-sm">
          {connected ? (
            <>
              <p className="text-muted-foreground">
                As faturas desta escola são emitidas no MindGest pela empresa <strong className="text-foreground">{s.company?.name}</strong> (NIF {s.company?.nif}), loja «{s.store?.name}».
                Ligada em {when(s.connected_at)}. Última comunicação com sucesso: {when(s.last_ok_at)}.
              </p>
              {s.last_error && <p className="text-xs text-destructive">Último erro: {errorText(s.last_error)}</p>}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" disabled={test.isPending} onClick={() => test.mutate()}>
                  <Icon name="Activity" className="size-4" />Testar ligação
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" disabled={sync.isPending} onClick={() => sync.mutate()}>
                  <Icon name="RefreshCcw" className="size-4" />Reenviar catálogo
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" disabled={disconnect.isPending} onClick={() => openModal(DISCONNECT)}>Desligar</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                A escola ainda não está ligada ao MindGest. A ligação começa no MindGest: em <strong className="text-foreground">Configurações › Plugins</strong> escolha
                MindSchool e clique em <strong className="text-foreground">Conectar</strong>. Abre-se uma janela aqui, no MindSchool, onde o titular confirma.
              </p>
              <p className="text-xs text-muted-foreground">
                Enquanto não estiver ligada, a escola continua a funcionar normalmente; as faturas ficam em espera até haver ligação.
                {s.status === "pending" && " Há uma ligação iniciada que ainda não foi concluída no MindGest."}
                {s.status === "revoked" && " A ligação anterior foi desfeita."}
              </p>
            </>
          )}
        </div>
      </section>

      {connected && (
        <>
          <Separator />
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Catálogo de emolumentos</h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Cada tipo de cobrança é enviado ao MindGest como um serviço. O <strong className="text-foreground">imposto de cada serviço define-se no MindGest</strong> (Configurações › Plugins › MindSchool › Serviços),
                por quem gere a empresa. Enquanto faltar algum, as faturas desses serviços ficam em espera; os pagamentos continuam a ser registados.
              </p>
              {catalogueRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">Catálogo ainda não enviado. Use «Reenviar catálogo».</p>
              ) : (
                <GenericTable<CatalogueRow> data={catalogueRows} columns={catalogueColumns} />
              )}
              <p className="text-xs text-muted-foreground">Catálogo enviado em {when(s.catalogue.synced_at)}.</p>
            </div>
          </section>
        </>
      )}

      {connected && (
        <>
          <Separator />
          <MindgestOperations s={s} onChange={() => void refresh()} />
        </>
      )}
      {connected && (
        <>
          <Separator />
          <MindgestBackfill />
        </>
      )}

      <ConfirmModal
        id={DISCONNECT}
        title="Desligar do MindGest"
        description="A escola deixa de emitir faturas pelo MindGest e a credencial desta ligação é apagada aqui. As faturas já emitidas ficam no MindGest. Pode voltar a ligar a partir do MindGest."
        destructive
        confirmLabel="Desligar"
        onConfirm={() => disconnect.mutateAsync()}
      />
    </div>
  );
}
