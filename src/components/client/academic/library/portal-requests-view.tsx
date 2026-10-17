"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { StatusBadge, ButtonOnlyAction, DataList, FormModal, FormTextarea, Input, type Column } from "@/components";
import { libraryService, type ApiLibraryRequest, type ApiLibraryRequestStatus } from "@/services/library-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const APPROVE = "library-request-approve";
const REJECT = "library-request-reject";
const STATUS: Record<ApiLibraryRequestStatus, { label: string; variant: "info" | "success" | "destructive" | "secondary" }> = {
  pedido: { label: "Por decidir", variant: "info" }, aprovado: { label: "Aprovado", variant: "success" }, recusado: { label: "Recusado", variant: "destructive" }, cancelado: { label: "Cancelado", variant: "secondary" },
};
const fail = (e: unknown): never => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };

/** Pedidos de livros feitos no portal: aprovar (cria o empréstimo) ou recusar com motivo. */
export function PortalRequestsView() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const { openModal } = useModal();
  const { data = [], isLoading } = useQuery({ queryKey: ["library-requests", schoolId], queryFn: () => libraryService.requests(), enabled: Boolean(schoolId), staleTime: 15 * 1000 });
  const refresh = () => { void qc.invalidateQueries({ queryKey: ["library-requests", schoolId] }); void qc.invalidateQueries({ queryKey: ["library-loans", schoolId] }); void qc.invalidateQueries({ queryKey: ["library-books", schoolId] }); };
  const approve = useMutation({ mutationFn: (v: { id: string; days?: number }) => libraryService.approveRequest(v.id, v.days), onSuccess: refresh });
  const reject = useMutation({ mutationFn: (v: { id: string; reason: string }) => libraryService.rejectRequest(v.id, v.reason), onSuccess: refresh });
  const [target, setTarget] = useState<ApiLibraryRequest | null>(null);
  const [days, setDays] = useState("14");
  const [reason, setReason] = useState("");

  const columns: Column<ApiLibraryRequest>[] = [
    { key: "book_title", header: "Livro", render: (_, r) => (<div><span className="font-medium">{r.book_title}</span><p className="text-xs text-muted-foreground">{r.book_author}</p></div>) },
    { key: "student_name", header: "Aluno", render: (_, r) => (<div><span>{r.student_name}</span>{r.notes && <p className="max-w-xs truncate text-xs text-muted-foreground">{r.notes}</p>}</div>) },
    { key: "created_at", header: "Pedido em", render: (_, r) => <span className="text-xs">{r.created_at.slice(0, 10)}</span> },
    { key: "status", header: "Estado", render: (_, r) => (<div><StatusBadge status={r.status} map={STATUS} />{r.decision_reason && <p className="mt-1 text-xs text-muted-foreground">{r.decision_reason}</p>}</div>) },
    {
      key: "actions", header: "Acção",
      render: (_, r) => (r.status === "pedido" ? <ButtonOnlyAction data={r} actions={[
        { permission: "library:write", label: "Aprovar e emprestar", icon: "Check", onClick: (x) => { setTarget(x); setDays("14"); openModal(APPROVE); } },
        { permission: "library:write", label: "Recusar", icon: "X", variant: "destructive", onClick: (x) => { setTarget(x); setReason(""); openModal(REJECT); } },
      ]} /> : null),
    },
  ];

  return (
    <>
      <DataList<ApiLibraryRequest>
        prefix="pedidos" rows={data} columns={columns} isLoading={isLoading} pageSize={10}
        searchPlaceholder="Pesquisar livro ou aluno" searchText={(r) => `${r.book_title} ${r.student_name}`}
        filters={[{ key: "estado", label: "Estado", icon: "ListFilter", options: (Object.keys(STATUS) as ApiLibraryRequestStatus[]).map((s) => ({ value: s, label: STATUS[s].label })), match: (r, v) => r.status === v }]}
        dateFilters={[{ key: "data", label: "Pedido em", getDate: (r) => r.created_at }]}
        sorts={[{ value: "data", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }]}
        emptyTitle="Sem pedidos do portal" emptyDescription="Quando um encarregado ou aluno pedir um livro, o pedido aparece aqui." emptyIcon="Inbox"
      />

      <FormModal id={APPROVE} title="Aprovar pedido" description={target ? `${target.book_title} — ${target.student_name}` : undefined} submitLabel="Aprovar e emprestar" isLoading={approve.isPending} disabled={!(Number(days) >= 1 && Number(days) <= 60)}
        onSubmit={() => (target ? approve.mutateAsync({ id: target.id, days: Number(days) }).then(() => { SucessMessage("Pedido aprovado: empréstimo criado."); }).catch(fail) : undefined)}>
        <div className="sm:col-span-2"><Input label="Prazo do empréstimo (dias)" type="quantity" min={1} max={60} step={1} value={days} onChange={(e) => setDays(e.target.value)} /></div>
        <p className="sm:col-span-2 text-xs text-muted-foreground">Aplicam-se as regras do balcão: exemplares disponíveis, máximo de 3 obras e nenhum atraso.</p>
      </FormModal>

      <FormModal id={REJECT} title="Recusar pedido" description={target ? `${target.book_title} — ${target.student_name}` : undefined} submitLabel="Recusar" isLoading={reject.isPending} disabled={reason.trim().length < 3}
        onSubmit={() => (target ? reject.mutateAsync({ id: target.id, reason: reason.trim() }).then(() => { SucessMessage("Pedido recusado."); }).catch(fail) : undefined)}>
        <div className="sm:col-span-2"><FormTextarea label="Motivo (visto pela família) *" value={reason} onChange={setReason} rows={3} /></div>
      </FormModal>
    </>
  );
}
