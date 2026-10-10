"use client";

import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, ButtonOnlyAction, DataList, type Column } from "@/components";
import { useLibrary } from "@/hooks/school/use-library";
import type { ApiLoan } from "@/services/library-service";
import { getApiErrorMessage } from "@/utils/api-error";

const loanState = (l: ApiLoan) => (l.status === "devolvido" ? "devolvido" : l.overdue ? "atraso" : "curso");

/** Balcão de empréstimos: devolução e renovação; os atrasos aparecem a vermelho. */
export function LoansManagementView() {
  const { loans, bookById, readerName, giveBack, renew, isLoading } = useLibrary();
  const run = (p: Promise<unknown>, ok: string) => p.then(() => SucessMessage(ok)).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")));

  const columns: Column<ApiLoan>[] = [
    { key: "book_id", header: "Obra", render: (_, l) => <span className="font-medium">{bookById.get(l.book_id)?.title ?? "—"}</span> },
    { key: "student_id", header: "Leitor", render: (_, l) => (<div className="flex flex-col"><span>{readerName(l)}</span><span className="text-xs text-muted-foreground">{l.teacher_id ? "Docente" : "Aluno"}</span></div>) },
    { key: "loaned_at", header: "Emprestado", render: (_, l) => <span className="font-mono text-xs">{l.loaned_at.slice(0, 10)}</span> },
    { key: "due_at", header: "Devolver até", render: (_, l) => <span className="font-mono text-xs">{l.due_at}{l.renewals > 0 ? ` (${l.renewals}×)` : ""}</span> },
    {
      key: "status", header: "Estado",
      render: (_, l) => (loanState(l) === "devolvido" ? <Badge variant="secondary">Devolvido</Badge>
        : loanState(l) === "atraso" ? <Badge variant="destructive">{l.days_overdue}d em atraso</Badge>
          : <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">Em curso</Badge>),
    },
    {
      key: "action", header: "Acção",
      render: (_, l) => l.status === "emprestado" ? (
        <ButtonOnlyAction data={l} actions={[
          { permission: "library:write", label: "Devolver", icon: "Undo2", onClick: (x) => void run(giveBack.mutateAsync(x.id), "Devolução registada.") },
          { permission: "library:write", label: "Renovar", icon: "RefreshCcw", onClick: (x) => void run(renew.mutateAsync(x.id), "Empréstimo renovado."), className: l.overdue ? "pointer-events-none opacity-40" : "" },
        ]} />
      ) : null,
    },
  ];

  return (
    <DataList<ApiLoan>
      prefix="emprestimos"
      rows={loans}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Pesquisar por obra ou leitor"
      searchText={(l) => `${bookById.get(l.book_id)?.title ?? ""} ${readerName(l)}`}
      filters={[
        { key: "estado", label: "Estado", icon: "Tag", options: [{ value: "curso", label: "Em curso" }, { value: "atraso", label: "Em atraso" }, { value: "devolvido", label: "Devolvido" }], match: (l, v) => loanState(l) === v },
        { key: "leitor", label: "Tipo de leitor", icon: "Users", options: [{ value: "aluno", label: "Aluno" }, { value: "docente", label: "Docente" }], match: (l, v) => (v === "docente" ? Boolean(l.teacher_id) : Boolean(l.student_id)) },
        { key: "renovado", label: "Renovações", icon: "RefreshCcw", options: [{ value: "sim", label: "Renovados" }, { value: "nao", label: "Sem renovação" }], match: (l, v) => (v === "sim" ? l.renewals > 0 : l.renewals === 0) },
      ]}
      dateFilters={[{ key: "emprestado", label: "Emprestado", getDate: (l) => l.loaned_at }, { key: "devolucao", label: "Devolução", getDate: (l) => l.due_at }]}
      sorts={[
        { value: "loaned", label: "Data do empréstimo", compare: (a, b) => a.loaned_at.localeCompare(b.loaned_at) },
        { value: "due", label: "Prazo de devolução", compare: (a, b) => a.due_at.localeCompare(b.due_at) },
        { value: "overdue", label: "Dias em atraso", compare: (a, b) => a.days_overdue - b.days_overdue },
      ]}
      emptyTitle="Sem empréstimos"
      emptyDescription="Registe um empréstimo a partir do acervo."
      emptyIcon="BookOpen"
    />
  );
}
