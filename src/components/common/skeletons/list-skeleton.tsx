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
  className?: string;
}

/**
 * Skeleton perfeitamente alinhado com a GenericTable:
 * - Em Desktop (md:): Tabela estruturada com cabeçalho e linhas.
 * - Em Mobile (<md): Pilha de cartões responsivos, espelhando fielmente o card-stack do GenericTable.
 * Elimina completamente o layout shift (CLS) durante o carregamento de listas.
 */
export function ListSkeleton({ cols = 4, rows = 5, className }: ListSkeletonProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* DESKTOP VIEW: Tabela idêntica à GenericTable */}
      <div className="hidden md:block rounded-xs border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: cols }).map((_, index) => (
                <TableHead key={index} className="py-2 px-4">
                  <Skeleton className="h-4 w-28" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-3.5 px-4">
                    <Skeleton
                      className={cn(
                        "h-4",
                        colIndex === 0
                          ? "w-44"
                          : colIndex === cols - 1
                            ? "w-20 ml-auto"
                            : "w-full max-w-[140px]"
                      )}
                    />
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
            className="rounded-xs border border-border bg-card p-4 shadow-xs space-y-2.5"
          >
            {/* Header do Cartão: Título + Ação */}
            <div className="flex items-start justify-between gap-2 pb-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-16 rounded-xs" />
            </div>

            {/* Divisor */}
            <div className="my-2 border-t border-border/50" />

            {/* Sub-grid 2 colunas com pares chave/valor */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {Array.from({ length: Math.min(Math.max(cols - 1, 2), 4) }).map(
                (_, subIdx) => (
                  <div key={subIdx} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
