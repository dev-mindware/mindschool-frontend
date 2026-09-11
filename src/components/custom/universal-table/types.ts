import { ColumnDef, FilterFn, Row } from "@tanstack/react-table"
import { ReactNode } from "react"

export interface DataTableConfig<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  searchableColumns?: string[]
  filterableColumns?: {
    id: string
    title: string
    options?: {
      label: string
      value: string
    }[]
  }[]
  enableSelection?: boolean
  enablePagination?: boolean
  enableSorting?: boolean
  enableColumnVisibility?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  onSelectionChange?: (selectedRows: Row<TData>[]) => void
  onDelete?: (selectedRows: Row<TData>[]) => void
  toolbar?: {
    actions?: ReactNode
    title?: string
    description?: string
  }
  emptyState?: {
    title?: string
    description?: string
    action?: ReactNode
  }
}

export interface DataTableFilterConfig {
  type: 'search' | 'select' | 'date' | 'range'
  id: string
  title: string
  placeholder?: string
  options?: Array<{
    label: string
    value: string
    count?: number
  }>
}

export interface DataTableAction<TData> {
  label: string
  icon?: ReactNode
  onClick: (rows: Row<TData>[]) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: (rows: Row<TData>[]) => boolean
}

export interface DataTableRowAction<TData> {
  label: string
  icon?: ReactNode
  onClick: (row: Row<TData>) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: (row: Row<TData>) => boolean
  shortcut?: string
}

export type DataTableFilterFn<TData> = FilterFn<TData>