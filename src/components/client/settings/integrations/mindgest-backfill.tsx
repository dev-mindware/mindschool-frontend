"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardContent, CardHeader, CardTitle, ConfirmModal, Icon, Input } from "@/components";
import { mindgestService, type ApiBackfillPreview } from "@/services/mindgest-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const CONFIRM = "mindgest-backfill";
const money = (v: string) => `${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 2 })} Kz`;
const fmt = (iso: string) => iso.split("-").reverse().join("/");

/**
 * «Emitir faturas em atraso» (só o titular): os pagamentos anteriores à ligação nunca são faturados sozinhos. Escolhe-se
 * um intervalo, vê-se a pré-visualização e confirma-se; as faturas seguem ao ritmo da fila.
 */
export function MindgestBackfill() {
  const { openModal } = useModal();
  const queryClient = useQueryClient();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preview, setPreview] = useState<ApiBackfillPreview | null>(null);
  const fail = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));
  const reset = () => setPreview(null);

  const look = useMutation({ mutationFn: () => mindgestService.backfillPreview(from, to), onSuccess: setPreview, onError: (e) => { reset(); fail(e); } });
  const run = useMutation({
    mutationFn: () => mindgestService.backfillRun(from, to, preview?.payments ?? 0),
    onSuccess: (r) => {
      SucessMessage(`${r.created} factura(s) em fila para emissão${r.remaining > 0 ? `; faltam ${r.remaining} (repita a operação)` : ""}.`);
      reset();
      void queryClient.invalidateQueries({ queryKey: ["fiscal-documents"] });
    },
    onError: fail,
  });

  const range = Boolean(from && to);
  const blocked = preview?.integration === "sem_ligacao";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="History" className="size-4 text-primary" />Emitir faturas em atraso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Ligar a escola ao MindGest <strong className="text-foreground">não emite faturas</strong> dos pagamentos anteriores. Se precisar de as emitir, escolha o intervalo de datas dos pagamentos.
          Verá primeiro o resumo e só depois confirma. Cada pagamento gera uma fatura-recibo (repetir a operação não duplica nada).
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-xs">
            <span className="font-medium">Pagamentos desde</span>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); reset(); }} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">até</span>
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); reset(); }} />
          </label>
          <Button size="sm" variant="outline" disabled={!range || look.isPending} onClick={() => look.mutate()}>Pré-visualizar</Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Máximo de 12 meses por intervalo e 500 faturas por execução.</p>

        {preview && (
          <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-xs">
            {preview.payments === 0 ? (
              <p>Não há pagamentos sem fatura entre {fmt(preview.from)} e {fmt(preview.to)}.</p>
            ) : (
              <>
                <p>
                  <strong>{preview.payments}</strong> pagamento(s) sem fatura entre {fmt(preview.from)} e {fmt(preview.to)}, no total de <strong>{money(preview.total)}</strong>.
                  {preview.without_nif > 0 && ` ${preview.without_nif} ficariam como «consumidor final» (sem NIF do encarregado nem do aluno).`}
                </p>
                {preview.remaining > 0 && <p className="text-amber-700">Só {preview.will_issue} entram nesta execução (limite de {preview.limits.max_documents}); repita a operação para o resto.</p>}
                {preview.integration === "sem_catalogo" && <p className="text-amber-700">O catálogo do MindGest está incompleto: as faturas ficam em espera até haver impostos definidos.</p>}
                {preview.integration === "pausada" && <p className="text-amber-700">As emissões estão em pausa: as faturas ficam em espera até reativar.</p>}
                {blocked && <p className="text-destructive">A escola não está ligada ao MindGest.</p>}
                <p className="text-muted-foreground">Os pagamentos antigos já passaram o prazo legal de emissão; o MindGest decide a data da fatura.</p>
                <Button size="sm" disabled={blocked || run.isPending} onClick={() => openModal(CONFIRM)}>Emitir {preview.will_issue} factura(s)</Button>
              </>
            )}
          </div>
        )}
      </CardContent>
      <ConfirmModal
        id={CONFIRM}
        title="Emitir faturas em atraso"
        description={preview ? `Vão ser pedidas ${preview.will_issue} factura(s)-recibo ao MindGest (${money(preview.total)} no intervalo). A operação fica registada na auditoria e não se pode desfazer aqui: correcções fazem-se no MindGest com notas de crédito.` : ""}
        confirmLabel="Emitir"
        onConfirm={() => run.mutateAsync()}
      />
    </Card>
  );
}
