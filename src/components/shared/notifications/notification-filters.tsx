"use client";
import {
  Button,
  Input,
  Icon,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components";
import { cn } from "@/lib/utils";

interface NotificationFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: "all" | "read" | "unread";
  setFilterStatus: (value: "all" | "read" | "unread") => void;
  filterType: "all" | "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "AI_ALERT";
  setFilterType: (value: "all" | "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "AI_ALERT") => void;
  compact?: boolean;
}

const STATUS_LABELS: Record<"all" | "read" | "unread", string> = {
  all: "Todas",
  read: "Lidas",
  unread: "Não Lidas",
};

const TYPE_LABELS: Record<"all" | "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "AI_ALERT", string> = {
  all: "Todos os tipos",
  AI_ALERT: "MIND AI / Inteligentes",
  INFO: "Informações",
  SUCCESS: "Sucesso / Validações",
  WARNING: "Avisos",
  ERROR: "Erros",
};

export function NotificationFilters({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  compact = false,
}: NotificationFiltersProps) {
  const isStatusFiltered = filterStatus !== "all";
  const isTypeFiltered = filterType !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative w-full sm:max-w-md">
        <Icon
          name="Search"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Buscar notificações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "border gap-2 shrink-0 transition-colors",
                isStatusFiltered && "border-primary text-primary bg-primary/5 hover:bg-primary/10"
              )}
            >
              <Icon name="ListFilter" className="h-4 w-4" />
              {STATUS_LABELS[filterStatus]}
              {isStatusFiltered && (
                <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Filtrar por estado
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["all", "unread", "read"] as const).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filterStatus === status}
                onCheckedChange={() => setFilterStatus(status)}
              >
                {STATUS_LABELS[status]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "border gap-2 shrink-0 transition-colors",
                isTypeFiltered && "border-primary text-primary bg-primary/5 hover:bg-primary/10"
              )}
            >
              <Icon name="Tag" className="h-4 w-4" />
              {TYPE_LABELS[filterType]}
              {isTypeFiltered && (
                <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Filtrar por tipo
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["all", "AI_ALERT", "INFO", "SUCCESS", "WARNING", "ERROR"] as const).map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filterType === type}
                onCheckedChange={() => setFilterType(type)}
              >
                {TYPE_LABELS[type]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
