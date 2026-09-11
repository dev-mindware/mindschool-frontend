import { Row } from "@tanstack/react-table"
import { EllipsisIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DataTableRowAction } from "./types"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  actions: DataTableRowAction<TData>[]
}

export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  if (!actions.length) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none"
            aria-label="Row actions"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(row)}
              disabled={action.disabled?.(row)}
              className={
                action.variant === "destructive"
                  ? "text-destructive focus:text-destructive"
                  : ""
              }
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              <span>{action.label}</span>
              {action.shortcut && (
                <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}