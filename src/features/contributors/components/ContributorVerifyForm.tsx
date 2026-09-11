"use client";

import React, { useState } from "react";
import { useVerifyContributor } from "../hooks/useVerifyContributor";
import { ContributorResultCard } from "./ContributorResultCard";
import { Icon } from "@/components";
import { cn } from "@/lib/utils";

export function ContributorVerifyForm() {
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("NIF");
  const verifyContributor = useVerifyContributor();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!numeroDocumento.trim()) return;

    verifyContributor.mutate({
      tipoDocumento,
      numeroDocumento,
    });
  };

  const contributor = verifyContributor.data?.contributor;
  const message = verifyContributor.data?.message;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800/80 dark:bg-slate-950 transition-all duration-300"
      >
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Consultar Contribuinte (SETIC-FP)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Valide e consulte dados oficiais de NIF, Bilhete de Identidade, Passaporte ou outros documentos.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/3">
            <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
              Tipo de Documento
            </label>
            <div className="relative">
              <select
                value={tipoDocumento}
                onChange={(event) => setTipoDocumento(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pr-10 text-sm font-medium text-slate-800 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:bg-slate-950"
              >
                <option value="NIF">NIF</option>
                <option value="AID">Bilhete de Identidade</option>
                <option value="PASS">Passaporte</option>
                <option value="RES">Cartão de Residente</option>
                <option value="REF">Cartão de Refugiado</option>
                <option value="BCER">Certidão de Nascimento</option>
                <option value="FID">Identificação Estrangeiro</option>
                <option value="ONIF">NIF Antigo</option>
                <option value="OTHR">Outro</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                <Icon name="ChevronDown" className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
              Número do Documento
            </label>
            <div className="relative">
              <input
                value={numeroDocumento}
                onChange={(event) => setNumeroDocumento(event.target.value)}
                placeholder={tipoDocumento === "NIF" ? "Ex: 5000000000" : "Insira o número do documento"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:bg-slate-950"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={verifyContributor.isPending || !numeroDocumento.trim()}
            className={cn(
              "flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {verifyContributor.isPending ? (
              <>
                <Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />
                A consultar...
              </>
            ) : (
              <>
                <Icon name="Search" className="h-4 w-4" />
                Consultar
              </>
            )}
          </button>
        </div>
      </form>

      {verifyContributor.isError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-sm text-rose-800 dark:border-rose-950/30 dark:bg-rose-950/20 dark:text-rose-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Icon name="CircleAlert" className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div>
            <h5 className="font-semibold">Erro na consulta</h5>
            <p className="mt-0.5 opacity-90">{verifyContributor.error.message}</p>
          </div>
        </div>
      )}

      {contributor && (
        <ContributorResultCard contributor={contributor} message={message} />
      )}
    </div>
  );
}
