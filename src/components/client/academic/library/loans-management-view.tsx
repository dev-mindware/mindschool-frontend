"use client";

import React from "react";
import { useLibraryStore } from "@/stores/school/library-store";
import { BookLoan, LoanStatus, BookCondition } from "@/types";
import { Button, Icon } from "@/components";
import { FilterPopover } from "@/components/shared";
import { SchoolStatusBadge } from "@/components/common/school-status-badge";
import { toast } from "sonner";

interface LoansManagementViewProps {
  onOpenNewLoanModal: () => void;
}

const LOAN_STATUS_OPTIONS = [
  { value: "ALL", label: "Todos os Estados" },
  { value: "ACTIVE", label: "Em Curso" },
  { value: "OVERDUE", label: "Vencidos" },
  { value: "RETURNED", label: "Devolvidos" },
  { value: "LOST", label: "Extraviados" },
];

export function LoansManagementView({ onOpenNewLoanModal }: LoansManagementViewProps) {
  const {
    loans,
    loanStatusFilter,
    setLoanStatusFilter,
    returnLoan,
    renewLoan,
  } = useLibraryStore();

  const filteredLoans = loans.filter((l) => {
    if (loanStatusFilter !== "ALL" && l.status !== loanStatusFilter) return false;
    return true;
  });

  const handleReturn = (loanId: string) => {
    const isDamaged = confirm("O exemplar foi devolvido em bom estado? (Clique OK para Bom Estado, Cancelar para Danificado)");
    const condition: BookCondition = isDamaged ? "GOOD" : "DAMAGED";
    const fine = isDamaged ? 0 : 2000;

    returnLoan(loanId, condition, fine, isDamaged ? "Devolução regular" : "Exemplar devolvido com danos na capa");
    toast.success("Devolução registada com sucesso!");
  };

  const handleRenew = (loanId: string) => {
    renewLoan(loanId, 7);
    toast.success("Empréstimo renovado por mais 7 dias úteis!");
  };

  return (
    <div className="space-y-4">
      {/* MindGest Standard Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FilterPopover
            label="Estado"
            icon="ListFilter"
            options={LOAN_STATUS_OPTIONS}
            value={loanStatusFilter === "ALL" ? null : loanStatusFilter}
            onChange={(val) => setLoanStatusFilter((val as LoanStatus) ?? "ALL")}
          />

          {loanStatusFilter !== "ALL" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLoanStatusFilter("ALL")}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <Button onClick={onOpenNewLoanModal} size="sm" className="gap-1.5 text-xs h-9 shrink-0 shadow-xs">
          <Icon name="Plus" className="size-3.5" />
          Novo Empréstimo
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="w-32 px-4 py-3">Nº Empréstimo</th>
                <th className="min-w-[220px] px-4 py-3">Obra / Manual Requisitado</th>
                <th className="min-w-[200px] px-4 py-3">Estudante / Turma</th>
                <th className="w-28 px-4 py-3 text-center">Data Saída</th>
                <th className="w-28 px-4 py-3 text-center">Data Limite</th>
                <th className="w-28 px-4 py-3 text-center">Estado</th>
                <th className="w-40 px-4 py-3 text-right">Acções de Balcão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    Nenhum empréstimo registado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isFinished = loan.status === "RETURNED" || loan.status === "LOST";

                  return (
                    <tr key={loan.id} className="hover:bg-muted/10 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3 font-mono font-medium text-primary">
                        {loan.loanNumber}
                      </td>

                      {/* Book */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {loan.bookTitle}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {loan.bookCode}
                        </span>
                      </td>

                      {/* Student */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {loan.studentName}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {loan.studentNumber} • {loan.className}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3 text-center font-mono">
                        {new Date(loan.borrowedAt).toLocaleDateString("pt-PT")}
                      </td>

                      <td className="px-4 py-3 text-center font-mono">
                        <span className={loan.status === "OVERDUE" ? "text-rose-600 font-medium" : ""}>
                          {new Date(loan.dueDate).toLocaleDateString("pt-PT")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <SchoolStatusBadge status={loan.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {!isFinished ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRenew(loan.id)}
                              className="h-7 text-[11px] px-2 border-border text-foreground hover:bg-muted"
                              title="Prorrogar prazo por mais 7 dias"
                            >
                              Renovar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReturn(loan.id)}
                              className="h-7 text-[11px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="Concluir devolução da obra"
                            >
                              Devolver
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Devolvido em {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString("pt-PT") : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
