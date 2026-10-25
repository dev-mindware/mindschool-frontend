import api from "./api";
import { fetchAllPages } from "./api-pagination";
import type { AcademicSection, EducationCycle } from "@/types";

interface ApiSection {
  id: string;
  school_id: string;
  academic_year_id: string;
  academic_year?: { id: string; name: string } | null;
  class_level: { id: string; name: string; level_number: number; cycle: string };
  name: string;
  room_number?: string | null;
  shift: "manha" | "tarde" | "noite" | "diurno";
  capacity: number;
  enrolled_count: number;
  available_seats: number;
  homeroom_teacher_id: string | null;
}

const CYCLE: Record<string, EducationCycle> = {
  pre_escolar: "PRIMARY",
  primario: "PRIMARY",
  i_ciclo_secundario: "LOWER_SECONDARY",
  ii_ciclo_secundario: "UPPER_SECONDARY",
};

export const sectionsService = {
  /** Turmas da escola ativa (todas as do ano; `academicYearId` opcional). */
  list: async (academicYearId?: string): Promise<AcademicSection[]> => {
    const rows = await fetchAllPages<ApiSection>("/s/sections", academicYearId ? { academic_year_id: academicYearId } : {});
    return rows.map((s) => ({
      id: s.id,
      schoolId: s.school_id,
      name: s.name,
      classLevel: s.class_level.name,
      cycle: CYCLE[s.class_level.cycle] ?? "PRIMARY",
      shift: s.shift === "manha" ? "MORNING" : s.shift === "tarde" ? "AFTERNOON" : s.shift === "noite" ? "EVENING" : "DIURNO",
      roomNumber: s.room_number?.trim() || "—",
      capacity: s.capacity,
      currentEnrollmentCount: s.enrolled_count,
      academicYear: s.academic_year?.name || "2026/2027",
      isActive: true,
      createdAt: "",
      updatedAt: "",
    }));
  },

  /** Apaga uma turma vazia (a API recusa, com o motivo, se tiver alunos, disciplinas, horário ou pautas). */
  remove: async (id: string): Promise<void> => {
    await api.delete(`/s/sections/${id}`);
  },
};
