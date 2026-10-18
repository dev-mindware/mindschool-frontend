import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SchoolMembership {
  schoolId: string;
  schoolName: string;
  roles: string[];
  /** Acede a esta escola só pelo grupo (multi-escola): não tem papel próprio nela. */
  viaGroup?: boolean;
  /** Permissões efectivas devolvidas pela API (`/auth/me`); servem só para adaptar a interface. */
  permissions?: string[];
}

interface ActiveSchoolState {
  /** Escola em que o utilizador esta a trabalhar (todas as rotas `/s/...` da API usam-na). */
  schoolId: string | null;
  memberships: SchoolMembership[];
  setMemberships: (memberships: SchoolMembership[]) => void;
  selectSchool: (schoolId: string) => void;
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
      clear: () => set({ schoolId: null, memberships: [] }),
    }),
    { name: "mindschool-active-school" },
  ),
);
