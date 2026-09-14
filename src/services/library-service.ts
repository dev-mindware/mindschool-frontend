import api from "./api";
import { LibraryBook, BookLoan } from "@/types";

export const libraryService = {
  getBooks: async (params?: { search?: string; category?: string }): Promise<LibraryBook[]> => {
    const response = await api.get<LibraryBook[]>("/academic/library/books", { params });
    return response.data;
  },

  createBook: async (data: Partial<LibraryBook>): Promise<LibraryBook> => {
    const response = await api.post<LibraryBook>("/academic/library/books", data);
    return response.data;
  },

  getLoans: async (params?: { status?: string; studentId?: string }): Promise<BookLoan[]> => {
    const response = await api.get<BookLoan[]>("/academic/library/loans", { params });
    return response.data;
  },

  createLoan: async (data: Partial<BookLoan>): Promise<BookLoan> => {
    const response = await api.post<BookLoan>("/academic/library/loans", data);
    return response.data;
  },

  returnLoan: async (loanId: string): Promise<BookLoan> => {
    const response = await api.patch<BookLoan>(`/academic/library/loans/${loanId}/return`);
    return response.data;
  },
};
