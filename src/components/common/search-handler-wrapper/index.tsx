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
        <div className="relative w-full">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder ?? "Pesquisar..."}
            className="w-full h-10 text-sm border rounded-md ps-10 pe-10 border-input bg-background"
          />
          <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3 text-muted-foreground">
            <Icon name="Search" size={16} />
          </div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
