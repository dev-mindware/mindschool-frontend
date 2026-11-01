"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/common/empty-state";
import { getColumnValue, type SharedTableViewProps } from "./types";

/**
 * Vista Mobile de `GenericTable` (`block md:hidden`):
 * Empilhamento de cartões (`Card Stack`) com cabeçalho principal, botão de acção e grelha de 2 colunas de atributos.
 */
export function MobileCardStackView<T extends { id: string }>({
  data,
  columns,
  emptyMessage,
  emptyDescription,
  route,
  newId,
  selectable,
  selectedIds,
  onRowActivate,
  onSelectRow,
}: SharedTableViewProps<T>) {
  return (
    <div className="block md:hidden w-full space-y-3">
      {data.length === 0 ? (
        <EmptyState
          icon="Inbox"
          title={emptyMessage}
          description={emptyDescription}
        />
      ) : (
        data.map((item, rowIndex) => {
          const headerCol = columns[0];
          const actionCol = columns.find(
            (c) =>
              String(c.header).toLowerCase().includes("acção") ||
              String(c.header).toLowerCase().includes("ação") ||
              String(c.header).toLowerCase().includes("action") ||
              String(c.key).toLowerCase() === "action",
          );

          const bodyCols = columns.slice(1).filter((c) => c !== actionCol);

          return (
            <div
              key={item.id || rowIndex}
              onClick={() => onRowActivate(item)}
              className={cn(
                "relative rounded-xs border border-border bg-card p-4 shadow-xs transition-all active:scale-[0.98]",
                route && "cursor-pointer",
                item.id === newId && "ring-2 ring-primary animate-pulse",
              )}
            >
              {/* Card Header: Main Title/Key & Action Badge/Button */}
              <div className="flex items-start justify-between gap-2 pb-2">
                <div className="flex items-center gap-2 font-medium text-base text-foreground flex-1 line-clamp-1">
                  {selectable && (
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) =>
                        onSelectRow(item.id, Boolean(checked))
                      }
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Seleccionar registo ${item.id}`}
                    />
                  )}
                  {headerCol?.render
                    ? headerCol.render(
                        getColumnValue(item, headerCol.key),
                        item,
                      )
                    : getColumnValue(item, headerCol?.key || "")}
                </div>
                {actionCol && (
                  <div className="shrink-0">
                    {actionCol.render
                      ? actionCol.render(
                          getColumnValue(item, actionCol.key),
                          item,
                        )
                      : getColumnValue(item, actionCol.key)}
                  </div>
                )}
              </div>

              {/* Divider */}
              {bodyCols.length > 0 && (
                <div className="my-2.5 border-t border-border/50" />
              )}

              {/* Card Body Sub-Grid: 2 Columns Key-Value Pairs */}
              {bodyCols.length > 0 && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
                  {bodyCols.map((col, cIdx) => {
                    const val = col.render
                      ? col.render(getColumnValue(item, col.key), item)
                      : getColumnValue(item, col.key);
                    if (val === undefined || val === null || val === "") {
                      return null;
                    }

                    return (
                      <div key={cIdx} className="flex flex-col space-y-0.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                          {col.header}
                        </span>
                        <div className="text-xs font-medium text-foreground truncate">
                          {val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

