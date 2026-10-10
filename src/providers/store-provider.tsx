"use client";

import { useEffect, ReactNode } from "react";
import { useMultiSchoolStore } from "@/stores/school/multi-school-store";
import { useSchoolProfile } from "@/hooks/school/use-school-profile";

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { units, selectedUnitId, selectUnit } = useMultiSchoolStore();
  useSchoolProfile(); // hidrata o perfil institucional com os dados reais da escola activa

  useEffect(() => {
    if (!selectedUnitId && units.length > 0) {
      selectUnit(units[0].id);
    }
  }, [units, selectedUnitId, selectUnit]);

  return <>{children}</>;
}
