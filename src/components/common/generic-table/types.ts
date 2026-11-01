import type React from "react";

export interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  route?: string;
  page?: number;
  total?: number;
  totalPages?: number;
  setPage?: (page: number) => void;
  goToNextPage?: () => void;
  goToPreviousPage?: () => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
}

export interface SharedTableViewProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  emptyMessage: string;
  emptyDescription: string;
  route?: string;
  newId: string | null;
  selectable?: boolean;
  selectedIds: string[];
  isAllPageSelected: boolean;
  isSomePageSelected: boolean;
  onRowActivate: (item: T) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
}

export function getColumnValue<T>(item: T, key: keyof T | string): any {
  if (typeof key === "string" && key.includes(".")) {
    return key.split(".").reduce((obj: any, k) => obj?.[k], item);
  }
  return item[key as keyof T];
}

