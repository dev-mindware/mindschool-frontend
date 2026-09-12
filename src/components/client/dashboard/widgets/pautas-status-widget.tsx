"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import { PautaStatusSummary } from "@/types";

interface PautasStatusWidgetProps {
  status?: PautaStatusSummary;
}

export function PautasStatusWidget({ status }: PautasStatusWidgetProps) {
  if (!status) return null;

  return (
    <Card className="border shadow-none bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon name="FileCheck" className="w-5 h-5 text-primary" />
            Progresso de Fecho de Pautas
          </CardTitle>
          <Link href="/grades/pautas">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary/90">
              Gerir Pautas <Icon name="ArrowRight" className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-muted-foreground">Pautas Homologadas e Fechadas</span>
            <span className="text-foreground font-bold">
              {status.closingProgressPercent}% ({status.closedPautas + status.approvedPautas} de {status.totalClasses} turmas)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${status.closingProgressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-[11px] text-amber-700 font-medium block">Em Aberto</span>
            <span className="text-lg font-bold text-amber-600">{status.openPautas}</span>
            <span className="text-[10px] text-muted-foreground block">Aguardando notas</span>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-[11px] text-blue-700 font-medium block">Submetidas</span>
            <span className="text-lg font-bold text-blue-600">{status.submittedPautas}</span>
            <span className="text-[10px] text-muted-foreground block">Pelo coordenador</span>
          </div>

          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-[11px] text-indigo-700 font-medium block">Aprovadas</span>
            <span className="text-lg font-bold text-indigo-600">{status.approvedPautas}</span>
            <span className="text-[10px] text-muted-foreground block">Pela Direcção</span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-700 font-medium block">Fechadas</span>
            <span className="text-lg font-bold text-emerald-600">{status.closedPautas}</span>
            <span className="text-[10px] text-muted-foreground block">Definitivas</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="ShieldCheck" className="w-4 h-4 text-emerald-600" />
            <span>Fecho com certificação de assinatura digital pedagógica</span>
          </div>
          <Link href="/grades/transitions">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted font-medium text-xs">
              Conselho de Transição
            </Badge>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
