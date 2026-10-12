import api from "./api";
import { fileNameFrom, saveBlob } from "@/utils/download";
import { ApiPauta, ApiPautaRow, ApiTerm, SEQUENCE_OF_TERM, gradesService, num } from "./grades-service";
import type { AssessmentTerm, ConsolidatedPauta, ConsolidatedStudentRow } from "@/types/grade";

interface ApiPautaFull extends ApiPauta {
  section: { id: string; name: string; class_level: { id: string; name: string } };
  subjects: Array<{ section_subject_id: string; subject: { id: string; name: string } }>;
  closed_at: string | null;
  closed_by: string | null;
  rows: Array<ApiPautaRow & { student: { id: string; full_name: string }; complete: boolean }>;
}

async function termId(term: AssessmentTerm): Promise<string> {
  const t = (await gradesService.terms()).find((x) => x.sequence === SEQUENCE_OF_TERM[term]);
  if (!t) throw new Error("Período inexistente.");
  return t.id;
}

export const pautasService = {
  /** Pauta consolidada de uma turma num trimestre (MAC, MAS e MT por disciplina, calculados pela API). */
  consolidated: async (sectionId: string, term: AssessmentTerm, terms: ApiTerm[]): Promise<ConsolidatedPauta | null> => {
    const t = terms.find((x) => x.sequence === SEQUENCE_OF_TERM[term]);
    if (!t) return null;
    const p = (await api.get<ApiPautaFull>(`/s/sections/${sectionId}/pauta/${t.id}`)).data;
    const subjectOfSs = new Map(p.subjects.map((s) => [s.section_subject_id, s.subject.id]));
    const students: ConsolidatedStudentRow[] = p.rows.map((r) => {
      const subjects: ConsolidatedStudentRow["subjects"] = {};
      const mts: number[] = [];
      for (const [ssId, m] of Object.entries(r.marks)) {
        const sid = subjectOfSs.get(ssId);
        if (!sid || !m) continue;
        subjects[sid] = { mac: num(m.mac), mas: num(m.mas), mt: num(m.mt) };
        if (m.mt !== null) mts.push(Number(m.mt));
      }
      return {
        id: r.enrollment_id,
        studentId: r.student.id,
        studentName: r.student.full_name,
        studentNumber: "",
        subjects,
        termAverageTotal: mts.length ? Number((mts.reduce((a, b) => a + b, 0) / mts.length).toFixed(1)) : 0,
        failedSubjectsCount: mts.filter((v) => v < 10).length,
        transitionStatus: "PENDING",
      };
    });
    const avgs = students.filter((s) => s.termAverageTotal > 0);
    return {
      id: `${sectionId}:${term}`,
      schoolId: "",
      sectionId,
      sectionName: p.section.name,
      classLevel: p.section.class_level.name,
      shift: "",
      term,
      academicYear: "",
      isClosed: p.status === "fechada",
      closedAt: p.closed_at ?? undefined,
      closedBy: p.closed_by ?? undefined,
      students,
      missingGradesCount: p.summary.missing_grades_count,
      averageClassScore: avgs.length ? Number((avgs.reduce((a, s) => a + s.termAverageTotal, 0) / avgs.length).toFixed(1)) : 0,
      approvalRate: students.length
        ? Number(((students.filter((s) => s.termAverageTotal >= 10 && s.failedSubjectsCount === 0).length / students.length) * 100).toFixed(1))
        : 0,
    };
  },

  close: async (sectionId: string, term: AssessmentTerm, notes?: string): Promise<void> => {
    await api.post(`/s/sections/${sectionId}/pauta/${await termId(term)}/close`, notes ? { notes } : {});
  },

  reopen: async (sectionId: string, term: AssessmentTerm, reason: string): Promise<void> => {
    await api.post(`/s/sections/${sectionId}/pauta/${await termId(term)}/reopen`, { reason });
  },

  /** Pauta oficial (instantâneo da última versão fechada) em PDF ou Excel, com a identidade da escola. */
  download: async (sectionId: string, term: AssessmentTerm, format: "pdf" | "xlsx"): Promise<void> => {
    const res = await api.get<Blob>(`/s/sections/${sectionId}/pauta/${await termId(term)}/${format}`, { responseType: "blob" });
    saveBlob(res.data, fileNameFrom(res.headers["content-disposition"], `pauta.${format}`));
  },
};
