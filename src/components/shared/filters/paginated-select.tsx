"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface Option {
  label: string;
  value: string;
  description?: string;
}

interface Pagination {
  page: number;
  totalPages: number;
}

interface PaginatedSelectProps {
  options: Option[];
  value?: string | null;
  onChange: (value: string) => void;
  isLoading?: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function PaginatedSelect({
  options,
  value,
  onChange,
  isLoading,
  pagination,
  onPageChange,
  placeholder = "Seleccionar...",
  className,
  label,
  error,
  disabled,
  fullWidth,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Pesquisar...",
}: PaginatedSelectProps) {
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-full sm:w-auto")}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={cn(fullWidth ? "w-full" : "w-full sm:w-[200px]", className)}>
          {isLoading && !value ? (
            <Skeleton className="h-4 w-24" />
          ) : selectedLabel ? (
            <span className="truncate block max-w-full" title={selectedLabel}>
              {selectedLabel}
            </span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {onSearchChange && (
            <div className="p-2" onKeyDown={(event) => event.stopPropagation()}>
              <input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                onPointerDown={(event) => event.stopPropagation()}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                disabled={disabled}
              />
            </div>
          )}
          {isLoading ? (
            <div className="p-2 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              {options.length > 0 ? (
                options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex min-w-0 flex-col gap-0.5 py-0.5">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="line-clamp-2 text-xs font-normal text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Sem resultados
                </div>
              )}

              <div className="flex items-center justify-between p-2 border-t mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={pagination.page <= 1 || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={
                    pagination.page >= pagination.totalPages || isLoading
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
