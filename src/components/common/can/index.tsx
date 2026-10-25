"use client";

import type { ReactNode } from "react";
import { useCan } from "@/hooks/auth/use-can";

interface CanProps {
  /** Mostra os filhos se o utilizador tiver TODAS estas permissões... */
  permission?: string | string[];
  /** ...ou ALGUMA destas. */
  anyOf?: string[];
  /** O que mostrar a quem não pode (por omissão, nada). */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Mostra o conteúdo só a quem tem a permissão da API (ex.: botões de criar/editar). Quem apenas lê não vê ações de
 * escrita, em vez de as ver e levar um 403. A API continua a ser a barreira.
 */
export function Can({ permission, anyOf, fallback = null, children }: CanProps) {
  const { can, canAny } = useCan();
  const all = permission === undefined ? [] : Array.isArray(permission) ? permission : [permission];
  const allowed = can(...all) && (!anyOf || canAny(...anyOf));
  return <>{allowed ? children : fallback}</>;
}
