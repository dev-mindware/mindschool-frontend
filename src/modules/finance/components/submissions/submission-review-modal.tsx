"use client";

import { useCan } from "@/hooks/auth/use-can";
import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Button, FormTextarea, Icon, Input } from "@/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTuitionSubmissions } from "@/modules/finance/hooks/use-tuition-payments";
import { tuitionPaymentsService, type ApiSubmission } from "@/modules/finance/services/tuition-payments-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";
import { METHOD_LABEL, OPEN_SUBMISSION, SubmissionBadge } from "./submission-status";

export const SUBMISSION_REVIEW_MODAL = "submission-review";

/** Revisão do comprovativo: pré-visualização do ficheiro, conferência do valor e decisão (aprovar / pedir novo / rejeitar). */
export function SubmissionReviewModal({ submission }: { submission: ApiSubmission | null }) {
  const { review, start } = useTuitionSubmissions();
  const { can } = useCan();
  const { open, closeModal } = useModal();
  const [confirmed, setConfirmed] = useState("");
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<{ url: string; mime: string } | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const id = submission?.id;

  // Carrega o ficheiro (autenticado) e mostra-o; o URL é libertado ao fechar.
  useEffect(() => {
    if (!id) return;
    let url: string | null = null;
    let cancelled = false;
    setPreview(null);
    setPreviewError(false);
    setReason("");
    tuitionPaymentsService.proofBlob(id)
      .then((b) => { if (!cancelled) { url = URL.createObjectURL(b); setPreview({ url, mime: b.type }); } })
      .catch(() => { if (!cancelled) setPreviewError(true); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [id]);

  useEffect(() => { setConfirmed(submission?.total_amount ?? ""); }, [submission?.id, submission?.total_amount]);

  if (!submission) return null;
  const s = submission;
  const actionable = (s.status === "submetido" || s.status === "em_analise") && can("tuition_submission:review");
  const partial = confirmed !== "" && Number(confirmed) < Number(s.total_amount);
  const invalid = !confirmed || Number(confirmed) <= 0 || Number(confirmed) > Number(s.total_amount);
  const busy = review.isPending || start.isPending;

  const decide = (decision: "approved" | "rejected" | "replacement_required") =>
    review.mutateAsync({ id: s.id, decision, ...(decision === "approved" ? (partial ? { confirmedAmount: Number(confirmed).toFixed(2) } : {}) : { reason: reason.trim() }) })
      .then(() => { SucessMessage(decision === "approved" ? "Pagamento confirmado. A família foi avisada por email." : decision === "rejected" ? "Comprovativo rejeitado." : "Novo comprovativo pedido."); closeModal(SUBMISSION_REVIEW_MODAL); })
      .catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a decisão.")));

  return (
    <Sheet open={Boolean(open[SUBMISSION_REVIEW_MODAL])} onOpenChange={(next) => !next && closeModal(SUBMISSION_REVIEW_MODAL)}>
      <SheetContent className="w-full sm:max-w-4xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <Icon name="FileCheck" className="size-5" />
            {`Comprovativo ${s.protocol}`}
          </SheetTitle>
          <SheetDescription className="text-xs">{`${s.student.full_name} · enviado por ${s.submitted_by.full_name}`}</SheetDescription>
          <div><SubmissionBadge status={s.status} /></div>
        </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="min-h-[320px] overflow-hidden rounded-lg border bg-muted/30">
          {previewError && <p className="p-6 text-center text-sm text-muted-foreground">Não foi possível carregar o ficheiro.</p>}
          {!preview && !previewError && <p className="p-6 text-center text-sm text-muted-foreground">A carregar comprovativo…</p>}
          {preview && (preview.mime.startsWith("image/")
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={preview.url} alt="Comprovativo" className="max-h-[460px] w-full object-contain" />
            : <iframe src={preview.url} title="Comprovativo" className="h-[460px] w-full" />)}
        </div>

        <div className="space-y-4 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg border p-3">
            <dt className="text-muted-foreground">Valor declarado</dt><dd className="text-right font-semibold">{formatCurrency(Number(s.total_amount))}</dd>
            <dt className="text-muted-foreground">Método</dt><dd className="text-right">{METHOD_LABEL[s.method]}</dd>
            <dt className="text-muted-foreground">Data do pagamento</dt><dd className="text-right">{s.paid_on}</dd>
            <dt className="text-muted-foreground">Referência</dt><dd className="text-right font-mono text-xs">{s.reference ?? "—"}</dd>
            <dt className="text-muted-foreground">Ordenante</dt><dd className="text-right">{s.payer_name ?? "—"}</dd>
            <dt className="text-muted-foreground">Conta de destino</dt><dd className="text-right">{s.bank_account?.bank_name ?? "—"}</dd>
          </dl>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Facturas a liquidar</p>
            <ul className="divide-y rounded-lg border">
              {s.items.map((i) => (
                <li key={i.invoice_id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <span>{i.description}<span className="block text-xs text-muted-foreground">vence {i.due_date}</span></span>
                  <span className="font-medium tabular-nums">{formatCurrency(Number(i.amount))}</span>
                </li>
              ))}
            </ul>
          </div>

          {s.notes && <p className="rounded-lg bg-muted/40 p-3 text-xs"><span className="font-medium">Nota da família: </span>{s.notes}</p>}

          {actionable ? (
            <div className="space-y-3">
              {s.status === "submetido" && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => start.mutateAsync(s.id).catch((e) => ErrorMessage(getApiErrorMessage(e, "Falhou.")))}>Marcar como em análise</Button>}
              <Input label="Valor confirmado (Kz)" type="number" value={confirmed} onChange={(e) => setConfirmed(e.target.value)} error={invalid ? "Entre 0 e o valor declarado" : undefined} />
              {partial && <p className="text-xs text-amber-700">Pagamento parcial: o restante continua em dívida e a família é informada do valor confirmado.</p>}
              <FormTextarea label="Motivo (obrigatório para rejeitar ou pedir novo comprovativo)" value={reason} onChange={setReason} rows={2} />
              <p className="text-xs text-muted-foreground">Confira o valor, a data e a referência no extracto bancário antes de aprovar. Só a aprovação regista o pagamento nas facturas.</p>
            </div>
          ) : (
            s.review_reason && <p className="rounded-lg bg-muted/40 p-3 text-xs"><span className="font-medium">Decisão: </span>{s.review_reason}</p>
          )}
          {!OPEN_SUBMISSION.includes(s.status) && s.confirmed_amount && <p className="text-xs text-muted-foreground">Valor confirmado: {formatCurrency(Number(s.confirmed_amount))}{s.reviewed_by ? ` · por ${s.reviewed_by.full_name}` : ""}</p>}
        </div>
      </div>
      </div>

        <SheetFooter>
          {actionable ? (
            <>
              <Button type="button" variant="outline" disabled={busy || reason.trim().length < 5} onClick={() => decide("replacement_required")}>Pedir novo comprovativo</Button>
              <Button type="button" variant="destructive" disabled={busy || reason.trim().length < 5} onClick={() => decide("rejected")}>Rejeitar</Button>
              <Button type="button" disabled={busy || invalid} onClick={() => decide("approved")} className="gap-2">
                {busy && <Icon className="animate-spin" name="LoaderCircle" />}
                {partial ? "Aprovar valor parcial" : "Aprovar pagamento"}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => closeModal(SUBMISSION_REVIEW_MODAL)}>Fechar</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
