"use client";
import React from "react";
import { Button, Input, Icon } from "@/components";
import { FilterPopover } from "@/components/shared";
import { useGetUsers } from "@/hooks/users";
import { useAuditFilters } from "@/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACTION_OPTIONS, ENTITY_OPTIONS } from "./constants";

export function AuditFilters() {
  const { data: users = [] } = useGetUsers();
  const { filters, setFilters, clearAllFilters } = useAuditFilters();

  const userOptions = React.useMemo(() => {
    return users.map((u) => ({ value: u.id, label: u.name }));
  }, [users]);

  const hasFilter = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar por Nome, Nº ou Termo..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ search: e.target.value || undefined })}
            className="h-10 bg-background/50 focus-visible:bg-background transition-colors"
          />
        </div>

        <FilterPopover
          icon="User"
          label="Utilizador"
          options={userOptions}
          value={filters.userId}
          onChange={(userId) => setFilters({ userId: userId || undefined })}
        />

        <FilterPopover
          icon="Boxes"
          label="Entidade"
          options={ENTITY_OPTIONS}
          value={filters.entity}
          onChange={(entity) => setFilters({ entity: (entity as any) || undefined })}
        />

        <FilterPopover
          icon="Activity"
          label="Acção"
          options={ACTION_OPTIONS}
          value={filters.action}
          onChange={(action) => setFilters({ action: (action as any) || undefined })}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 justify-start text-left font-normal bg-background/50 hover:bg-background transition-colors w-full sm:w-auto",
                !filters.dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {filters.dateFrom
                  ? format(new Date(filters.dateFrom), "dd/MM/yyyy", { locale: pt })
                  : "Data Inicial"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
              onSelect={(date) => {
                if (date) {
                  date.setHours(0, 0, 0, 0);
                  setFilters({ dateFrom: date.toISOString() });
                } else {
                  setFilters({ dateFrom: undefined });
                }
              }}
              initialFocus
              locale={pt}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 justify-start text-left font-normal bg-background/50 hover:bg-background transition-colors w-full sm:w-auto",
                !filters.dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {filters.dateTo
                  ? format(new Date(filters.dateTo), "dd/MM/yyyy", { locale: pt })
                  : "Data Final"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
              onSelect={(date) => {
                if (date) {
                  date.setHours(23, 59, 59, 999);
                  setFilters({ dateTo: date.toISOString() });
                } else {
                  setFilters({ dateTo: undefined });
                }
              }}
              initialFocus
              locale={pt}
            />
          </PopoverContent>
        </Popover>

        {hasFilter && (
          <Button
            size="sm"
            variant="outline"
            onClick={clearAllFilters}
            className="h-10 text-destructive hover:text-destructive w-full sm:w-auto"
          >
            <Icon name="X" className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
}
