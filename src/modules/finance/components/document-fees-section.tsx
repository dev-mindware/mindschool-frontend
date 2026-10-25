"use client";
import { financeKeys } from "@/modules/finance/query-keys";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, FeatureGate, FormModal, Icon, Input } from "@/components";
import { documentFeesService } from "@/modules/finance/services/document-fees-service";
import { REQUEST_TYPE_LABEL, type RequestType } from "@/services/secretary-requests-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";

const MODAL = "document-fees";
const TYPES = Object.keys(REQUEST_TYPE_LABEL) as RequestType[];

/** Taxas dos documentos pedidos no portal: com valor > 0, o pedido gera uma fatura automática que o encarregado tem de pagar. */
export function DocumentFeesSection() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const { data: fees = {} } = useQuery({ queryKey: financeKeys.documentFees(schoolId), queryFn: documentFeesService.read, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const save = useMutation({ mutationFn: documentFeesService.save, onSuccess: () => queryClient.invalidateQueries({ queryKey: financeKeys.documentFees(schoolId) }) });
  const [draft, setDraft] = useState<Record<RequestType, string>>({} as Record<RequestType, string>);

  const edit = () => { setDraft(Object.fromEntries(TYPES.map((t) => [t, String(Number(fees[t] ?? 0))])) as Record<RequestType, string>); openModal(MODAL); };
  const valid = TYPES.every((t) => Number(draft[t] ?? 0) >= 0 && Number.isFinite(Number(draft[t] ?? 0)));

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">Taxas de documentos</h3>
          <p className="text-xs text-muted-foreground">Valor cobrado quando o encarregado ou o aluno pede o documento no portal. Sem valor, o pedido é gratuito. O documento só segue para a secretaria depois de pago.</p>
        </div>
        <FeatureGate permission="school:update" fallback="disabled" tooltipMessage="Apenas a direção geral pode alterar as taxas.">
          <Button size="sm" variant="outline" className="gap-2" onClick={edit}><Icon name="Pencil" className="size-4" />Editar taxas</Button>
        </FeatureGate>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 @5xl/main:grid-cols-3">
        {TYPES.map((t) => {
          const v = Number(fees[t] ?? 0);
          return (
            <div key={t} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
              <span>{REQUEST_TYPE_LABEL[t]}</span>
              {v > 0 ? <span className="font-semibold tabular-nums">{formatCurrency(v)}</span> : <Badge variant="secondary" className="font-normal">Gratuito</Badge>}
            </div>
          );
        })}
      </div>

      <FormModal id={MODAL} title="Taxas de documentos" description="Deixe 0 para os documentos gratuitos." submitLabel="Guardar" isLoading={save.isPending} disabled={!valid}
        onSubmit={() => save.mutateAsync(Object.fromEntries(TYPES.map((t) => [t, Number(draft[t] ?? 0)])) as Record<RequestType, number>).then(() => { SucessMessage("Taxas atualizadas."); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar.")); throw e; })}>
        {TYPES.map((t) => (
          <div key={t} className="sm:col-span-2"><Input label={`${REQUEST_TYPE_LABEL[t]} (Kz)`} type="number" min={0} value={draft[t] ?? ""} onChange={(e) => setDraft((d) => ({ ...d, [t]: e.target.value }))} /></div>
        ))}
      </FormModal>
    </section>
  );
}
