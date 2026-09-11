/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useId, useMemo, useRef } from "react"
import { Table } from "@tanstack/react-table"
import {
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
  TrashIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchableColumns?: string[]
  filterableColumns?: {
    id: string
    title: string
    options?: {
      label: string
      value: string
    }[]
  }[]
  enableColumnVisibility?: boolean
  onDelete?: (selectedRows: any[]) => void
  toolbar?: {
    actions?: React.ReactNode
    title?: string
    description?: string
  }
}

export function DataTableToolbar<TData>({
  table,
  searchableColumns = [],
  filterableColumns = [],
  enableColumnVisibility = true,
  onDelete,
  toolbar,
}: DataTableToolbarProps<TData>) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const searchColumn = searchableColumns[0]
  const searchColumnObj = searchColumn ? table.getColumn(searchColumn) : null

  const handleDeleteRows = () => {
    if (onDelete) {
      const selectedRows = table.getSelectedRowModel().rows
      onDelete(selectedRows)
      table.resetRowSelection()
    }
  }

  return (
    <div className="space-y-4">
      {toolbar && (toolbar.title || toolbar.description) && (
        <div>
          {toolbar.title && (
            <h2 className="text-2xl font-bold tracking-tight">{toolbar.title}</h2>
          )}
          {toolbar.description && (
            <p className="text-muted-foreground">{toolbar.description}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {searchColumnObj && (
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer w-full sm:min-w-60 ps-9",
                  Boolean(searchColumnObj.getFilterValue()) && "pe-9"
                )}
                value={(searchColumnObj.getFilterValue() ?? "") as string}
                onChange={(e) => searchColumnObj.setFilterValue(e.target.value)}
                placeholder={`Pesquisar...`}
                type="text"
                aria-label={`Filter by ${searchColumn}`}
              />
              <div className="absolute inset-y-0 flex items-center justify-center pointer-events-none text-muted-foreground/80 start-0 ps-3 peer-disabled:opacity-50">
                <ListFilterIcon size={16} aria-hidden="true" />
              </div>
              {Boolean(searchColumnObj.getFilterValue()) && (
                <button
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear filter"
                  onClick={() => {
                    searchColumnObj.setFilterValue("")
                    if (inputRef.current) {
                      inputRef.current.focus()
                    }
                  }}
                >
                  <CircleXIcon size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {filterableColumns.map((filterConfig) => (
              <FilterDropdown
                key={filterConfig.id}
                table={table}
                column={filterConfig}
              />
            ))}

            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Columns3Icon
                      className="-ms-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                    <span>Columns</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {onDelete && table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-auto" variant="outline">
                  <TrashIcon
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  <span>Delete</span>
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-lg mx-4">
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex items-center justify-center border rounded-full size-9 shrink-0"
                    aria-hidden="true"
                  >
                    <CircleAlertIcon className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-left">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                      This action cannot be undone. This will permanently delete{" "}
                      {table.getSelectedRowModel().rows.length} selected{" "}
                      {table.getSelectedRowModel().rows.length === 1 ? "row" : "rows"}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
                  <AlertDialogCancel className="w-full sm:w-auto">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRows}
                    className="w-full sm:w-auto"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {toolbar?.actions}
        </div>
      </div>
    </div>
  )
}

function FilterDropdown<TData>({
  table,
  column: filterConfig,
}: {
  table: Table<TData>
  column: {
    id: string
    title: string
    options?: {
      label: string
      value: string
    }[]
  }
}) {
  const id = useId()
  const column = table.getColumn(filterConfig.id)

  const uniqueValues = useMemo(() => {
    if (!column) return []
    
    if (filterConfig.options) {
      return filterConfig.options
    }

    const values = Array.from(column.getFacetedUniqueValues().keys())
    return values.map((value) => ({
      label: String(value),
      value: String(value),
    }))
  }, [column, filterConfig.options])

  const selectedValues = useMemo(() => {
    if (!column) return []
    const filterValue = column.getFilterValue() as string[]
    return filterValue ?? []
  }, [column])

  if (!column) return null

  const handleValueChange = (checked: boolean, value: string) => {
    const filterValue = column.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    column.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex-1 sm:flex-none">
          <FilterIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
          <span>{filterConfig.title}</span>
          {selectedValues.length > 0 && (
            <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
              {selectedValues.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 min-w-36" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">
            {filterConfig.title}
          </div>
          <div className="space-y-3">
            {uniqueValues.map((option, i) => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${id}-${i}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked: boolean) =>
                    handleValueChange(checked, option.value)
                  }
                />
                <Label
                  htmlFor={`${id}-${i}`}
                  className="flex justify-between gap-2 font-normal grow"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}