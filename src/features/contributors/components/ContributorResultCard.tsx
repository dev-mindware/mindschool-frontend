"use client";

import React from "react";
import { Icon } from "@/components";
import { ContributorStatusBadge } from "./ContributorStatusBadge";
import { cn } from "@/lib/utils";

export interface ContributorData {
  numeroNIF: string;
  nome: string;
  tipoContribuinte: string;
  estadoContribuinte: string;
  regimeIva: string;
  indicadorNaoResidente: boolean;
}

interface ContributorResultCardProps {
  contributor: ContributorData;
  message?: string;
  className?: string;
}

const vatRegimeLabels: Record<string, string> = {
  GNAD: "Regime Geral",
  TRAG: "Regime Transitório",
  SIMP: "Regime Simplificado",
  NBND: "Regime de Não Sujeição",
  EXCL: "Regime de Exclusão",
};

export function ContributorResultCard({
  contributor,
  message,
  className,
}: ContributorResultCardProps) {
  const isCollective = contributor.tipoContribuinte === "COLLECTIVE";
  const vatLabel = vatRegimeLabels[contributor.regimeIva] || contributor.regimeIva;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/70 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-500",
        className
      )}
    >
      {/* Decorative gradient background glow */}
      <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/5" />
      <div className="absolute -bottom-20 -left-20 -z-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-400/5" />

      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
          <Icon name="CircleCheck" className="h-4 w-4 text-emerald-500" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-blue-500/20">
            <Icon
              name={isCollective ? "Building2" : "UserRound"}
              className="h-6 w-6"
            />
          </div>
          <div>
            <h4 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {contributor.nome}
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {isCollective ? "Pessoa Coletiva" : "Pessoa Singular"}
              {contributor.indicadorNaoResidente && " · Não Residente"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <ContributorStatusBadge status={contributor.estadoContribuinte} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3 dark:border-slate-800/80">
        <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 dark:border-slate-900 dark:bg-slate-900/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Número de NIF / Documento
          </span>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {contributor.numeroNIF}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 dark:border-slate-900 dark:bg-slate-900/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Regime de IVA
          </span>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {vatLabel}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 dark:border-slate-900 dark:bg-slate-900/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tipo Contribuinte
          </span>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {contributor.tipoContribuinte}
          </p>
        </div>
      </div>
    </div>
  );
}
