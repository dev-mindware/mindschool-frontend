"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useSchoolProfile } from "@/hooks/school/use-school-profile";
import { useActiveSchoolStore, type SchoolMembership } from "@/stores/school/active-school-store";

interface SchoolContextValue {
  /** Escolas a que o utilizador pertence (as da sua conta; é o que o switcher da sidebar lista). */
  schools: SchoolMembership[];
  /** Escola ativa: papel, plano, permissões e dados da aplicação vêm dela. */
  current: SchoolMembership | undefined;
  /** O switcher só faz sentido com mais do que uma escola. */
  hasMultiple: boolean;
  /** Muda de escola e volta ao dashboard: papel, plano e permissões mudam, por isso a aplicação recarrega do zero. */
  switchSchool: (schoolId: string) => void;
}

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined);

/** Escola ativa e troca de escola (multi-escola): o switcher da sidebar e o painel Multi-Escola usam o mesmo ponto. */
export function SchoolProvider({ children }: { children: ReactNode }) {
  useSchoolProfile(); // hidrata o perfil institucional com os dados reais da escola ativa
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const memberships = useActiveSchoolStore((s) => s.memberships);
  const selectSchool = useActiveSchoolStore((s) => s.selectSchool);

  const switchSchool = useCallback(
    (id: string) => {
      if (id === schoolId || !memberships.some((m) => m.schoolId === id)) return;
      selectSchool(id);
      // Uma página da escola anterior pode não existir (ou não ser permitida) na nova: entra-se sempre pelo dashboard.
      window.location.assign("/dashboard");
    },
    [schoolId, memberships, selectSchool],
  );

  const value = useMemo<SchoolContextValue>(
    () => ({ schools: memberships, current: memberships.find((m) => m.schoolId === schoolId) ?? memberships[0], hasMultiple: memberships.length > 1, switchSchool }),
    [memberships, schoolId, switchSchool],
  );
  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool(): SchoolContextValue {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool deve ser usado dentro de SchoolProvider");
  return ctx;
}
