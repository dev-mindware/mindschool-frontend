import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SchoolMembership {
  schoolId: string;
  schoolName: string;
  /** Caminho público do logotipo na API (com versão), ou `null`. */
  logoPath?: string | null;
  /** Cor institucional (#RRGGBB). */
  brandColor?: string;
  roles: string[];
  /** Permissões efectivas devolvidas pela API (`/auth/me`); servem só para adaptar a interface. */
  permissions?: string[];
}

interface ActiveSchoolState {
  /** Escola em que o utilizador esta a trabalhar (todas as rotas `/s/...` da API usam-na). */
  schoolId: string | null;
  memberships: SchoolMembership[];
  setMemberships: (memberships: SchoolMembership[]) => void;
  selectSchool: (schoolId: string) => void;
  /** Actualiza os dados de marca de uma escola (depois de mudar o logotipo ou a cor nas definições). */
  patchMembership: (schoolId: string, data: Partial<Pick<SchoolMembership, "schoolName" | "logoPath" | "brandColor">>) => void;
  clear: () => void;
}

export const useActiveSchoolStore = create<ActiveSchoolState>()(
  persist(
    (set, get) => ({
      schoolId: null,
      memberships: [],
      setMemberships: (memberships) => {
        const current = get().schoolId;
        const stillValid = current && memberships.some((m) => m.schoolId === current);
        set({ memberships, schoolId: stillValid ? current : (memberships[0]?.schoolId ?? null) });
      },
      selectSchool: (schoolId) => set({ schoolId }),
      patchMembership: (schoolId, data) =>
        set({ memberships: get().memberships.map((m) => (m.schoolId === schoolId ? { ...m, ...data } : m)) }),
      clear: () => set({ schoolId: null, memberships: [] }),
    }),
    { name: "mindschool-active-school" },
  ),
);
