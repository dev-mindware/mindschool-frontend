type School = string | null | undefined;

/**
 * Chaves de cache (TanStack Query) do domínio Finanças. Um só sítio para as criar e invalidar: o prefixo de cada chave
 * (escola, entidade) é o que permite invalidar um conjunto de consultas de uma vez.
 */
export const financeKeys = {
  bankAccounts: (school: School) => ["bank-accounts", school] as const,
  fees: (school: School) => ["tuition-fees", school] as const,
  feesAll: () => ["tuition-fees"] as const,
  plans: (school: School) => ["tuition-plans", school] as const,
  invoices: (school: School) => ["school-invoices", school] as const,
  documents: (school: School) => ["fiscal-documents", school] as const,
  documentFees: (school: School) => ["document-fees", school] as const,
  overview: (school: School, academicYearId?: string) => ["finance-overview", school, academicYearId] as const,
  overviewAll: (school: School) => ["finance-overview", school] as const,

  submissions: (school: School) => ["tuition-submissions", school] as const,
  submissionsList: (school: School) => ["tuition-submissions", school, "list"] as const,
  submissionsSummary: (school: School) => ["tuition-submissions", school, "summary"] as const,

  // Portal da família (pagamentos do encarregado)
  portalBanks: (school: School) => ["portal-banks", school] as const,
  portalPay: (school: School, student: string | null | undefined) => ["portal-pay", school, student] as const,
  portalPayables: (school: School, student: string | null | undefined) => ["portal-pay", school, student, "payables"] as const,
  portalSubmissions: (school: School, student: string | null | undefined) => ["portal-pay", school, student, "submissions"] as const,

  // Emails (escola e plataforma)
  schoolEmailLog: (school: School) => ["school-email-log", school] as const,
  schoolEmailStats: (school: School) => ["school-email-stats", school] as const,
  adminEmailTemplates: () => ["admin-email-templates"] as const,
  adminEmailLog: () => ["admin-email-log"] as const,
  adminEmailStats: () => ["admin-email-stats"] as const,
};
