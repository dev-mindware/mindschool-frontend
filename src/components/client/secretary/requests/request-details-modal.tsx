"use client";
import { formatDateTime, formatNumber } from "@/utils";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Button, FormModal, FormTextarea, Icon, Input, StatusBadge, type StatusStyle } from "@/components";
import { useSecretaryRequest, useSecretaryRequests } from "@/hooks/school/use-secretary-requests";
import { useCertificates, openDocumentPdf } from "@/hooks/school/use-certificates";
import { useGradeTerms } from "@/hooks/school/use-grades";
import { type OfficialDocumentType } from "@/types/certificate";
import { REQUEST_STATUS_LABEL, REQUEST_TYPE_LABEL, type ApiRequest, type RequestStatus } from "@/services/secretary-requests-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const EVENT_LABEL: Record<string, string> = { criado: "Pedido aberto", atribuido: "Atribuído", estado: "Estado alterado", comentario: "Mensagem", pagamento: "Pagamento confirmado", aberto: "Pedido aberto" };
const REQUEST_STATUS_STYLE: Record<RequestStatus, StatusStyle> = {
  aberto: { label: REQUEST_STATUS_LABEL.aberto, variant: "info" },
  aguarda_pagamento: { label: REQUEST_STATUS_LABEL.aguarda_pagamento, variant: "secondary" },
  em_analise: { label: REQUEST_STATUS_LABEL.em_analise, variant: "warning" },
  concluido: { label: REQUEST_STATUS_LABEL.concluido, variant: "success" },
  rejeitado: { label: REQUEST_STATUS_LABEL.rejeitado, variant: "destructive" },
  cancelado: { label: REQUEST_STATUS_LABEL.cancelado, variant: "outline" },
};

const REQUEST_TYPE_TO_OFFICIAL_DOC: Record<string, OfficialDocumentType | undefined> = {
  declaracao_matricula: "DECLARATION_ENROLLMENT",
  declaracao_notas: "DECLARATION_WITH_GRADES",
  certificado: "HABILITATION_CERTIFICATE",
  transferencia: "TRANSFER_GUIDE",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <StatusBadge status={status} map={REQUEST_STATUS_STYLE} />;
}

interface RequestDetailsModalProps {
  requestId: string | null;
  studentName: (id: string | null) => string;
  onPrintSlip: (r: ApiRequest) => void;
}

/** Tratamento do pedido: atribuir, analisar, concluir/indeferir (com motivo) e trocar mensagens com o requerente. */
export function RequestDetailsModal({ requestId, studentName, onPrintSlip }: RequestDetailsModalProps) {
  const { data: request } = useSecretaryRequest(requestId ?? undefined);
  const { assign, setStatus, comment } = useSecretaryRequests();
  const { issue } = useCertificates();
  const { data: terms = [] } = useGradeTerms();
  const { openModal } = useModal();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const run = (p: Promise<unknown>, ok: string, after?: () => void) => p.then(() => { SucessMessage(ok); after?.(); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")));
  const open = request && ["aberto", "em_analise", "aguarda_pagamento"].includes(request.status);
  const unpaid = request?.status === "aguarda_pagamento";

  const targetDocType = request?.type ? REQUEST_TYPE_TO_OFFICIAL_DOC[request.type] : undefined;
  const canIssueDoc = Boolean(request && request.student_id && targetDocType && !unpaid);

  const handleIssueOfficialDoc = async () => {
    if (!request?.student_id || !targetDocType) return;
    setIsIssuing(true);
    try {
      const termId = targetDocType === "DECLARATION_WITH_GRADES" ? terms[terms.length - 1]?.id : undefined;
      const doc = await issue.mutateAsync({
        studentId: request.student_id,
        documentType: targetDocType,
        purpose: request.subject || "Requerimento de Secretaria",
        termId,
      });
      await setStatus.mutateAsync({
        id: request.id,
        status: "concluido",
        resolution: `Documento oficial ${doc.documentNumber} emitido com código QR de autenticação.`,
      });
      SucessMessage(`Documento ${doc.documentNumber} emitido e requerimento concluído com sucesso!`);
      await openDocumentPdf(doc.id);
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível emitir o documento oficial."));
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <FormModal id="request-detail" title={request?.protocol ?? "Requerimento"} description={request ? `${REQUEST_TYPE_LABEL[request.type]} • ${REQUEST_STATUS_LABEL[request.status]}` : undefined} size="lg" readOnly onSubmit={() => undefined}>
      {request && (
        <div className="sm:col-span-2 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 rounded-xs border p-3">
            <div><span className="text-muted-foreground">Aluno:</span> <strong>{studentName(request.student_id)}</strong></div>
            <div><RequestStatusBadge status={request.status} /></div>
            <div className="col-span-2"><span className="text-muted-foreground">Assunto:</span> {request.subject}</div>
            {request.fee_amount && request.invoice && (
              <div className="col-span-2 rounded bg-muted/50 p-2">
                <span className="text-muted-foreground">Taxa:</span> <strong>{formatNumber(request.fee_amount)} Kz</strong> • ref. <span className="font-mono">{request.invoice.payment_reference}</span> • {request.invoice.status === "paga" ? "paga" : `por pagar até ${request.invoice.due_date}`}
              </div>
            )}
            {request.description && <div className="col-span-2 italic text-muted-foreground">{request.description}</div>}
            {request.resolution && <div className="col-span-2 rounded bg-muted/50 p-2"><span className="text-muted-foreground">Resolução:</span> {request.resolution}</div>}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Histórico</h4>
            {(request.events ?? []).map((e) => (
              <div key={e.id} className="rounded-xs border p-2">
                <div className="flex justify-between text-[11px] text-muted-foreground"><span>{EVENT_LABEL[e.kind] ?? e.kind}{e.to_status && e.kind !== "criado" ? ` → ${REQUEST_STATUS_LABEL[e.to_status as RequestStatus] ?? e.to_status}` : ""}</span><span>{formatDateTime(e.created_at)}</span></div>
                {e.message && e.kind !== "atribuido" && <p className="mt-1">{e.message}</p>}
              </div>
            ))}
          </div>

          {open && (
            <div className="space-y-3 border-t pt-3">
              <div className="flex flex-wrap gap-2">
                {!request.assigned_to && <Button type="button" size="sm" variant="outline" onClick={() => run(assign.mutateAsync(request.id), "Pedido atribuído a si.")}>Assumir</Button>}
                {request.status === "aberto" && <Button type="button" size="sm" variant="outline" onClick={() => run(setStatus.mutateAsync({ id: request.id, status: "em_analise" }), "Pedido em análise.")}>Iniciar análise</Button>}
              </div>
              <FormTextarea label={unpaid ? "Motivo da isenção" : "Resolução / motivo"} value={note} onChange={setNote} rows={2} placeholder={unpaid ? "Ex: aluno bolseiro; isento por decisão da direção." : "Ex: declaração emitida; levantar na secretaria."} />
              {unpaid ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">O pedido aguarda o pagamento da taxa. Só depois de paga segue para tratamento; pode isentar com motivo (a fatura é anulada).</p>
                  <Button type="button" size="sm" variant="outline" disabled={note.trim().length < 3} onClick={() => run(setStatus.mutateAsync({ id: request.id, status: "em_analise", resolution: note.trim(), waiveFee: true }), "Taxa isenta; pedido em análise.", () => setNote(""))}>Isentar taxa e iniciar análise</Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {canIssueDoc && (
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                      disabled={isIssuing}
                      onClick={handleIssueOfficialDoc}
                    >
                      <Icon name="FileCheck" className="size-3.5" />
                      {isIssuing ? "A emitir documento..." : "Emitir Documento Oficial com QR"}
                    </Button>
                  )}
                  <Button type="button" size="sm" className="gap-1" onClick={() => run(setStatus.mutateAsync({ id: request.id, status: "concluido", resolution: note.trim() || undefined }), "Pedido concluído.", () => setNote(""))}><Icon name="Check" className="size-3.5" />Concluir</Button>
                  <Button type="button" size="sm" variant="destructive" disabled={note.trim().length < 3} onClick={() => run(setStatus.mutateAsync({ id: request.id, status: "rejeitado", resolution: note.trim() }), "Pedido indeferido.", () => setNote(""))}>Indeferir</Button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1"><Input label="Mensagem ao requerente" value={message} onChange={(e) => setMessage(e.target.value)} /></div>
                <Button type="button" size="sm" variant="secondary" className="h-10" disabled={!message.trim() || comment.isPending} onClick={() => run(comment.mutateAsync({ id: request.id, message: message.trim() }), "Mensagem enviada.", () => setMessage(""))}>Enviar</Button>
              </div>
            </div>
          )}

          <div className="flex justify-end"><Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={() => { onPrintSlip(request); openModal("request-slip"); }}><Icon name="FileDown" className="size-4" />Comprovativo (PDF)</Button></div>
        </div>
      )}
    </FormModal>
  );
}
