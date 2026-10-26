"use client";

import { useState } from "react";
import { ButtonOnlyAction, DataList, type Column } from "@/components";
import { useSecretaryRequests } from "@/hooks/school/use-secretary-requests";
import { REQUEST_STATUS_LABEL, REQUEST_TYPE_LABEL, type ApiRequest, type RequestStatus, type RequestType } from "@/services/secretary-requests-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { RequestDetailsModal, RequestStatusBadge } from "./request-details-modal";
import { ProtocolSlipModal } from "./protocol-slip-modal";

export { RequestStatusBadge };

export function RequestsTable() {
  const { all, isLoading, nameOf } = useSecretaryRequests();
  const { openModal } = useModal();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slip, setSlip] = useState<ApiRequest | null>(null);
  const student = (id: string | null) => (id ? nameOf.get(id) ?? "—" : "—");

  const columns: Column<ApiRequest>[] = [
    { key: "protocol", header: "Protocolo", render: (_, r) => (<div className="flex flex-col"><span className="font-mono font-medium text-primary">{r.protocol}</span><span className="text-[10px] text-muted-foreground">{r.created_at.slice(0, 10).split("-").reverse().join("/")}</span></div>) },
    { key: "student_id", header: "Aluno", render: (_, r) => <span className="font-medium">{student(r.student_id)}</span> },
    { key: "type", header: "Serviço / assunto", render: (_, r) => (<div className="flex flex-col"><span className="font-medium">{REQUEST_TYPE_LABEL[r.type]}</span><span className="line-clamp-1 text-xs italic text-muted-foreground">{r.subject}</span></div>) },
    { key: "status", header: "Estado", render: (_, r) => <RequestStatusBadge status={r.status} /> },
    {
      key: "action", header: "Ação",
      render: (_, r) => <ButtonOnlyAction data={r} actions={[
        { label: "Abrir / tratar", icon: "Eye", onClick: (x) => { setSelectedId(x.id); openModal("request-detail"); } },
        { label: "Comprovativo (PDF)", icon: "FileDown", onClick: (x) => { setSlip(x); openModal("request-slip"); } },
      ]} />,
    },
  ];

  return (
    <>
      <DataList<ApiRequest>
        prefix="requerimentos"
        rows={all}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar por protocolo, aluno ou assunto"
        searchText={(r) => `${r.protocol} ${student(r.student_id)} ${r.subject}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: (Object.keys(REQUEST_STATUS_LABEL) as RequestStatus[]).map((s) => ({ value: s, label: REQUEST_STATUS_LABEL[s] })), match: (r, v) => r.status === v },
          { key: "servico", label: "Serviço", icon: "FileText", options: (Object.keys(REQUEST_TYPE_LABEL) as RequestType[]).map((t) => ({ value: t, label: REQUEST_TYPE_LABEL[t] })), match: (r, v) => r.type === v },
          { key: "atribuicao", label: "Atribuição", icon: "UserCheck", options: [{ value: "atribuido", label: "Atribuído" }, { value: "livre", label: "Por atribuir" }], match: (r, v) => (v === "atribuido" ? Boolean(r.assigned_to) : !r.assigned_to) },
        ]}
        dateFilters={[{ key: "aberto", label: "Aberto", getDate: (r) => r.created_at }]}
        sorts={[{ value: "data", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }, { value: "protocolo", label: "Protocolo", compare: (a, b) => a.protocol.localeCompare(b.protocol) }, { value: "estado", label: "Estado", compare: (a, b) => a.status.localeCompare(b.status) }]}
        emptyTitle="Nenhum requerimento encontrado"
        emptyDescription="Abra um novo requerimento."
        emptyIcon="Files"
      />
      <RequestDetailsModal requestId={selectedId} studentName={student} onPrintSlip={setSlip} />
      <ProtocolSlipModal request={slip} />
    </>
  );
}
