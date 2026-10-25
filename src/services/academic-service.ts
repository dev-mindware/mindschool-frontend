import api from "./api";
import { fetchAllPages } from "./api-pagination";
import { sectionsService } from "./sections-service";
import type { AcademicYearDraft } from "@/lib/academic-year";
import type { AcademicSection, EducationCycle, Shift, Subject, TeacherAssignment } from "@/types";

// ---- API ----------------------------------------------------------------------------------------------------------

export interface ApiAcademicYear { id: string; name: string; status: string; start_date: string; end_date: string }
export interface ApiClassLevel { id: string; name: string; level_number: number; cycle: string }
interface ApiSubject { id: string; name: string; code?: string | null; grading_scale: string; is_core_subject: boolean }
export interface ApiTeacher { id: string; user_id: string | null; full_name: string; email: string | null; document_number: string; status: string }
interface ApiSectionSubject {
  id: string;
  section_id: string;
  academic_year_id: string;
  subject: { id: string; name: string; is_core_subject: boolean };
  teacher: { id: string; user_id?: string | null; full_name: string };
  weekly_hours: number;
}

const SHIFT_TO_API: Record<Shift, string> = { MORNING: "manha", AFTERNOON: "tarde", EVENING: "noite", DIURNO: "diurno" };

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
  code: s.code || codeOf(s.name), // a sigla guardada; sem ela, deriva-se do nome
  cycle: "LOWER_SECONDARY" as EducationCycle, // a disciplina nao tem ciclo na API (a matriz e por turma)
  weeklyHours: 0,
  isActive: true,
  isCore: s.is_core_subject,
  gradingScale: s.grading_scale as "quantitativa" | "qualitativa" | "mista",
  createdAt: "",
  updatedAt: "",
});

export const academicService = {
  years: () => fetchAllPages<ApiAcademicYear>("/s/academic-years"),
  /**
   * Cria um ano letivo e, por omissão, activa-o (a escola ainda não tinha nenhum). Se a ativação falhar o ano fica
   * criado como «planeado», que já serve para criar turmas: não se repete a criação.
   */
  createYear: async (v: AcademicYearDraft, activate = true): Promise<ApiAcademicYear> => {
    const created = (await api.post<ApiAcademicYear>("/s/academic-years", v)).data;
    if (!activate) return created;
    try {
      return (await api.post<ApiAcademicYear>(`/s/academic-years/${created.id}/activate`)).data;
    } catch {
      return created;
    }
  },
  activeYear: async (): Promise<ApiAcademicYear | undefined> => (await academicService.years()).find((y) => y.status === "activo"),
  classLevels: () => fetchAllPages<ApiClassLevel>("/s/class-levels"),
  teachers: () => fetchAllPages<ApiTeacher>("/s/teachers"),

  // ---- turmas ----
  sections: (): Promise<AcademicSection[]> => sectionsService.list(),

  saveSection: async (
    id: string | undefined,
    v: { name: string; classLevelName: string; shift: Shift; capacity: number; academicYear?: string; roomNumber?: string },
  ): Promise<void> => {
    if (id) {
      await api.patch(`/s/sections/${id}`, {
        name: v.name,
        shift: SHIFT_TO_API[v.shift],
        capacity: v.capacity,
        room_number: v.roomNumber?.trim() || null,
      });
      return;
    }
    const [years, levels] = await Promise.all([academicService.years(), academicService.classLevels()]);
    const year =
      years.find((y) => y.id === v.academicYear || y.name === v.academicYear) ??
      years.find((y) => y.name?.includes("2026/2027") || y.name?.includes("26/27")) ??
      years.find((y) => y.status === "activo") ??
      years[0];
    if (!year) throw new Error("Não há ano letivo disponível nesta escola.");
    const level = levels.find((l) => l.name === v.classLevelName || `${l.level_number}ª Classe` === v.classLevelName);
    if (!level) throw new Error(`A classe "${v.classLevelName}" não existe nesta escola.`);
    await api.post("/s/sections", {
      academic_year_id: year.id,
      class_level_id: level.id,
      name: v.name,
      shift: SHIFT_TO_API[v.shift],
      capacity: v.capacity,
      room_number: v.roomNumber?.trim() || null,
    });
  },

  // ---- disciplinas ----
  subjects: async (): Promise<Subject[]> => (await fetchAllPages<ApiSubject>("/s/subjects")).map(toSubject),

  saveSubject: async (
    id: string | undefined,
    v: { name: string; isCore: boolean; code?: string; gradingScale?: "quantitativa" | "qualitativa" | "mista" },
  ): Promise<void> => {
    if (id) {
      await api.patch(`/s/subjects/${id}`, { name: v.name, is_core_subject: v.isCore, code: v.code?.trim() || null });
    } else {
      await api.post("/s/subjects", {
        name: v.name,
        grading_scale: v.gradingScale || "quantitativa",
        is_core_subject: v.isCore ?? false,
        ...(v.code?.trim() ? { code: v.code.trim() } : {}),
      });
    }
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
        teacherUserId: r.teacher.user_id ?? undefined,
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

  assign: async (v: { sectionId: string; subjectId: string; teacherId: string; weeklyHours: number }): Promise<{ id: string }> => {
    const res = await api.post<{ id: string }>(`/s/sections/${v.sectionId}/subjects`, {
      subject_id: v.subjectId,
      teacher_id: v.teacherId,
      weekly_hours: v.weeklyHours,
    });
    return res.data;
  },

  unassign: async (sectionId: string, id: string): Promise<void> => {
    await api.delete(`/s/sections/${sectionId}/subjects/${id}`);
  },
};
