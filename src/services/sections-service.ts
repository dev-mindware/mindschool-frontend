import { fetchAllPages } from "./api-pagination";
import type { AcademicSection, EducationCycle } from "@/types";

interface ApiSection {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_level: { id: string; name: string; level_number: number; cycle: string };
  name: string;
  shift: "manha" | "tarde" | "noite";
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
  /** Turmas da escola activa (todas as do ano; `academicYearId` opcional). */
  list: async (academicYearId?: string): Promise<AcademicSection[]> => {
    const rows = await fetchAllPages<ApiSection>("/s/sections", academicYearId ? { academic_year_id: academicYearId } : {});
    return rows.map((s) => ({
      id: s.id,
      schoolId: s.school_id,
      name: s.name,
      classLevel: s.class_level.name,
      cycle: CYCLE[s.class_level.cycle] ?? "PRIMARY",
      shift: s.shift === "manha" ? "MORNING" : s.shift === "tarde" ? "AFTERNOON" : "EVENING",
      roomNumber: "",
      capacity: s.capacity,
      currentEnrollmentCount: s.enrolled_count,
      academicYear: s.academic_year_id,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    }));
  },
};
