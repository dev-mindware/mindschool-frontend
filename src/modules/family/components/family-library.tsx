"use client";
import { familyKeys } from "@/modules/family/query-keys";
import { formatIsoDay } from "@/utils";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, StatusBadge, Button, ButtonOnlyAction, ConfirmModal, DataList, DynamicMetricCard, FormModal, FormTextarea, Icon, Tabs, TabsContent, TabsList, TabsTrigger, type Column } from "@/components";
import { optionalSafeTextSchema } from "@/schemas/helps";
import { portalService, type LibraryRequestStatus, type PortalBook, type PortalLibraryRequest, type PortalLoan } from "@/modules/family/services/portal-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import type { FamilyContext } from "./family-shell";

const REQUEST_MODAL = "family-book-request";
const CANCEL_MODAL = "family-book-cancel";
const libraryRequestSchema = z.object({
  notes: optionalSafeTextSchema(500, 2, "As observações"),
});
const STATUS: Record<LibraryRequestStatus, { label: string; variant: "info" | "success" | "destructive" | "secondary" }> = {
  pedido: { label: "A aguardar a biblioteca", variant: "info" }, aprovado: { label: "Aprovado", variant: "success" }, recusado: { label: "Recusado", variant: "destructive" }, cancelado: { label: "Cancelado", variant: "secondary" },
};
const fail = (e: unknown, fallback: string): never => { ErrorMessage(getApiErrorMessage(e, fallback)); throw e; };

/** Biblioteca: pesquisar o acervo, pedir um livro ou manual, acompanhar os pedidos e renovar os empréstimos. */
export function FamilyLibrary({ studentId, ward }: FamilyContext) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const { openModal } = useModal();
  const books = useQuery({ queryKey: familyKeys.libraryBooks(schoolId), queryFn: () => portalService.libraryBooks(), enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const mine = useQuery({ queryKey: familyKeys.library(schoolId, studentId), queryFn: () => portalService.library(studentId), enabled: Boolean(schoolId && studentId), staleTime: 15 * 1000 });
  const refresh = () => { void qc.invalidateQueries({ queryKey: familyKeys.library(schoolId, studentId) }); void qc.invalidateQueries({ queryKey: familyKeys.libraryBooks(schoolId) }); };
  const request = useMutation({ mutationFn: (v: { bookId: string; notes?: string }) => portalService.requestBook(studentId, v.bookId, v.notes), onSuccess: refresh });
  const cancel = useMutation({ mutationFn: portalService.cancelBookRequest, onSuccess: refresh });
  const renew = useMutation({ mutationFn: (loanId: string) => portalService.renewLoan(studentId, loanId), onSuccess: refresh });
  const [book, setBook] = useState<PortalBook | null>(null);
  const [notes, setNotes] = useState("");
  const [notesTouched, setNotesTouched] = useState(false);
  const [cancelling, setCancelling] = useState<PortalLibraryRequest | null>(null);

  const parsed = useMemo(() => libraryRequestSchema.safeParse({ notes }), [notes]);
  const notesError = notesTouched && !parsed.success ? parsed.error.issues[0]?.message : undefined;

  const requests = mine.data?.requests ?? [];
  const loans = mine.data?.loans ?? [];
  const activeLoans = loans.filter((l) => l.status === "emprestado");
  const open = requests.filter((r) => r.status === "pedido");
  const overdue = activeLoans.filter((l) => l.overdue).length;

  const bookColumns: Column<PortalBook>[] = [
    { key: "title", header: "Livro", render: (_, b) => (<div><span className="font-medium">{b.title}</span><p className="text-xs text-muted-foreground">{b.author}</p></div>) },
    { key: "category", header: "Categoria", render: (_, b) => <span className="text-xs">{b.category ?? "—"}</span> },
    { key: "location", header: "Localização", render: (_, b) => <span className="text-xs text-muted-foreground">{b.location ?? "—"}</span> },
    { key: "copies_available", header: "Disponibilidade", render: (_, b) => <Badge variant={b.copies_available > 0 ? "success" : "secondary"} className="font-normal">{b.copies_available > 0 ? `${b.copies_available} disponível(eis)` : "Sem exemplares"}</Badge> },
    {
      key: "actions", header: "Ação",
      render: (_, b) => {
        const requested = open.some((r) => r.book_id === b.id) || activeLoans.some((l) => l.book_id === b.id);
        return <Button size="sm" variant="outline" className="h-8 gap-1.5" disabled={requested} onClick={() => { setBook(b); setNotes(""); setNotesTouched(false); openModal(REQUEST_MODAL); }}><Icon name="BookPlus" className="size-3.5" />{requested ? "Já pedido" : "Pedir"}</Button>;
      },
    },
  ];

  const requestColumns: Column<PortalLibraryRequest>[] = [
    { key: "book_title", header: "Livro", render: (_, r) => (<div><span className="font-medium">{r.book_title}</span><p className="text-xs text-muted-foreground">{r.book_author}</p></div>) },
    { key: "created_at", header: "Pedido em", render: (_, r) => <span className="text-xs">{formatIsoDay(r.created_at)}</span> },
    { key: "status", header: "Estado", render: (_, r) => (<div><StatusBadge status={r.status} map={STATUS} />{r.decision_reason && <p className="mt-1 text-xs text-muted-foreground">{r.decision_reason}</p>}{r.loan && <p className="mt-1 text-xs text-muted-foreground">Devolver até {r.loan.due_at}</p>}</div>) },
    { key: "actions", header: "Ação", render: (_, r) => (r.status === "pedido" ? <ButtonOnlyAction data={r} actions={[{ label: "Cancelar pedido", icon: "X", variant: "destructive", onClick: (x) => { setCancelling(x); openModal(CANCEL_MODAL); } }]} /> : null) },
  ];

  const loanColumns: Column<PortalLoan>[] = [
    { key: "book_title", header: "Livro", render: (_, l) => (<div><span className="font-medium">{l.book_title}</span><p className="text-xs text-muted-foreground">{l.book_author}</p></div>) },
    { key: "loaned_at", header: "Levantado", render: (_, l) => <span className="text-xs">{formatIsoDay(l.loaned_at)}</span> },
    { key: "due_at", header: "Devolver até", render: (_, l) => <span className={`text-xs ${l.overdue ? "font-semibold text-destructive" : ""}`}>{l.status === "devolvido" ? `Devolvido ${formatIsoDay(l.returned_at)}` : l.due_at}</span> },
    { key: "status", header: "Estado", render: (_, l) => <Badge variant={l.status === "devolvido" ? "secondary" : l.overdue ? "destructive" : "info"} className="font-normal">{l.status === "devolvido" ? "Devolvido" : l.overdue ? "Em atraso" : "Emprestado"}</Badge> },
    {
      key: "actions", header: "Ação",
      render: (_, l) => (l.status === "emprestado" && !l.overdue && l.renewals < 2
        ? <Button size="sm" variant="outline" className="h-8" disabled={renew.isPending} onClick={() => void renew.mutateAsync(l.id).then(() => { SucessMessage("Empréstimo renovado."); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível renovar.")))}>Renovar</Button>
        : l.status === "emprestado" ? <span className="text-xs text-muted-foreground">{l.overdue ? "Devolva o livro" : "Sem renovações"}</span> : null),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <DynamicMetricCard title={books.data?.length ?? 0} subtitle="Livros no acervo" icon="Library" description="Disponíveis para pedido" />
        <DynamicMetricCard title={open.length} subtitle="Pedidos em aberto" icon="Hourglass" description="A aguardar a biblioteca" />
        <DynamicMetricCard title={activeLoans.length} subtitle="Emprestados" icon="BookOpen" description="Máximo de 3 livros ao mesmo tempo" />
        <DynamicMetricCard title={overdue} subtitle="Em atraso" icon="TriangleAlert" colors={overdue > 0 ? "destructive" : "default"} description={overdue > 0 ? "Devolva para poder pedir outros" : "Tudo em dia"} />
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="catalog" className="text-xs">Catálogo</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs">Os meus pedidos{requests.length > 0 && <span className="ml-1 text-muted-foreground">({requests.length})</span>}</TabsTrigger>
          <TabsTrigger value="loans" className="text-xs">Empréstimos</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog">
          <DataList<PortalBook>
            prefix="books" rows={books.data ?? []} columns={bookColumns} isLoading={books.isLoading} pageSize={10}
            searchPlaceholder="Pesquisar por título ou autor" searchText={(b) => `${b.title} ${b.author} ${b.category ?? ""}`}
            filters={[
              { key: "category", label: "Categoria", icon: "Tag", options: [...new Set((books.data ?? []).map((b) => b.category).filter((c): c is string => Boolean(c)))].map((v) => ({ value: v, label: v })), match: (b, v) => b.category === v },
              { key: "available", label: "Disponibilidade", icon: "CircleCheck", options: [{ value: "yes", label: "Com exemplares" }, { value: "no", label: "Sem exemplares" }], match: (b, v) => (v === "yes" ? b.copies_available > 0 : b.copies_available === 0) },
            ]}
            sorts={[{ value: "title", label: "Título", compare: (a, b) => a.title.localeCompare(b.title, "pt") }, { value: "author", label: "Autor", compare: (a, b) => a.author.localeCompare(b.author, "pt") }]}
            emptyTitle="Sem livros" emptyDescription="A biblioteca ainda não tem livros no acervo." emptyIcon="Library"
          />
        </TabsContent>
        <TabsContent value="requests">
          <DataList<PortalLibraryRequest>
            prefix="book-requests" rows={requests} columns={requestColumns} isLoading={mine.isLoading} pageSize={10}
            searchPlaceholder="Pesquisar livro" searchText={(r) => `${r.book_title} ${r.book_author}`}
            filters={[{ key: "status", label: "Estado", icon: "ListFilter", options: (Object.keys(STATUS) as LibraryRequestStatus[]).map((s) => ({ value: s, label: STATUS[s].label })), match: (r, v) => r.status === v }]}
            dateFilters={[{ key: "date", label: "Pedido em", getDate: (r) => r.created_at }]}
            sorts={[{ value: "date", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }]}
            emptyTitle="Sem pedidos" emptyDescription="Procure no catálogo e peça o livro ou manual de que precisa." emptyIcon="BookPlus"
          />
        </TabsContent>
        <TabsContent value="loans">
          <DataList<PortalLoan>
            prefix="loans" rows={loans} columns={loanColumns} isLoading={mine.isLoading} pageSize={10}
            searchPlaceholder="Pesquisar livro" searchText={(l) => `${l.book_title} ${l.book_author}`}
            filters={[{ key: "status", label: "Estado", icon: "ListFilter", options: [{ value: "emprestado", label: "Emprestados" }, { value: "devolvido", label: "Devolvidos" }, { value: "overdue", label: "Em atraso" }], match: (l, v) => (v === "overdue" ? l.overdue : l.status === v) }]}
            dateFilters={[{ key: "date", label: "Levantado em", getDate: (l) => l.loaned_at }]}
            sorts={[{ value: "due", label: "Devolução", compare: (a, b) => a.due_at.localeCompare(b.due_at) }]}
            emptyTitle="Sem empréstimos" emptyDescription="Quando a biblioteca aprovar um pedido, o empréstimo aparece aqui." emptyIcon="BookOpen"
          />
        </TabsContent>
      </Tabs>

      <FormModal id={REQUEST_MODAL} title="Pedir livro" description={book ? `${book.title} — para ${ward.student.full_name}` : undefined} submitLabel="Enviar pedido" isLoading={request.isPending} disabled={!book || !parsed.success || request.isPending}
        onSubmit={() => {
          if (!book) return undefined;
          if (!parsed.success) {
            setNotesTouched(true);
            return Promise.reject(new Error("Formulário inválido."));
          }
          return request
            .mutateAsync({ bookId: book.id, ...(parsed.data.notes ? { notes: parsed.data.notes } : {}) })
            .then(() => { SucessMessage("Pedido enviado à biblioteca."); })
            .catch((e) => fail(e, "Não foi possível enviar o pedido."));
        }}>
        <div className="sm:col-span-2 rounded-xs border bg-muted/30 p-3 text-sm">A biblioteca analisa o pedido e avisa quando o livro estiver pronto para levantar. O prazo de empréstimo é de 14 dias, com até 2 renovações.</div>
        <div className="sm:col-span-2">
          <FormTextarea
            label="Observações"
            maxLength={500}
            value={notes}
            onChange={(v) => {
              setNotesTouched(true);
              setNotes(v);
            }}
            error={notesError}
            rows={3}
            placeholder="Indique observações ou preferências de levantamento na biblioteca..."
          />
        </div>
      </FormModal>

      <ConfirmModal id={CANCEL_MODAL} title="Cancelar pedido" description={cancelling ? `Cancelar o pedido de «${cancelling.book_title}»?` : ""} destructive confirmLabel="Cancelar pedido"
        onConfirm={() => (cancelling ? cancel.mutateAsync(cancelling.id).then(() => { SucessMessage("Pedido cancelado."); }).catch((e) => fail(e, "Não foi possível cancelar.")) : Promise.resolve())} />
    </>
  );
}
