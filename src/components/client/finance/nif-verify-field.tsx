"use client";

import React, { useState } from "react";
import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { Button, Icon, Input } from "@/components";
import { getApiErrorMessage } from "@/utils/api-error";
import { isValidNif, normalizeNif } from "@/lib/nif";
import { settlementService } from "@/modules/finance/services/settlement-service";

interface NifVerifyFieldProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  /** Nome do campo do NIF no formulário. */
  name?: string;
  /** Chamado com o nome devolvido pela consulta, para o utilizador o aproveitar (ex.: preencher o nome do encarregado). */
  onResolvedName?: (name: string) => void;
}

/**
 * NIF opcional com «Verificar NIF»: o servidor consulta o contribuinte no MindGest e devolve só o nome. Nada é guardado
 * por causa da consulta; o NIF só fica na ficha quando o formulário é guardado.
 */
export function NifVerifyField({ register, errors, watch, name = "nif", onResolvedName }: NifVerifyFieldProps) {
  const value = String(watch(name) ?? "");
  const [state, setState] = useState<{ kind: "idle" } | { kind: "loading" } | { kind: "found"; name: string } | { kind: "error"; message: string }>({ kind: "idle" });

  async function verify() {
    setState({ kind: "loading" });
    try {
      const r = await settlementService.lookupNif(normalizeNif(value));
      setState({ kind: "found", name: r.name });
    } catch (e) {
      setState({ kind: "error", message: getApiErrorMessage(e, "Não foi possível verificar o NIF.") });
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="NIF (opcional)"
            startIcon="FileText"
            placeholder="Ex: 5417012345"
            {...register(name, { onChange: () => setState({ kind: "idle" }) })}
            error={errors[name]?.message as string | undefined}
          />
        </div>
        <Button type="button" variant="outline" disabled={!isValidNif(value) || state.kind === "loading"} onClick={() => void verify()} className="mb-0.5 gap-1.5">
          <Icon name={state.kind === "loading" ? "Loader2" : "ShieldCheck"} className={state.kind === "loading" ? "animate-spin" : ""} />
          Verificar NIF
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">Facultativo. Serve só para a fatura-recibo quando esta pessoa paga: é enviado ao MindGest, que emite o documento fiscal, e fica guardado cifrado. Sem NIF, a fatura sai em nome do aluno ou, se este também não tiver, como «consumidor final». Pode ser corrigido ou apagado a pedido do titular dos dados.</p>
      {state.kind === "found" && (
        <p className="flex flex-wrap items-center gap-2 text-xs text-emerald-700">
          <Icon name="CircleCheck" className="size-3.5" /> Contribuinte encontrado: <strong>{state.name}</strong>
          {onResolvedName && (
            <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => onResolvedName(state.name)}>Usar este nome</Button>
          )}
        </p>
      )}
      {state.kind === "error" && <p className="text-xs text-destructive">{state.message}</p>}
    </div>
  );
}
