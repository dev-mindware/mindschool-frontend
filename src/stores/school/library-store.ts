import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LibraryBook,
  BookLoan,
  BookCategory,
  BookCondition,
  LoanStatus,
  StudentClearanceStatus,
} from "@/types";

interface LibraryState {
  books: LibraryBook[];
  loans: BookLoan[];
  searchQuery: string;
  categoryFilter: string;
  loanStatusFilter: string;

  // Actions
  setSearchQuery: (q: string) => void;
  setCategoryFilter: (c: string) => void;
  setLoanStatusFilter: (s: string) => void;

  addBook: (bookData: Omit<LibraryBook, "id">) => LibraryBook;
  createLoan: (
    data: Omit<BookLoan, "id" | "loanNumber" | "borrowedAt" | "status">
  ) => BookLoan;
  returnLoan: (
    loanId: string,
    conditionIn: BookCondition,
    fineAmountKz?: number,
    notes?: string
  ) => void;
  renewLoan: (loanId: string, days?: number) => void;
  checkStudentClearance: (studentId: string) => StudentClearanceStatus;
}

const INITIAL_BOOKS: LibraryBook[] = [
  {
    id: "bk-01",
    code: "MED-MAT-09",
    title: "Manual de Matemática - 9ª Classe",
    author: "Equipa Técnica do INIDE / MED",
    publisher: "Editora Moderna Angola",
    isbn: "978-989-762-011-4",
    category: "MED_TEXTBOOK",
    categoryLabel: "Manual Escolar do MED",
    targetGrade: "9ª Classe",
    shelfLocation: "Estante A, Prateleira 1",
    totalCopies: 60,
    availableCopies: 52,
    isMedTextbook: true,
    editionYear: 2023,
  },
  {
    id: "bk-02",
    code: "MED-POR-09",
    title: "Manual de Língua Portuguesa - 9ª Classe",
    author: "INIDE / Ministério da Educação",
    publisher: "Porto Editora Angola",
    isbn: "978-989-762-012-1",
    category: "MED_TEXTBOOK",
    categoryLabel: "Manual Escolar do MED",
    targetGrade: "9ª Classe",
    shelfLocation: "Estante A, Prateleira 2",
    totalCopies: 60,
    availableCopies: 54,
    isMedTextbook: true,
    editionYear: 2023,
  },
  {
    id: "bk-03",
    code: "MED-FIS-10",
    title: "Manual de Física - 10ª Classe",
    author: "Coordenação Nacional de Física - MED",
    publisher: "Texto Editores",
    isbn: "978-989-800-145-8",
    category: "MED_TEXTBOOK",
    categoryLabel: "Manual Escolar do MED",
    targetGrade: "10ª Classe",
    shelfLocation: "Estante A, Prateleira 3",
    totalCopies: 45,
    availableCopies: 38,
    isMedTextbook: true,
    editionYear: 2024,
  },
  {
    id: "bk-04",
    code: "LIT-ANG-01",
    title: "Mayombe",
    author: "Pepetela",
    publisher: "União dos Escritores Angolanos",
    isbn: "978-972-20-4100-2",
    category: "ANGOLAN_LITERATURE",
    categoryLabel: "Literatura Angolana & Africana",
    targetGrade: "Geral (II Ciclo)",
    shelfLocation: "Estante C, Prateleira 2",
    totalCopies: 25,
    availableCopies: 19,
    isMedTextbook: false,
    editionYear: 2020,
  },
  {
    id: "bk-05",
    code: "LIT-ANG-02",
    title: "A Vida Verdadeira de Domingos Xavier",
    author: "José Luandino Vieira",
    publisher: "Editora das Letras",
    isbn: "978-989-700-112-0",
    category: "ANGOLAN_LITERATURE",
    categoryLabel: "Literatura Angolana & Africana",
    targetGrade: "Geral (I e II Ciclos)",
    shelfLocation: "Estante C, Prateleira 1",
    totalCopies: 20,
    availableCopies: 18,
    isMedTextbook: false,
    editionYear: 2019,
  },
  {
    id: "bk-06",
    code: "LIT-ANG-03",
    title: "Sagrada Esperança",
    author: "Dr. António Agostinho Neto",
    publisher: "INALD",
    isbn: "978-972-21-0021-1",
    category: "ANGOLAN_LITERATURE",
    categoryLabel: "Literatura Angolana & Africana",
    targetGrade: "Geral",
    shelfLocation: "Estante C, Prateleira 3",
    totalCopies: 30,
    availableCopies: 26,
    isMedTextbook: false,
    editionYear: 2021,
  },
  {
    id: "bk-07",
    code: "REF-DIC-01",
    title: "Dicionário da Língua Portuguesa Contemporânea",
    author: "Academia das Ciências / Porto Editora",
    publisher: "Porto Editora",
    isbn: "978-972-0-01456-7",
    category: "REFERENCE",
    categoryLabel: "Dicionários & Enciclopédias",
    targetGrade: "Consulta Geral",
    shelfLocation: "Estante D, Prateleira 1",
    totalCopies: 10,
    availableCopies: 9,
    isMedTextbook: false,
    editionYear: 2022,
  },
];

const INITIAL_LOANS: BookLoan[] = [
  {
    id: "loan-81",
    loanNumber: "EMP-2026/0081",
    bookId: "bk-01",
    bookTitle: "Manual de Matemática - 9ª Classe",
    bookCode: "MED-MAT-09",
    studentId: "std-01",
    studentName: "Afonso Sebastião Bento",
    studentNumber: "Nº 01",
    className: "9ª Classe A",
    borrowedAt: "2026-03-01",
    dueDate: "2026-03-15",
    status: "ACTIVE",
    conditionOut: "GOOD",
    notes: "Manual escolar anual entregue para uso lectivo.",
  },
  {
    id: "loan-82",
    loanNumber: "EMP-2026/0082",
    bookId: "bk-04",
    bookTitle: "Mayombe",
    bookCode: "LIT-ANG-01",
    studentId: "std-03",
    studentName: "Carlos Daniel Kiala",
    studentNumber: "Nº 03",
    className: "9ª Classe A",
    borrowedAt: "2026-02-15",
    dueDate: "2026-03-01",
    status: "OVERDUE",
    conditionOut: "GOOD",
    notes: "Prazo de leitura expirado há mais de 8 dias.",
  },
  {
    id: "loan-83",
    loanNumber: "EMP-2026/0083",
    bookId: "bk-06",
    bookTitle: "Sagrada Esperança",
    bookCode: "LIT-ANG-03",
    studentId: "std-02",
    studentName: "Ana Beatriz Domingos",
    studentNumber: "Nº 02",
    className: "9ª Classe A",
    borrowedAt: "2026-02-20",
    dueDate: "2026-03-06",
    returnedAt: "2026-03-05",
    status: "RETURNED",
    conditionOut: "GOOD",
    conditionIn: "GOOD",
    notes: "Devolvido no prazo e em perfeito estado.",
  },
];

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      books: INITIAL_BOOKS,
      loans: INITIAL_LOANS,
      searchQuery: "",
      categoryFilter: "ALL",
      loanStatusFilter: "ALL",

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
      setLoanStatusFilter: (loanStatusFilter) => set({ loanStatusFilter }),

      addBook: (bookData) => {
        const newBook: LibraryBook = {
          ...bookData,
          id: `bk-${Date.now()}`,
          availableCopies: bookData.totalCopies,
        };

        set((state) => ({
          books: [newBook, ...state.books],
        }));

        return newBook;
      },

      createLoan: (data) => {
        const currentYear = new Date().getFullYear();
        const nextNum = get().loans.length + 84;
        const loanNumber = `EMP-${currentYear}/${String(nextNum).padStart(4, "0")}`;
        const borrowedAt = new Date().toISOString().slice(0, 10);

        const newLoan: BookLoan = {
          ...data,
          id: `loan-${Date.now()}`,
          loanNumber,
          borrowedAt,
          status: "ACTIVE",
        };

        set((state) => ({
          loans: [newLoan, ...state.loans],
          books: state.books.map((b) =>
            b.id === data.bookId
              ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
              : b
          ),
        }));

        return newLoan;
      },

      returnLoan: (loanId, conditionIn, fineAmountKz, notes) => {
        const targetLoan = get().loans.find((l) => l.id === loanId);
        if (!targetLoan) return;

        const returnedAt = new Date().toISOString().slice(0, 10);

        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  status: "RETURNED" as LoanStatus,
                  returnedAt,
                  conditionIn,
                  fineAmountKz,
                  notes: notes !== undefined ? notes : l.notes,
                }
              : l
          ),
          books: state.books.map((b) =>
            b.id === targetLoan.bookId
              ? { ...b, availableCopies: b.availableCopies + 1 }
              : b
          ),
        }));
      },

      renewLoan: (loanId, days = 7) => {
        set((state) => ({
          loans: state.loans.map((l) => {
            if (l.id !== loanId) return l;
            const currentDue = new Date(l.dueDate);
            currentDue.setDate(currentDue.getDate() + days);
            return {
              ...l,
              dueDate: currentDue.toISOString().slice(0, 10),
              status: "ACTIVE" as LoanStatus,
            };
          }),
        }));
      },

      checkStudentClearance: (studentId) => {
        const { loans } = get();
        const today = new Date().toISOString().slice(0, 10);

        // Find any active or overdue loans for this student
        const pendingLoans = loans.filter(
          (l) => l.studentId === studentId && (l.status === "ACTIVE" || l.status === "OVERDUE")
        );

        const isCleared = pendingLoans.length === 0;

        const pendingBooks = pendingLoans.map((l) => ({
          bookTitle: l.bookTitle,
          dueDate: l.dueDate,
          isOverdue: l.dueDate < today || l.status === "OVERDUE",
        }));

        const firstPending = pendingLoans[0];
        const studentName = firstPending?.studentName || "Afonso Sebastião Bento";
        const studentNumber = firstPending?.studentNumber || "Nº 01";
        const className = firstPending?.className || "9ª Classe A";

        return {
          studentId,
          studentName,
          studentNumber,
          className,
          isCleared,
          pendingLoansCount: pendingLoans.length,
          pendingBooks,
        };
      },
    }),
    {
      name: "mindschool-library-storage",
    }
  )
);
