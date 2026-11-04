"use client";
import { cn } from "@/lib";
import { Input, Icon } from "@/components";

type Props = {
  children?: React.ReactNode;
  search: string;
  className?: string;
  placeholder?: string;
  setSearch: (search: string) => void;
};

export function SearchHandlerWrapper({
  children,
  search,
  placeholder,
  setSearch,
  className,
}: Props) {
  return (
    <div className={cn("flex gap-4", className)}>
      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="w-full">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
