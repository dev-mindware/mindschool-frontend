"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useLibraryStore } from "@/stores/school/library-store";
import { LibraryBook, BookCondition } from "@/types";
import { toast } from "sonner";

interface NewLoanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedBook?: LibraryBook | null;
}

const SAMPLE_STUDENTS = [
  { id: "stu-01", name: "Afonso Sebastião Bento", number: "MS-2026-0012", class: "9ª Classe A" },
  { id: "stu-02", name: "Ana Beatriz Domingos", number: "MS-2026-0013", class: "9ª Classe A" },
  { id: "stu-03", name: "Carlos Daniel Kiala", number: "MS-2026-0025", class: "9ª Classe A" },
  { id: "stu-04", name: "Domingas Teresa Manuel", number: "MS-2026-0044", class: "9ª Classe A" },
  { id: "stu-05", name: "Eduardo José Van-Dúnem", number: "MS-2026-0050", class: "9ª Classe A" },
  { id: "stu-08", name: "Helena Luísa Kapita", number: "MS-2026-0038", class: "9ª Classe A" },
];

export function NewLoanModal({
  open,
  onOpenChange,
  preselectedBook,
}: NewLoanModalProps) {
  const { books, createLoan } = useLibraryStore();

  const availableBooks = books.filter((b) => b.availableCopies > 0);

  const [bookId, setBookId] = useState<string>(preselectedBook?.id || availableBooks[0]?.id || "");
  const [studentId, setStudentId] = useState<string>(SAMPLE_STUDENTS[0].id);
  const [loanDays, setLoanDays] = useState<number>(14);
  const [conditionOut, setConditionOut] = useState<BookCondition>("GOOD");
  const [notes, setNotes] = useState<string>("");

  const selectedBook = books.find((b) => b.id === bookId) || preselectedBook || availableBooks[0];
  const selectedStudent = SAMPLE_STUDENTS.find((s) => s.id === studentId) || SAMPLE_STUDENTS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) {
      toast.error("Seleccione uma obra com exemplares disponíveis.");
      return;
    }

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + loanDays);
    const dueDate = dueDateObj.toISOString().slice(0, 10);

    const loan = createLoan({
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      bookCode: selectedBook.code,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.number,
      className: selectedStudent.class,
      dueDate,
      conditionOut,
      notes: notes || "Empréstimo regular para apoio ao estudo.",
    });

    toast.success(`Empréstimo ${loan.loanNumber} registado com sucesso!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name={"BookOpen" as any} className="size-4 text-primary" />
            Novo Empréstimo na Biblioteca Escolar
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Book Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Obra / Manual a Requisitar:
            </label>
            <Select value={bookId || availableBooks[0]?.id} onValueChange={setBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione o livro" />
              </SelectTrigger>
              <SelectContent>
                {availableBooks.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.code} • {b.title} ({b.availableCopies} disp.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Estudante Requerente:
            </label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_STUDENTS.map((std) => (
                  <SelectItem key={std.id} value={std.id}>
                    {std.number} - {std.name} ({std.class})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Prazo de Devolução:
              </label>
              <Select
                value={String(loanDays)}
                onValueChange={(val) => setLoanDays(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Dias (1 Semana)</SelectItem>
                  <SelectItem value="14">14 Dias (2 Semanas)</SelectItem>
                  <SelectItem value="30">30 Dias (1 Mês)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Estado do Livro:
              </label>
              <Select
                value={conditionOut}
                onValueChange={(val: any) => setConditionOut(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Novo (Impecável)</SelectItem>
                  <SelectItem value="GOOD">Bom Estado</SelectItem>
                  <SelectItem value="WORN">Desgastado pelo Uso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Observações do Bibliotecário:
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none min-h-[60px]"
              placeholder="Ex: Utilização em projecto de pesquisa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Efectivar Empréstimo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
