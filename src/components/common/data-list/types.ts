import type { ReactNode } from "react";
import { icons } from "lucide-react";
import { type ListFiltersState } from "@/hooks/common/use-list-filters";

export interface ListFilterDef<T> {
  key: string;
  label: string;
  icon: keyof typeof icons;
  options: Array<{ value: string; label: string }>;
  /** Devolve true se a linha corresponde ao valor escolhido. */
  match: (row: T, value: string) => boolean;
}

export interface ListDateFilterDef<T> {
  key: string;
  label: string;
  getDate: (row: T) => string | null | undefined;
}

export interface ListSortDef<T> {
  value: string;
  label: string;
  compare: (a: T, b: T) => number;
}

export interface ListFilterBarProps<T> {
  prefix: string;
  f: ListFiltersState;
  searchPlaceholder?: string;
  searchable?: boolean;
  filters?: ListFilterDef<T>[];
  dateFilters?: ListDateFilterDef<T>[];
  sorts?: ListSortDef<T>[];
  toolbar?: ReactNode;
  shown?: number;
  total?: number;
}

export const formatIsoDate = (d: Date) => d.toISOString().slice(0, 10);

