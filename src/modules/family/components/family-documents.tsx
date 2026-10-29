"use client";
import { familyKeys } from "@/modules/family/query-keys";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, FormModal, Icon, Input, FormTextarea, Tabs, TabsContent, TabsList, TabsTrigger, type Column } from "@/components";
import { useSecretaryRequests } from "@/hooks/school/use-secretary-requests";
import { usePortal } from "@/modules/family/hooks/use-portal";
import { documentFeesService } from "@/modules/finance/services/document-fees-service";
import { portalService, type PortalDocument } from "@/modules/family/services/portal-service";
import { REQUEST_STATUS_LABEL, REQUEST_TYPE_LABEL, type ApiRequest, type RequestStatus, type RequestType } from "@/services/secretary-requests-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";
import type { FamilyContext } from "./family-shell";

const NEW_MODAL = "family-request-new";
const CANCEL_MODAL = "family-request-cancel";
const TYPES = Object.keys(REQUEST_TYPE_LABEL) as RequestType[];
const ICON: Record<RequestType, string> = { declaracao_matricula: "FileCheck", declaracao_notas: "ScrollText", certificado: "Award", segunda_via_cartao: "IdCard", transferencia: "ArrowRightLeft", outro: "FilePlus" };
const TONE: Record<RequestStatus, "info" | "warning" | "success" | "destructive" | "secondary" | "default"> = {
  aberto: "info", aguarda_pagamento: "warning", em_analise: "info", concluido: "success", rejeitado: "destructive", cancelado: "secondary",
};

/** Documentos e pedidos: pedir um documento (taxa visível e fatura automática), acompanhar pedidos e descarregar os emitidos. */
export function FamilyDocuments({ studentId, ward }: FamilyContext) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const requests = useSecretaryRequests(true);
  const live = usePortal(studentId, ["documents"]);
  const { openModal } = useModal();
  const { data: price } = useQuery({ queryKey: familyKeys.documentFees(schoolId), queryFn: documentFeesService.portal, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const [type, setType] = useState<RequestType>("declaracao_matricula");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [cancelling, setCancelling] = useState<ApiRequest | null>(null);

  const fee = (t: RequestType) => Number(price?.fees[t] ?? 0);
  const mine = requests.all.filter((r) => r.student_id === studentId);
  const awaiting = mine.filter((r) => r.status === "aguarda_pagamento");
  const payHref = `/familia/financeiro?aluno=${studentId}`;

  const startRequest = (t: RequestType) => { setType(t); setSubject(""); setDescription(""); openModal(NEW_MODAL); };
  const send = () =>
    requests.create.mutateAsync({ type, subject: subject.trim(), ...(description.trim() ? { description: description.trim() } : {}), studentId })
      .then((r) => { SucessMessage(r.status === "aguarda_pagamento" ? `Pedido ${r.protocol} criado. Pague a taxa para a secretaria o tratar.` : `Pedido ${r.protocol} enviado à secretaria.`); })
      .catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível enviar o pedido.")); throw e; });

  const requestColumns: Column<ApiRequest>[] = [
    { key: "protocol", header: "Protocolo", render: (_, r) => <span className="font-mono font-medium text-primary">{r.protocol}</span> },
    { key: "type", header: "Documento", render: (_, r) => (<div><p className="font-medium">{REQUEST_TYPE_LABEL[r.type]}</p><p className="text-xs text-muted-foreground">{r.subject}</p></div>) },
    { key: "fee", header: "Taxa", render: (_, r) => (r.fee_amount ? <span className="tabular-nums">{formatCurrency(Number(r.fee_amount))}</span> : <span className="text-xs text-muted-foreground">Gratuito</span>) },
    { key: "created_at", header: "Data", render: (_, r) => <span className="text-xs">{r.created_at.slice(0, 10)}</span> },
    { key: "status", header: "Estado", render: (_, r) => <Badge variant={TONE[r.status]} className="font-normal">{REQUEST_STATUS_LABEL[r.status]}</Badge> },
    {
      key: "actions", header: "Ação",
      render: (_, r) => (
        r.status === "aguarda_pagamento" ? (
          <div className="flex items-center gap-1">
            <Button size="sm" className="h-8 gap-1.5" asChild><Link href={payHref}><Icon name="Landmark" className="size-3.5" />Pagar</Link></Button>
            <ButtonOnlyAction data={r} actions={[{ label: "Cancelar pedido", icon: "X", variant: "destructive", onClick: (x) => { setCancelling(x); openModal(CANCEL_MODAL); } }]} />
          </div>
        ) : r.status === "aberto" ? <ButtonOnlyAction data={r} actions={[{ label: "Cancelar pedido", icon: "X", variant: "destructive", onClick: (x) => { setCancelling(x); openModal(CANCEL_MODAL); } }]} /> : null
      ),
    },
  ];

  const docColumns: Column<PortalDocument>[] = [
    { key: "document_number", header: "Número", render: (_, d) => <span className="font-mono font-medium">{d.document_number}</span> },
    { key: "type", header: "Tipo", render: (_, d) => d.type },
    { key: "issued_at", header: "Emitido em", render: (_, d) => <span className="text-xs">{d.issued_at.slice(0, 10)}</span> },
    { key: "actions", header: "Ação", render: (_, d) => <ButtonOnlyAction data={d} actions={[{ label: "Abrir PDF", icon: "FileText", onClick: (x) => void portalService.documentPdf(studentId, x.id).then((b) => window.open(URL.createObjectURL(b), "_blank")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem PDF."))) }]} /> },
  ];

  return (
    <>
      {awaiting.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <div className="flex items-center gap-2"><Icon name="Clock" className="size-4 text-amber-600" />{awaiting.length === 1 ? "Tem 1 pedido a aguardar o pagamento da taxa." : `Tem ${awaiting.length} pedidos a aguardar o pagamento da taxa.`}</div>
          <Button size="sm" asChild><Link href={payHref}>Pagar agora</Link></Button>
        </div>
      )}

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="new" className="text-xs">Pedir documento</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs">Os meus pedidos{mine.length > 0 && <span className="ml-1 text-muted-foreground">({mine.length})</span>}</TabsTrigger>
          <TabsTrigger value="issued" className="text-xs">Documentos emitidos</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-3">
          <p className="text-xs text-muted-foreground">Escolha o documento. Quando tem taxa, é gerada automaticamente uma fatura e a secretaria trata do pedido depois do pagamento.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 @5xl/main:grid-cols-3">
            {TYPES.map((t) => (
              <div key={t} className="flex flex-col justify-between gap-3 rounded-xs border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xs bg-primary/10 p-2 text-primary"><Icon name={ICON[t] as never} className="size-5" /></div>
                  <div>
                    <p className="font-medium">{REQUEST_TYPE_LABEL[t]}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{fee(t) > 0 ? `Taxa: ${formatCurrency(fee(t))}` : "Gratuito"}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 self-start" onClick={() => startRequest(t)}><Icon name="FilePlus" className="size-4" />Pedir</Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <DataList<ApiRequest>
            prefix="pedidos" rows={mine} columns={requestColumns} isLoading={requests.isLoading} pageSize={10}
            searchPlaceholder="Pesquisar protocolo ou assunto" searchText={(r) => `${r.protocol} ${r.subject}`}
            filters={[
              { key: "estado", label: "Estado", icon: "ListFilter", options: (Object.keys(REQUEST_STATUS_LABEL) as RequestStatus[]).map((s) => ({ value: s, label: REQUEST_STATUS_LABEL[s] })), match: (r, v) => r.status === v },
              { key: "documento", label: "Documento", icon: "FileText", options: TYPES.map((t) => ({ value: t, label: REQUEST_TYPE_LABEL[t] })), match: (r, v) => r.type === v },
            ]}
            dateFilters={[{ key: "aberto", label: "Pedido em", getDate: (r) => r.created_at }]}
            sorts={[{ value: "data", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }]}
            emptyTitle="Sem pedidos" emptyDescription="Ainda não pediu nenhum documento para este educando." emptyIcon="Files"
          />
        </TabsContent>

        <TabsContent value="issued">
          <DataList<PortalDocument>
            prefix="documentos" rows={live.documents} columns={docColumns} pageSize={10}
            searchPlaceholder="Pesquisar documento" searchText={(d) => `${d.document_number} ${d.type}`}
            filters={[{ key: "tipo", label: "Tipo", icon: "ListFilter", options: [...new Set(live.documents.map((d) => d.type))].map((v) => ({ value: v, label: v })), match: (d, v) => d.type === v }]}
            dateFilters={[{ key: "emitido", label: "Emissão", getDate: (d) => d.issued_at }]}
            sorts={[{ value: "data", label: "Data", compare: (a, b) => a.issued_at.localeCompare(b.issued_at) }]}
            emptyTitle="Sem documentos" emptyDescription="Ainda não foram emitidos documentos." emptyIcon="FileText"
          />
        </TabsContent>
      </Tabs>

      <FormModal id={NEW_MODAL} title={REQUEST_TYPE_LABEL[type]} description={`Para ${ward.student.full_name}`} submitLabel={fee(type) > 0 ? "Pedir e gerar fatura" : "Enviar pedido"} isLoading={requests.create.isPending} disabled={subject.trim().length < 3} onSubmit={send}>
        <div className="sm:col-span-2 rounded-xs border bg-muted/30 p-3 text-sm">
          {fee(type) > 0
            ? <p>Taxa deste documento: <strong>{formatCurrency(fee(type))}</strong>. Será gerada uma fatura com referência de pagamento; depois de paga, a secretaria trata do pedido.</p>
            : <p>Este documento é <strong>gratuito</strong>: o pedido segue diretamente para a secretaria.</p>}
        </div>
        <div className="sm:col-span-2"><Input label="Finalidade *" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex.: abertura de conta bancária" /></div>
        <div className="sm:col-span-2"><FormTextarea label="Observações" value={description} onChange={setDescription} rows={3} /></div>
      </FormModal>

      <ConfirmModal id={CANCEL_MODAL} title="Cancelar pedido" description={cancelling ? `Cancelar o pedido ${cancelling.protocol}?${cancelling.invoice ? " A fatura da taxa será anulada." : ""}` : ""} destructive confirmLabel="Cancelar pedido"
        onConfirm={() => (cancelling ? requests.cancel.mutateAsync(cancelling.id).then(() => { SucessMessage("Pedido cancelado."); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível cancelar.")); throw e; }) : Promise.resolve())} />
    </>
  );
}
