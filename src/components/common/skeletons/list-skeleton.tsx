import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ListSkeletonProps {
  rows?: number;
  cols?: number;
  hasPagination?: boolean;
  className?: string;
}

/**
 * Skeleton perfeitamente alinhado com a GenericTable:
 * - Em Desktop (md:): Tabela estruturada com cabeçalho, linhas e rodapé de paginação.
 * - Em Mobile (<md): Pilha de cartões responsivos, espelhando fielmente o card-stack do GenericTable + paginação.
 * Elimina completamente o layout shift (CLS) durante o carregamento de listas.
 */
export function ListSkeleton({
  cols = 4,
  rows = 5,
  hasPagination = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* DESKTOP VIEW: Tabela idêntica à GenericTable */}
      <div className="hidden md:block rounded-xs border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: cols }).map((_, index) => (
                <TableHead key={index} className="py-2.5 px-4">
                  <Skeleton
                    className={cn(
                      "h-3.5 rounded-xs",
                      index === cols - 1 ? "w-14 ml-auto" : "w-24"
                    )}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-3.5 px-4">
                    {colIndex === 0 ? (
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-44 rounded-xs" />
                        <Skeleton className="h-3 w-28 rounded-xs bg-muted/60" />
                      </div>
                    ) : colIndex === cols - 1 ? (
                      <Skeleton className="h-7 w-16 ml-auto rounded-xs" />
                    ) : (
                      <Skeleton className="h-4 w-full max-w-[130px] rounded-xs" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE VIEW: Pilha de cartões espelhando o GenericTable mobile */}
      <div className="block md:hidden w-full space-y-3">
        {Array.from({ length: Math.min(rows, 4) }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xs border border-border bg-card p-4 shadow-xs"
          >
            {/* Header do Cartão: Título + Acção */}
            <div className="flex items-start justify-between gap-2 pb-2">
              <div className="space-y-1 flex-1 min-w-0">
                <Skeleton className="h-4 w-40 rounded-xs" />
                <Skeleton className="h-3 w-28 rounded-xs bg-muted/60" />
              </div>
              <Skeleton className="h-6 w-16 shrink-0 rounded-xs" />
            </div>

            {/* Divisor idêntico ao GenericTable */}
            <div className="my-2.5 border-t border-border/50" />

            {/* Sub-grid 2 colunas com pares chave/valor */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              {Array.from({ length: Math.min(Math.max(cols - 1, 2), 4) }).map(
                (_, subIdx) => (
                  <div key={subIdx} className="flex flex-col space-y-1">
                    <Skeleton className="h-2.5 w-16 rounded-xs bg-muted/60" />
                    <Skeleton className="h-3.5 w-24 rounded-xs" />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION FOOTER SKELETON */}
      {hasPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2">
          <Skeleton className="h-4 w-44 rounded-xs" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-20 rounded-xs" />
            <Skeleton className="size-8 rounded-xs" />
            <Skeleton className="size-8 rounded-xs" />
            <Skeleton className="h-8 w-20 rounded-xs" />
          </div>
        </div>
      )}
    </div>
  );
}

