import api from "./api";
import { fetchAllPages } from "./api-pagination";

export interface ApiBook {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string | null;
  location: string | null;
  copies_total: number;
  copies_on_loan: number;
  copies_available: number;
  is_active: boolean;
}

export interface ApiLoan {
  id: string;
  book_id: string;
  student_id: string | null;
  teacher_id: string | null;
  status: "emprestado" | "devolvido";
  loaned_at: string;
  due_at: string;
  returned_at: string | null;
  renewals: number;
  notes: string | null;
  overdue: boolean;
  days_overdue: number;
}

export interface NewBook {
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  location?: string;
  copies: number;
}

export const libraryService = {
  books: () => fetchAllPages<ApiBook>("/s/library/books"),
  loans: () => fetchAllPages<ApiLoan>("/s/library/loans"),
  createBook: async (v: NewBook) =>
    (await api.post<ApiBook>("/s/library/books", {
      title: v.title, author: v.author, copies_total: v.copies,
      ...(v.isbn ? { isbn: v.isbn } : {}), ...(v.category ? { category: v.category } : {}), ...(v.location ? { location: v.location } : {}),
    })).data,
  lend: async (v: { bookId: string; studentId?: string; teacherId?: string; days?: number }) =>
    (await api.post<ApiLoan>("/s/library/loans", {
      book_id: v.bookId, ...(v.studentId ? { student_id: v.studentId } : {}), ...(v.teacherId ? { teacher_id: v.teacherId } : {}), ...(v.days ? { due_in_days: v.days } : {}),
    })).data,
  giveBack: async (id: string) => (await api.post<ApiLoan>(`/s/library/loans/${id}/return`, {})).data,
  renew: async (id: string) => (await api.post<ApiLoan>(`/s/library/loans/${id}/renew`, {})).data,

  // pedidos feitos no portal pelos encarregados e alunos
  requests: async (status?: ApiLibraryRequestStatus): Promise<ApiLibraryRequest[]> =>
    (await api.get<{ data: ApiLibraryRequest[] }>("/s/library/requests", { params: status ? { status } : {} })).data.data,
  approveRequest: async (id: string, days?: number) => (await api.post<ApiLibraryRequest>(`/s/library/requests/${id}/approve`, days ? { due_in_days: days } : {})).data,
  rejectRequest: async (id: string, reason: string) => (await api.post<ApiLibraryRequest>(`/s/library/requests/${id}/reject`, { reason })).data,
};

export type ApiLibraryRequestStatus = "pedido" | "aprovado" | "recusado" | "cancelado";
export interface ApiLibraryRequest {
  id: string; status: ApiLibraryRequestStatus; book_id: string; book_title: string; book_author: string; student_id: string; student_name: string;
  notes: string | null; decision_reason: string | null; decided_at: string | null; created_at: string; loan: { id: string; due_at: string } | null;
}
