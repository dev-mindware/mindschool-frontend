"use client";

import { useEffect, ReactNode } from "react";
import { useMultiSchoolStore } from "@/stores/school/multi-school-store";

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { units, selectedUnitId, selectUnit } = useMultiSchoolStore();

  useEffect(() => {
    if (!selectedUnitId && units.length > 0) {
      selectUnit(units[0].id);
    }
  }, [units, selectedUnitId, selectUnit]);

  return <>{children}</>;
}
