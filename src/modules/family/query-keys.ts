type Id = string | null | undefined;

/**
 * Chaves de cache (TanStack Query) do domínio Família (portal do encarregado e do aluno). Prefixo = escola/educando,
 * para poder invalidar todas as consultas de um educando de uma vez.
 */
export const familyKeys = {
  // Por escola
  wards: (school: Id) => ["portal-wards", school] as const,
  profile: (school: Id) => ["portal-profile", school] as const,
  announcements: (school: Id) => ["portal-announcements", school] as const,
  calendar: (school: Id) => ["portal-calendar", school] as const,
  exams: (school: Id) => ["portal-exams", school] as const,
  libraryBooks: (school: Id) => ["portal-library-books", school] as const,
  documentFees: (school: Id) => ["portal-document-fees", school] as const,

  // Por escola e educando
  grades: (school: Id, student: Id) => ["portal-grades", school, student] as const,
  assessments: (school: Id, student: Id) => ["portal-assessments", school, student] as const,
  invoices: (school: Id, student: Id) => ["portal-invoices", school, student] as const,
  paymentsHistory: (school: Id, student: Id) => ["portal-payments-history", school, student] as const,
  timetable: (school: Id, student: Id) => ["portal-timetable", school, student] as const,
  attendance: (school: Id, student: Id) => ["portal-attendance", school, student] as const,
  documents: (school: Id, student: Id) => ["portal-documents", school, student] as const,
  library: (school: Id, student: Id) => ["portal-library", school, student] as const,

  // Por educando
  performance: (student: Id) => ["portal-performance", student] as const,
  subjects: (student: Id) => ["portal-subjects", student] as const,
  statement: (student: Id, year: string | number) => ["portal-statement", student, year] as const,
};
