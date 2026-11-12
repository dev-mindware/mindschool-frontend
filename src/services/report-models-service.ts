import api from "./api";

export type ReportFormat = "pdf" | "docx" | "xlsx";

/** Relatórios com modelo comum da API (`/report-models/*`): o mesmo documento em PDF, Word ou Excel. */
export type ReportModel =
  | "subject-grade-sheet"
  | "term-grade-sheet"
  | "performance-summary"
  | "class-roster"
  | "attendance-summary"
  | "class-timetable"
  | "tuition-balance"
  | "debtors-list"
  | "curriculum-plan"
  | "lesson-plan";

export type ReportParams = Partial<Record<"section_id" | "term_id" | "section_subject_id" | "academic_year_id" | "plan_id", string>>;

export const REPORT_FORMATS: Array<{ value: ReportFormat; label: string }> = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "Word (.docx)" },
  { value: "xlsx", label: "Excel (.xlsx)" },
];

const filenameOf = (header: unknown, fallback: string) => {
  const m = /filename="?([^";]+)"?/i.exec(typeof header === "string" ? header : "");
  return m?.[1] ?? fallback;
};

export const reportModelsService = {
  /** Gera o relatório na API e descarrega o ficheiro. */
  download: async (model: ReportModel, params: ReportParams, format: ReportFormat): Promise<void> => {
    const res = await api.get<Blob>(`/s/report-models/${model}`, { params: { ...params, format }, responseType: "blob" }).catch(async (err) => {
      // Com `responseType: "blob"` o corpo do erro também vem em Blob: lê-se para a mensagem da API chegar ao utilizador.
      const body = err?.response?.data;
      if (body instanceof Blob) {
        try { err.response.data = JSON.parse(await body.text()); } catch { /* corpo que não é JSON: mantém-se a mensagem genérica */ }
      }
      throw err;
    });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filenameOf(res.headers?.["content-disposition"], `${model}.${format}`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
