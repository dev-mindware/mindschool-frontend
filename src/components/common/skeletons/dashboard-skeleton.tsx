"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DynamicMetricCardSkeleton } from "./dynamic-metric-card-skeleton";

const BAR_HEIGHTS = [38, 62, 50, 78, 64, 88, 72, 46, 82, 68, 76, 92];

/**
 * Skeleton do Dashboard Escolar (padrão MindGest / nextjs-responsive-ui):
 * - 1. 4 KPIs em grelha 2x2 no mobile (`grid-cols-2`) e 4 colunas em desktop (`@5xl/main:grid-cols-4`).
 * - 2. Secção de Gráficos: Gráfico de Barras (`lg:col-span-2`, `h-[260px]`) + Gráfico Donut (`col-span-1`, `h-[190px]` + legenda).
 * - 3. Secção Operacional: 3 cartões de acompanhamento escolar (Aulas/Alertas, Dívidas/Eventos e Acesso Rápido 2x2).
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in duration-200">
      {/* 1. 4 KPIs Principais — Grelha idêntica ao DashboardOverview / FinanceDashboard / TeacherDashboard */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <DynamicMetricCardSkeleton key={idx} />
        ))}
      </div>

      {/* 2. Gráficos Principais (BarChart 2/3 + DonutChart 1/3) */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {/* Gráfico de Barras Mensal / Turmas (`h-[260px]`) */}
        <Card className="lg:col-span-2 flex h-full flex-col gap-0 py-4 border shadow-none rounded-xs">
          <CardHeader className="px-4 pb-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-xs bg-primary/10 shrink-0" />
              <Skeleton className="h-5 w-44 rounded-xs" />
            </div>
            <Skeleton className="h-3.5 w-60 max-w-full rounded-xs" />
          </CardHeader>
          <CardContent className="flex-1 px-2 pt-2 sm:px-4">
            <div className="relative h-[260px] w-full flex flex-col justify-between pt-4 pb-2">
              {/* Linhas horizontais da grelha cartesiana */}
              <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-full h-px bg-border/50" />
                ))}
              </div>

              {/* Barras verticais proporcionais */}
              <div className="relative flex-1 flex items-end justify-between gap-1.5 sm:gap-3 px-2 pt-4 pb-2">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <Skeleton
                      style={{ height: `${h}%` }}
                      className="w-full max-w-[28px] rounded-t-xs bg-primary/15"
                    />
                  </div>
                ))}
              </div>

              {/* Legendas do eixo X */}
              <div className="flex items-center justify-between gap-1.5 px-2 pt-1">
                {BAR_HEIGHTS.map((_, i) => (
                  <Skeleton key={i} className="h-2.5 w-5 rounded-xs bg-muted/60" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Donut (`h-[190px]` + Lista de Legendas) */}
        <Card className="flex h-full flex-col gap-0 py-4 border shadow-none rounded-xs">
          <CardHeader className="px-4 pb-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-xs bg-primary/10 shrink-0" />
              <Skeleton className="h-5 w-36 rounded-xs" />
            </div>
            <Skeleton className="h-3.5 w-28 rounded-xs" />
          </CardHeader>
          <CardContent className="flex-1 px-2 pt-2 sm:px-4 flex flex-col justify-between">
            <div className="mx-auto h-[190px] w-full flex items-center justify-center">
              <div className="relative size-[168px] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[22px] border-primary/15 animate-pulse" />
                <div className="flex flex-col items-center justify-center gap-1">
                  <Skeleton className="h-6 w-12 rounded-xs" />
                  <Skeleton className="h-3 w-10 rounded-xs bg-muted/60" />
                </div>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-2.5 rounded-full bg-primary/40" />
                    <Skeleton className="h-3.5 w-24 rounded-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-10 rounded-xs" />
                    <Skeleton className="h-3 w-8 rounded-xs bg-muted/60" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 3. Cartões Operacionais Escolares (OverviewSectionCard + QuickLinks) */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {/* Cartão 1: Aulas / Alertas de Risco / Pedidos */}
        <Card className="flex flex-col h-full gap-0 py-4 border shadow-none rounded-xs">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-xs bg-primary/10 shrink-0" />
              <Skeleton className="h-5 w-36 rounded-xs" />
            </div>
            <Skeleton className="h-3.5 w-16 rounded-xs" />
          </CardHeader>
          <CardContent className="flex-1 px-4">
            <ul className="divide-y divide-border/60">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <Skeleton className="h-4 w-36 rounded-xs" />
                    <Skeleton className="h-3 w-24 rounded-xs bg-muted/60" />
                  </div>
                  <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Cartão 2: Cobranças / Próximos Eventos */}
        <Card className="flex flex-col h-full gap-0 py-4 border shadow-none rounded-xs">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-xs bg-primary/10 shrink-0" />
              <Skeleton className="h-5 w-40 rounded-xs" />
            </div>
            <Skeleton className="h-3.5 w-16 rounded-xs" />
          </CardHeader>
          <CardContent className="flex-1 px-4">
            <ul className="divide-y divide-border/60">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <Skeleton className="h-4 w-40 rounded-xs" />
                    <Skeleton className="h-3 w-28 rounded-xs bg-muted/60" />
                  </div>
                  <Skeleton className="h-4 w-20 shrink-0 rounded-xs" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Cartão 3: Acesso Rápido (Grelha 2x2 de Atalhos) */}
        <Card className="flex flex-col h-full gap-0 py-4 border shadow-none rounded-xs">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-xs bg-primary/10 shrink-0" />
              <Skeleton className="h-5 w-28 rounded-xs" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-4">
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xs border border-border p-3"
                >
                  <Skeleton className="size-4 rounded-xs bg-primary/20 shrink-0" />
                  <Skeleton className="h-4 w-20 rounded-xs" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

