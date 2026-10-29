"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, ConfirmModal, GenericTable, Icon, Separator, type Column } from "@/components";
import { mindgestService, type ApiMindgestDiscrepancy, type ApiMindgestStatus } from "@/services/mindgest-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const PAUSE = "mindgest-pause";
const ROTATE = "mindgest-rotate";
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "ainda não");

const DISCREPANCY: Record<ApiMindgestDiscrepancy["kind"], string> = {
  sem_liquidacao_local: "Documento no MindGest sem pagamento correspondente",
  estado_diferente: "Estado diferente entre o MindGest e o MindSchool",
  origem_desconhecida: "Nota de crédito sem fatura-recibo de origem",
};

function lagText(seconds: number | null): string {
  if (seconds === null) return "ainda não sincronizou";
  if (seconds < 90) return "há instantes";
  if (seconds < 5400) return `há ${Math.round(seconds / 60)} min`;
  return `há ${Math.round(seconds / 3600)} h`;
}

/**
 * Operação da ligação (Definições › Integrações › MindGest): sincronização e divergências, pausa de emissão e rotação do
 * segredo do webhook. O titular é o único que chega aqui.
 */
export function MindgestOperations({ s, onChange }: { s: ApiMindgestStatus; onChange: () => void }) {
  const { openModal } = useModal();
  const queryClient = useQueryClient();
  const [secret, setSecret] = useState<{ value: string; until: string } | null>(null);
  const refresh = () => { onChange(); void queryClient.invalidateQueries({ queryKey: ["fiscal-documents"] }); };
  const fail = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));

  const sync = useMutation({
    mutationFn: mindgestService.reconcile,
    onSuccess: (r) => {
      if (r.ok) SucessMessage(r.applied > 0 ? `Sincronizado: ${r.applied} documento(s) atualizado(s).` : "Sincronizado: está tudo em dia.");
      else ErrorMessage("Não foi possível sincronizar com o MindGest. Teste a ligação e tente de novo.");
      refresh();
    },
    onError: fail,
  });
  const pause = useMutation({ mutationFn: mindgestService.pause, onSuccess: () => { SucessMessage("Emissões em pausa. Os pagamentos continuam a registar-se."); refresh(); }, onError: fail });
  const resume = useMutation({ mutationFn: mindgestService.resume, onSuccess: () => { SucessMessage("Emissões reativadas: as faturas em espera vão seguir."); refresh(); }, onError: fail });
  const rotate = useMutation({
    mutationFn: mindgestService.rotateSecret,
    onSuccess: (r) => { setSecret({ value: r.webhook_secret, until: r.previous_valid_until }); refresh(); },
    onError: fail,
  });

  const r = s.reconciliation;
  const failing = r.consecutive_failures >= 3;

  const discrepancyColumns: Column<ApiMindgestDiscrepancy>[] = [
    {
      key: "kind",
      header: "Divergência",
      render: (_, d) => <span className="font-medium text-xs">{DISCREPANCY[d.kind]}</span>,
    },
    {
      key: "detail",
      header: "Detalhe",
      render: (_, d) => <span className="text-xs text-muted-foreground">{d.detail}</span>,
    },
    {
      key: "detected_at",
      header: "Detectada em",
      render: (_, d) => <span className="font-mono text-xs text-muted-foreground">{when(d.detected_at)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="RefreshCcw" className="size-4 text-primary" />Sincronização com o MindGest
          </h3>
          <Badge variant={failing ? "destructive" : r.discrepancies.length > 0 ? "warning" : "success"}>
            {failing ? "A falhar" : r.discrepancies.length > 0 ? `${r.discrepancies.length} divergência(s)` : "Em dia"}
          </Badge>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            O MindSchool confere sozinho, de poucos em poucos minutos, o estado das faturas no MindGest (cobre avisos perdidos, importa notas de crédito e volta a tentar
            faturas presas). Última sincronização: <strong className="text-foreground">{lagText(r.lag_seconds)}</strong> ({when(r.last_at)}).
          </p>
          {failing && (
            <p className="text-xs text-destructive">
              A sincronização falhou {r.consecutive_failures} vezes seguidas. Os pagamentos continuam a registar-se, mas o estado das faturas pode estar desatualizado.
              Use «Testar ligação»; se persistir, desligue e volte a ligar a partir do MindGest.
            </p>
          )}
          {r.discrepancies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Divergências por rever</p>
              <GenericTable<ApiMindgestDiscrepancy> data={r.discrepancies} columns={discrepancyColumns} />
              <p className="text-[11px] text-muted-foreground">Fecham-se sozinhas quando o MindGest e o MindSchool voltam a coincidir. Correções de faturas fazem-se no MindGest.</p>
            </div>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" disabled={sync.isPending} onClick={() => sync.mutate()}>
            <Icon name="RefreshCcw" className={sync.isPending ? "size-4 animate-spin" : "size-4"} />Sincronizar agora
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="ShieldAlert" className="size-4 text-primary" />Emissão de faturas
          </h3>
          <Badge variant={s.paused ? "warning" : "success"}>{s.paused ? "Em pausa" : "Ativa"}</Badge>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {s.paused
              ? `As emissões estão em pausa desde ${when(s.paused_at)}. A ligação mantém-se e os pagamentos continuam a registar-se; as faturas-recibo ficam em espera e seguem ao reativar. Atenção ao prazo legal de emissão (5.º dia útil após o pagamento).`
              : "Em caso de dúvida (imposto mal definido, empresa errada), pode suspender as emissões sem desligar a escola: nada é enviado ao MindGest até reativar."}
          </p>
          {s.paused ? (
            <Button size="sm" className="gap-1.5" disabled={resume.isPending} onClick={() => resume.mutate()}><Icon name="Play" className="size-4" />Reativar emissões</Button>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5" disabled={pause.isPending} onClick={() => openModal(PAUSE)}><Icon name="Pause" className="size-4" />Pausar emissões</Button>
          )}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="KeyRound" className="size-4 text-primary" />Segredo do webhook
        </h3>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            O segredo assina os avisos que o MindGest envia ao MindSchool. Pode roda-lo se suspeitar que foi exposto: o segredo anterior continua a valer durante 24 horas,
            para não se perder nenhum aviso enquanto o MindGest passa a usar o novo.
          </p>
          {s.secret_rotation && <p className="text-xs text-amber-700">Rotação em curso: o segredo anterior ainda é aceite até {when(s.secret_rotation.previous_valid_until)}.</p>}
          {secret && (
            <div className="space-y-2 rounded-xs border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="text-xs font-medium text-amber-900">Novo segredo (só é mostrado agora; guarde-o num local seguro):</p>
              <code className="block break-all rounded bg-background px-2 py-1 text-xs">{secret.value}</code>
              <p className="text-[11px] text-amber-900">O segredo anterior vale até {when(secret.until)}. O MindGest tem de passar a assinar com o novo antes dessa hora.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard?.writeText(secret.value); SucessMessage("Segredo copiado."); }}>Copiar</Button>
                <Button size="sm" variant="ghost" onClick={() => setSecret(null)}>Já guardei</Button>
              </div>
            </div>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" disabled={rotate.isPending} onClick={() => openModal(ROTATE)}><Icon name="RefreshCw" className="size-4" />Rodar segredo</Button>
        </div>
      </section>

      <ConfirmModal
        id={PAUSE}
        title="Pausar as emissões"
        description="Nenhuma fatura-recibo será enviada ao MindGest até reativar. Os pagamentos continuam a registar-se e as faturas ficam em espera. Lembre-se de que a fatura tem prazo legal de emissão."
        confirmLabel="Pausar"
        onConfirm={() => pause.mutateAsync()}
      />
      <ConfirmModal
        id={ROTATE}
        title="Rodar o segredo do webhook"
        description="Será gerado um novo segredo, mostrado uma só vez. O anterior continua a valer durante 24 horas."
        confirmLabel="Rodar segredo"
        onConfirm={() => rotate.mutateAsync()}
      />
    </div>
  );
}
