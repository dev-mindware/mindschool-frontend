"use client";

import { useState } from "react";
import { Button, DatePicker } from "@/components/ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Icon } from "@/components/common/icon";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { cn } from "@/lib/utils";
import { formatIsoDate, type ListFilterBarProps } from "./types";

/**
 * Vista Mobile da Barra de Filtros (`sm:hidden`):
 * Apresenta pesquisa + botão gatilho compacto com contador e abre um Bottom Sheet Drawer
 * com separação entre estado de rascunho (`draft`) e filtros aplicados (`applied`).
 */
export function MobileFilterSheet<T>({
  f,
  searchPlaceholder = "Pesquisar...",
  searchable = true,
  filters = [],
  dateFilters = [],
  sorts = [],
  toolbar,
}: ListFilterBarProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const hasSheetControls = filters.length + dateFilters.length + sorts.length > 0;

  const buildCurrentDraft = () => {
    const next: Record<string, string> = {
      sort: f.sort,
      order: f.order,
    };
    for (const def of filters) next[def.key] = f.get(def.key);
    for (const d of dateFilters) {
      next[`${d.key}-from`] = f.get(`${d.key}-from`);
      next[`${d.key}-to`] = f.get(`${d.key}-to`);
    }
    return next;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(buildCurrentDraft());
    }
    setOpen(nextOpen);
  };

  const handleResetDraft = () => {
    const empty: Record<string, string> = { sort: "", order: "asc" };
    for (const def of filters) empty[def.key] = "";
    for (const d of dateFilters) {
      empty[`${d.key}-from`] = "";
      empty[`${d.key}-to`] = "";
    }
    setDraft(empty);
  };

  const handleApplyDraft = () => {
    f.setBatch(draft);
    setOpen(false);
  };

  const draftActiveCount = Object.entries(draft).filter(
    ([k, v]) => k !== "order" && Boolean(v)
  ).length;

  const appliedSheetCount =
    filters.filter((def) => Boolean(f.get(def.key))).length +
    dateFilters.reduce(
      (acc, d) =>
        acc +
        (f.get(`${d.key}-from`) ? 1 : 0) +
        (f.get(`${d.key}-to`) ? 1 : 0),
      0
    ) +
    (f.sort ? 1 : 0);

  return (
    <>
      <div className="flex flex-col gap-2.5 sm:hidden">
        <div className="flex items-center gap-2">
          {searchable && (
            <SearchHandlerWrapper
              search={f.search}
              setSearch={f.setSearch}
              className="flex-1 min-w-0"
              placeholder={searchPlaceholder}
            />
          )}
          {hasSheetControls && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(true)}
              className={cn(
                "h-10 shrink-0 gap-2 rounded-xs px-3.5 font-medium",
                !searchable && "w-full justify-between"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon name="SlidersHorizontal" className="size-4 text-primary" />
                <span>Filtros</span>
              </span>
              {appliedSheetCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {appliedSheetCount}
                </span>
              )}
            </Button>
          )}
        </div>
        {toolbar && <div className="w-full [&>*]:w-full">{toolbar}</div>}
      </div>

      {hasSheetControls && (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="max-h-[88dvh] flex flex-col gap-0 p-0 rounded-t-xl border-t sm:hidden"
          >
            <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
            <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3 space-y-0">
              <button
                type="button"
                onClick={handleResetDraft}
                disabled={draftActiveCount === 0}
                className="text-xs font-medium text-destructive transition-opacity hover:underline disabled:opacity-40"
              >
                Repor
              </button>
              <SheetTitle className="text-base font-semibold text-foreground">
                Filtros
              </SheetTitle>
              <div className="w-10" aria-hidden="true" />
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
              {/* Intervalos de Datas */}
              {dateFilters.map((d) => (
                <div key={d.key} className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">{d.label}</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <DatePicker
                      value={draft[`${d.key}-from`] ? new Date(draft[`${d.key}-from`]) : undefined}
                      onChange={(date) =>
                        setDraft((prev) => ({
                          ...prev,
                          [`${d.key}-from`]: date ? formatIsoDate(date) : "",
                        }))
                      }
                      placeholder="De..."
                      className="w-full"
                      disabledDates={[]}
                    />
                    <DatePicker
                      value={draft[`${d.key}-to`] ? new Date(draft[`${d.key}-to`]) : undefined}
                      onChange={(date) =>
                        setDraft((prev) => ({
                          ...prev,
                          [`${d.key}-to`]: date ? formatIsoDate(date) : "",
                        }))
                      }
                      placeholder="Até..."
                      className="w-full"
                      disabledDates={[]}
                    />
                  </div>
                </div>
              ))}

              {/* Filtros de Categoria / Estado (Pills interactivos) */}
              {filters.map((def) => {
                const selectedVal = draft[def.key] ?? "";
                return (
                  <div key={def.key} className="space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Icon name={def.icon} className="size-3.5 text-muted-foreground" />
                      {def.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {def.options.map((opt) => {
                        const active = selectedVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                [def.key]: active ? "" : opt.value,
                              }))
                            }
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-foreground hover:bg-muted/60"
                            )}
                          >
                            <span>{opt.label}</span>
                            {active && <Icon name="Check" className="size-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Ordenação (Radio List estilo Sort Sheet) */}
              {sorts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Ordenar por</p>
                    {draft["sort"] && (
                      <div className="inline-flex rounded-xs border border-border p-0.5 bg-muted/30">
                        <button
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, order: "asc" }))}
                          className={cn(
                            "px-2 py-0.5 text-[11px] font-medium rounded-xs transition-colors",
                            draft["order"] === "asc"
                              ? "bg-background text-foreground shadow-2xs"
                              : "text-muted-foreground"
                          )}
                        >
                          Crescente
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, order: "desc" }))}
                          className={cn(
                            "px-2 py-0.5 text-[11px] font-medium rounded-xs transition-colors",
                            draft["order"] === "desc"
                              ? "bg-background text-foreground shadow-2xs"
                              : "text-muted-foreground"
                          )}
                        >
                          Decrescente
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="divide-y divide-border/60 rounded-xs border border-border bg-card">
                    {sorts.map((s) => {
                      const isSelected = draft["sort"] === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              sort: isSelected ? "" : s.value,
                            }))
                          }
                          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
                        >
                          <span>{s.label}</span>
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border",
                              isSelected
                                ? "border-[5px] border-foreground"
                                : "border-muted-foreground/40"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDraft}
                disabled={draftActiveCount === 0}
                className="h-10 w-full rounded-xs text-xs font-medium"
              >
                Limpar tudo
              </Button>
              <Button
                type="button"
                onClick={handleApplyDraft}
                className="h-10 w-full rounded-xs text-xs font-semibold"
              >
                {draftActiveCount > 0 ? `Aplicar (${draftActiveCount})` : "Aplicar"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

