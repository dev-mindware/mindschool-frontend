"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { leaveImpersonationAction } from "@/actions/impersonation";
import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { ApiMe } from "@/utils/map-api-user";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Faixa visível em TODAS as páginas durante uma personificação (suporte): quem está a ser personificado, o modo (leitura/escrita),
 * quanto tempo resta e o botão para terminar. Ao chegar a zero termina sozinha e repõe a sessão do administrador.
 */
export function ImpersonationBanner() {
  const me = useQuery({ queryKey: ["me-impersonation"], queryFn: async () => (await api.get<ApiMe>("/auth/me")).data, staleTime: 60_000, refetchOnWindowFocus: false, retry: false });
  const imp = me.data?.impersonation;
  const [now, setNow] = useState(() => Date.now());
  const [leaving, setLeaving] = useState(false);

  const leave = async () => {
    if (leaving) return;
    setLeaving(true);
    const r = await leaveImpersonationAction();
    useActiveSchoolStore.setState({ schoolId: null, memberships: [] });
    window.location.assign(r.redirectPath ?? "/admin/users");
  };

  useEffect(() => {
    if (!imp) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [imp]);

  const remaining = imp ? Math.max(0, new Date(imp.expires_at).getTime() - now) : 0;
  useEffect(() => { if (imp && remaining === 0) void leave(); }, [imp, remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!imp || !me.data) return null;
  const s = Math.floor(remaining / 1000);
  return (
    <div role="alert" className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-amber-500 px-4 py-2 text-sm font-medium text-black shadow">
      <span className="flex items-center gap-2"><Icon name="UserCog" className="size-4" />A actuar como <strong>{me.data.full_name}</strong> ({me.data.email})</span>
      <span className="rounded bg-black/15 px-2 py-0.5 text-xs">{imp.write_enabled ? "Leitura e escrita" : "Só leitura"}</span>
      <span className="tabular-nums text-xs">Termina em {pad(Math.floor(s / 60))}:{pad(s % 60)}</span>
      <span className="hidden max-w-xs truncate text-xs md:inline" title={imp.reason}>Motivo: {imp.reason}</span>
      <Button size="sm" variant="secondary" className="h-7" disabled={leaving} onClick={() => void leave()}>{leaving ? "A terminar…" : "Terminar personificação"}</Button>
    </div>
  );
}
