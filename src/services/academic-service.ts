import api from "./api";
import { fetchAllPages } from "./api-pagination";
import { sectionsService } from "./sections-service";
import type { AcademicSection, EducationCycle, Shift, Subject, TeacherAssignment } from "@/types";

// ---- API ----------------------------------------------------------------------------------------------------------

export interface ApiAcademicYear { id: string; name: string; status: string; start_date: string; end_date: string }
export interface ApiClassLevel { id: string; name: string; level_number: number; cycle: string }
interface ApiSubject { id: string; name: string; grading_scale: string; is_core_subject: boolean }
export interface ApiTeacher { id: string; user_id: string | null; full_name: string; email: string | null; document_number: string; status: string }
interface ApiSectionSubject {
  id: string;
  section_id: string;
  academic_year_id: string;
  subject: { id: string; name: string; is_core_subject: boolean };
  teacher: { id: string; full_name: string };
  weekly_hours: number;
}

const SHIFT_TO_API: Record<Shift, string> = { MORNING: "manha", AFTERNOON: "tarde", EVENING: "noite" };

const codeOf = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);

const toSubject = (s: ApiSubject): Subject => ({
  id: s.id,
  schoolId: "",
  name: s.name,
  code: codeOf(s.name),
  cycle: "LOWER_SECONDARY" as EducationCycle, // a disciplina nao tem ciclo na API (a matriz e por turma)
  weeklyHours: 0,
  isActive: true,
  isCore: s.is_core_subject,
  createdAt: "",
  updatedAt: "",
});

export const academicService = {
  years: () => fetchAllPages<ApiAcademicYear>("/s/academic-years"),
  activeYear: async (): Promise<ApiAcademicYear | undefined> => (await academicService.years()).find((y) => y.status === "activo"),
  classLevels: () => fetchAllPages<ApiClassLevel>("/s/class-levels"),
  teachers: () => fetchAllPages<ApiTeacher>("/s/teachers"),

  // ---- turmas ----
  sections: (): Promise<AcademicSection[]> => sectionsService.list(),

  saveSection: async (
    id: string | undefined,
    v: { name: string; classLevelName: string; shift: Shift; capacity: number },
  ): Promise<void> => {
    if (id) {
      await api.patch(`/s/sections/${id}`, { name: v.name, shift: SHIFT_TO_API[v.shift], capacity: v.capacity });
      return;
    }
    const [year, levels] = await Promise.all([academicService.activeYear(), academicService.classLevels()]);
    if (!year) throw new Error("Não há ano lectivo activo.");
    const level = levels.find((l) => l.name === v.classLevelName || `${l.level_number}ª Classe` === v.classLevelName);
    if (!level) throw new Error(`A classe "${v.classLevelName}" não existe nesta escola.`);
    await api.post("/s/sections", { academic_year_id: year.id, class_level_id: level.id, name: v.name, shift: SHIFT_TO_API[v.shift], capacity: v.capacity });
  },

  // ---- disciplinas ----
  subjects: async (): Promise<Subject[]> => (await fetchAllPages<ApiSubject>("/s/subjects")).map(toSubject),

  saveSubject: async (id: string | undefined, v: { name: string; isCore: boolean }): Promise<void> => {
    if (id) await api.patch(`/s/subjects/${id}`, { name: v.name, is_core_subject: v.isCore });
    else await api.post("/s/subjects", { name: v.name, grading_scale: "quantitativa", is_core_subject: v.isCore });
  },

  // ---- atribuicoes (disciplina x turma x professor) ----
  assignments: async (): Promise<TeacherAssignment[]> => {
    const sections = await sectionsService.list();
    const lists = await Promise.all(
      sections.map(async (sec) => ({ sec, rows: (await api.get<{ data: ApiSectionSubject[] }>(`/s/sections/${sec.id}/subjects`)).data.data })),
    );
    return lists.flatMap(({ sec, rows }) =>
      rows.map((r) => ({
        id: r.id,
        schoolId: "",
        teacherId: r.teacher.id,
        teacherName: r.teacher.full_name,
        sectionId: sec.id,
        sectionName: `${sec.classLevel} ${sec.name}`,
        subjectId: r.subject.id,
        subjectName: r.subject.name,
        weeklyHours: r.weekly_hours,
        academicYear: sec.academicYear,
        createdAt: "",
      })),
    );
  },

  assign: async (v: { sectionId: string; subjectId: string; teacherId: string; weeklyHours: number }): Promise<void> => {
    await api.post(`/s/sections/${v.sectionId}/subjects`, { subject_id: v.subjectId, teacher_id: v.teacherId, weekly_hours: v.weeklyHours });
  },

  unassign: async (sectionId: string, id: string): Promise<void> => {
    await api.delete(`/s/sections/${sectionId}/subjects/${id}`);
  },
};
