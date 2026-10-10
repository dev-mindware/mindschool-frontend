"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryService, type ApiBook, type ApiLoan, type NewBook } from "@/services/library-service";
import { studentsService } from "@/services/students-service";
import { academicService } from "@/services/academic-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Biblioteca da escola activa: acervo, emprestimos (alunos e professores), devolucao e renovacao. */
export function useLibrary() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: books = [], isLoading: loadingBooks } = useQuery({ queryKey: ["library-books", schoolId], queryFn: libraryService.books, enabled: Boolean(schoolId), staleTime: 30 * 1000 });
  const { data: loans = [], isLoading: loadingLoans } = useQuery({ queryKey: ["library-loans", schoolId], queryFn: libraryService.loans, enabled: Boolean(schoolId), staleTime: 15 * 1000 });
  const { data: students = [] } = useQuery({ queryKey: ["students", schoolId], queryFn: () => studentsService.list(), enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers", schoolId], queryFn: academicService.teachers, enabled: Boolean(schoolId), staleTime: 60 * 1000 });

  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const readerName = useMemo(() => {
    const s = new Map(students.map((x) => [x.id, x.fullName]));
    const t = new Map(teachers.map((x) => [x.id, x.full_name]));
    return (l: ApiLoan) => (l.student_id ? s.get(l.student_id) : l.teacher_id ? t.get(l.teacher_id) : undefined) ?? "—";
  }, [students, teachers]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? books.filter((b: ApiBook) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.isbn ?? "").includes(q)) : books;
  }, [books, searchQuery]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["library-books", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["library-loans", schoolId] });
  };
  const createBook = useMutation({ mutationFn: (v: NewBook) => libraryService.createBook(v), onSuccess: refresh });
  const lend = useMutation({ mutationFn: libraryService.lend, onSuccess: refresh });
  const giveBack = useMutation({ mutationFn: libraryService.giveBack, onSuccess: refresh });
  const renew = useMutation({ mutationFn: libraryService.renew, onSuccess: refresh });

  const active = loans.filter((l) => l.status === "emprestado");
  const metrics = {
    titles: books.length,
    copies: books.reduce((a, b) => a + b.copies_total, 0),
    active: active.length,
    overdue: active.filter((l) => l.overdue).length,
  };

  return {
    books: filteredBooks, allBooks: books, loans, activeLoans: active, students, teachers, bookById, readerName, metrics,
    isLoading: loadingBooks || loadingLoans, searchQuery, setSearchQuery, createBook, lend, giveBack, renew,
  };
}
