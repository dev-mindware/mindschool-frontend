import api from "./api";
import { fetchAllPages } from "./api-pagination";
import { academicService } from "./academic-service";
import { enrollmentsService } from "./enrollments-service";
import type { AssessmentTerm, ClassSubjectGradeSheet, StudentGradeEntry } from "@/types/grade";

// ---- API ----------------------------------------------------------------------------------------------------------

export interface ApiTerm { id: string; academic_year_id: string; sequence: number; start_date: string; end_date: string }
interface ApiAssessment { id: string; type: "avaliacao_continua" | "avaliacao_sistematica" | "prova_periodica"; term_id: string; date: string }
interface ApiGradeRow { enrollment_id: string; student: { id: string; full_name: string }; numeric_value: string | null; status: string | null }
export interface ApiPautaRow { enrollment_id: string; marks: Record<string, { mac: string | null; mas: string | null; mt: string | null; status: string; no_evaluation?: boolean } | null> }
export interface ApiPauta { status: "aberta" | "fechada" | "reaberta"; rows: ApiPautaRow[]; summary: { missing_grades_count: number; ready_to_close: boolean } }

export type GradeState = "avaliado" | "ausente" | "dispensado" | "nao_avaliado";
export type GradeField = "continuousAssessment" | "teacherTest" | "termExam";

/** Campos do formulario -> tipo de avaliacao da API (uma avaliacao por tipo e periodo). */
const TYPE_OF_FIELD: Record<GradeField, ApiAssessment["type"]> = {
  continuousAssessment: "avaliacao_continua",
  teacherTest: "avaliacao_sistematica",
  termExam: "prova_periodica",
};

export const SEQUENCE_OF_TERM: Record<AssessmentTerm, number> = { TRIMESTER_1: 1, TRIMESTER_2: 2, TRIMESTER_3: 3 };
export const TERM_OF_SEQUENCE: Record<number, AssessmentTerm> = { 1: "TRIMESTER_1", 2: "TRIMESTER_2", 3: "TRIMESTER_3" };

export const num = (v: string | null | undefined): number | undefined => (v === null || v === undefined ? undefined : Number(v));

export interface GradeSheetResult {
  sheet: ClassSubjectGradeSheet;
  pautaStatus: ApiPauta["status"];
  sectionSubjectId: string;
  termId: string;
}

export const gradesService = {
  terms: async (): Promise<ApiTerm[]> => {
    const year = await academicService.activeYear();
    return year ? fetchAllPages<ApiTerm>(`/s/academic-years/${year.id}/terms`) : [];
  },

  /** Cria os 3 trimestres do ano letivo ativo (só quando ainda não tem períodos). */
  createDefaultTerms: async (): Promise<void> => {
    const year = await academicService.activeYear();
    if (!year) throw new Error("Não há ano letivo ativo.");
    await api.post(`/s/academic-years/${year.id}/terms/defaults`);
  },

  async resolve(sectionId: string, subjectId: string, term: AssessmentTerm) {
    const [terms, assignments] = await Promise.all([gradesService.terms(), academicService.assignments()]);
    const t = terms.find((x) => x.sequence === SEQUENCE_OF_TERM[term]);
    const asg = assignments.find((a) => a.sectionId === sectionId && a.subjectId === subjectId);
    return { term: t, assignment: asg };
  },

  pauta: async (sectionId: string, termId: string): Promise<ApiPauta> => (await api.get<ApiPauta>(`/s/sections/${sectionId}/pauta/${termId}`)).data,

  /** Mini-pauta (disciplina x turma x periodo) montada a partir das avaliacoes, notas e mini-pautas calculadas pela API. */
  sheet: async (sectionId: string, subjectId: string, term: AssessmentTerm): Promise<GradeSheetResult | null> => {
    const { term: t, assignment } = await gradesService.resolve(sectionId, subjectId, term);
    if (!t || !assignment) return null;
    const assessments = (await api.get<{ data: ApiAssessment[] }>(`/s/sections/${sectionId}/subjects/${assignment.id}/assessments`, { params: { term_id: t.id } })).data.data;
    const byType = new Map(assessments.map((a) => [a.type, a]));
    const gradeLists = await Promise.all(
      (Object.keys(TYPE_OF_FIELD) as GradeField[]).map(async (field) => {
        const a = byType.get(TYPE_OF_FIELD[field]);
        const rows = a ? (await api.get<{ data: ApiGradeRow[] }>(`/s/assessments/${a.id}/grades`)).data.data : [];
        return [field, new Map(rows.map((r) => [r.enrollment_id, r]))] as const;
      }),
    );
    const grades = new Map(gradeLists);
    const pauta = await gradesService.pauta(sectionId, t.id);
    const marks = new Map(pauta.rows.map((r) => [r.enrollment_id, r.marks[assignment.id]]));
    const enrollments = (await enrollmentsService.list()).filter((e) => e.sectionId === sectionId && e.status === "ACTIVE");
    const roster = enrollments.map((e) => [e.id, { full_name: e.studentName }] as const);
    const numbers = new Map(enrollments.map((e) => [e.id, e.studentNumber] as const));

    const entries: StudentGradeEntry[] = roster.map(([enrollmentId, st]) => {
      const m = marks.get(enrollmentId);
      return {
        id: enrollmentId,
        studentId: enrollmentId, // as notas identificam-se pela MATRICULA
        studentName: st.full_name,
        studentNumber: numbers.get(enrollmentId) ?? "",
        continuousAssessment: num(grades.get("continuousAssessment")?.get(enrollmentId)?.numeric_value),
        teacherTest: num(grades.get("teacherTest")?.get(enrollmentId)?.numeric_value),
        termExam: num(grades.get("termExam")?.get(enrollmentId)?.numeric_value),
        statuses: Object.fromEntries((["continuousAssessment", "teacherTest", "termExam"] as GradeField[]).map((f) => [f, (grades.get(f)?.get(enrollmentId)?.status ?? "avaliado") as GradeState])),
        systematicAverage: m ? num(m.mas) : undefined,
        termAverage: m ? num(m.mt) : undefined,
      };
    });

    return {
      pautaStatus: pauta.status,
      sectionSubjectId: assignment.id,
      termId: t.id,
      sheet: {
        id: `${sectionId}:${subjectId}:${term}`,
        schoolId: "",
        sectionId,
        sectionName: assignment.sectionName,
        classLevel: "",
        subjectId,
        subjectName: assignment.subjectName,
        teacherId: assignment.teacherId,
        teacherName: assignment.teacherName,
        term,
        academicYear: "",
        isLocked: pauta.status === "fechada",
        entries,
        updatedAt: new Date().toISOString(),
      },
    };
  },

  /** Lanca/corrige uma nota; cria a avaliacao do tipo se ainda nao existir (data dentro do periodo). */
  saveGrade: async (v: { sectionId: string; subjectId: string; term: AssessmentTerm; enrollmentId: string; field: GradeField; value?: number; status?: GradeState }): Promise<void> => {
    const { term: t, assignment } = await gradesService.resolve(v.sectionId, v.subjectId, v.term);
    if (!t || !assignment) throw new Error("A disciplina não está atribuída a esta turma ou o período não existe.");
    const type = TYPE_OF_FIELD[v.field];
    const list = (await api.get<{ data: ApiAssessment[] }>(`/s/sections/${v.sectionId}/subjects/${assignment.id}/assessments`, { params: { term_id: t.id } })).data.data;
    let assessment = list.find((a) => a.type === type);
    if (!assessment) {
      const today = new Date().toISOString().slice(0, 10);
      const date = today < t.start_date ? t.start_date : today > t.end_date ? t.end_date : today;
      assessment = (await api.post<ApiAssessment>(`/s/sections/${v.sectionId}/subjects/${assignment.id}/assessments`, { term_id: t.id, type, date, weight: 1 })).data;
    }
    await api.put(`/s/assessments/${assessment.id}/grades`, { grades: [v.status && v.status !== "avaliado" ? { enrollment_id: v.enrollmentId, status: v.status } : { enrollment_id: v.enrollmentId, numeric_value: v.value }] });
  },
};
