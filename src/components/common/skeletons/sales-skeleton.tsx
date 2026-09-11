import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TitleList } from "../title-list";

export function SalesSkeleton() {
  return (
    <div className="space-y-6">
      <TitleList
        title="Relatórios de Vendas"
        suTitle="Análise de Vendas por Período"
      />
  
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metrics Cards */}
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6">
          <div className="flex items-end gap-2 h-[400px] w-full pt-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-full"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  opacity: 0.1 + i / 20,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}