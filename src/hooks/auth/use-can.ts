"use client";

import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/**
 * Permissões efectivas do utilizador na escola ativa (as mesmas que a API aplica). Serve para a interface mostrar só o
 * que o papel pode fazer: quem só lê não vê botões de criar/editar. A API continua a ser a única barreira.
 * Sem a lista (sessão antiga) assume-se «pode», e a API recusa se não puder.
 */
export function useCan() {
  const permissions = useActiveSchoolStore((s) => s.memberships.find((m) => m.schoolId === s.schoolId)?.permissions);
  const has = (p: string) => (permissions ? permissions.includes(p) : true);
  /** Verdadeiro se tiver TODAS as permissões indicadas. */
  const can = (...ps: string[]) => ps.every(has);
  /** Verdadeiro se tiver ALGUMA das permissões indicadas. */
  const canAny = (...ps: string[]) => ps.some(has);
  return { can, canAny, permissions };
}
