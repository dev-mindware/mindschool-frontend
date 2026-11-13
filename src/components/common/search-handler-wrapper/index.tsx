"use client";
import { cn } from "@/lib";
import { Input } from "@/components";
import { stripControlChars } from "@/schemas/helps";

type Props = {
  children?: React.ReactNode;
  search: string;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  setSearch: (search: string) => void;
};

export function SearchHandlerWrapper({
  children,
  search,
  placeholder,
  maxLength = 100,
  setSearch,
  className,
}: Props) {
  return (
    <div className={cn("flex gap-4", className)}>
      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="w-full">
          <Input
            value={search}
            maxLength={maxLength}
            onChange={(e) => setSearch(stripControlChars(e.target.value).slice(0, maxLength))}
            placeholder={placeholder ?? "Pesquisar..."}
            startIcon="Search"
            className="w-full h-10 text-sm border rounded-xs border-input bg-background"
          />
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
