export type BookCategory =
  | "MED_TEXTBOOK"          // Manual Escolar do Ministério da Educação (MED)
  | "ANGOLAN_LITERATURE"     // Literatura Angolana & Africana
  | "WORLD_LITERATURE"       // Literatura Universal & Clássicos
  | "SCIENCE_TECH"           // Ciências Exatas & Tecnologias
  | "REFERENCE";             // Dicionários, Enciclopédias & Atlas

export type BookCondition = "NEW" | "GOOD" | "WORN" | "DAMAGED";

export type LoanStatus = "ACTIVE" | "RETURNED" | "OVERDUE" | "LOST";

export interface LibraryBook {
  id: string;
  code: string; // e.g. "MED-MAT-09-01" or "LIT-ANG-042"
  title: string;
  author: string;
  publisher?: string;
  isbn?: string;
  category: BookCategory;
  categoryLabel: string;
  targetGrade?: string; // e.g. "9ª Classe", "10ª Classe", "Geral"
  shelfLocation: string; // e.g. "Estante B, Prateleira 3"
  totalCopies: number;
  availableCopies: number;
  isMedTextbook: boolean;
  editionYear?: number;
}

export interface BookLoan {
  id: string;
  loanNumber: string; // e.g. "EMP-2026/0082"
  bookId: string;
  bookTitle: string;
  bookCode: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  className: string;
  borrowedAt: string; // YYYY-MM-DD
  dueDate: string;    // YYYY-MM-DD
  returnedAt?: string; // YYYY-MM-DD
  status: LoanStatus;
  conditionOut: BookCondition;
  conditionIn?: BookCondition;
  fineAmountKz?: number;
  notes?: string;
}

export interface StudentClearanceStatus {
  studentId: string;
  studentName: string;
  studentNumber: string;
  className: string;
  isCleared: boolean;
  pendingLoansCount: number;
  pendingBooks: {
    bookTitle: string;
    dueDate: string;
    isOverdue: boolean;
  }[];
}
