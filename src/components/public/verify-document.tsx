"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Icon, Input } from "@/components";

interface Verification {
  valid: boolean;
  document_number: string;
  type: string;
  issued_at: string;
  school: string;
  holder: string;
}

const TYPE_LABEL: Record<string, string> = {
  declaracao: "Declaração",
  termo_frequencia: "Termo de Frequência",
  boletim: "Boletim de Notas",
  certificado: "Certificado de Habilitações",
  diploma: "Diploma",
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3011/api/v1";

/** Verificação pública de autenticidade (sem sessão): o número vem do QR/URL impressos no documento. */
export function VerifyDocument({ number }: { number?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(number ?? "");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "notfound" | "error">(number ? "loading" : "idle");
  const [result, setResult] = useState<Verification | null>(null);

  useEffect(() => {
    if (!number) return;
    const ctrl = new AbortController();
    fetch(`${API}/public/documents/verify/${encodeURIComponent(number)}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (res.status === 404) return setState("notfound");
        if (!res.ok) return setState("error");
        setResult((await res.json()) as Verification);
        setState("ok");
      })
      .catch((e) => { if (e?.name !== "AbortError") setState("error"); });
    return () => ctrl.abort();
  }, [number]);

  const submit = () => { const n = value.trim().toUpperCase(); if (n) router.push(`/verificar/${encodeURIComponent(n)}`); };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl items-center p-4">
      <Card className="w-full">
        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="ShieldCheck" className="size-5 text-primary" />Verificação de documentos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="flex-1"><Input label="Número do documento" placeholder="DEC-5000000001-2026-000001" value={value} onChange={(e) => setValue(e.target.value)} /></div>
            <Button type="submit" disabled={!value.trim()}>Verificar</Button>
          </form>

          {state === "loading" && <p className="text-sm text-muted-foreground">A verificar…</p>}
          {state === "notfound" && <p role="alert" className="rounded-xs border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">Documento não encontrado. Confirme o número impresso no documento.</p>}
          {state === "error" && <p role="alert" className="rounded-xs border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">Não foi possível verificar agora. Tente novamente dentro de instantes.</p>}
          {state === "ok" && result && (
            <div role="status" className="space-y-2 rounded-xs border border-emerald-500/40 bg-emerald-500/5 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400"><Icon name="BadgeCheck" className="size-4" />Documento autêntico</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">Número</dt><dd className="font-medium">{result.document_number}</dd>
                <dt className="text-muted-foreground">Tipo</dt><dd className="font-medium">{TYPE_LABEL[result.type] ?? result.type}</dd>
                <dt className="text-muted-foreground">Escola</dt><dd className="font-medium">{result.school}</dd>
                <dt className="text-muted-foreground">Titular</dt><dd className="font-medium">{result.holder}</dd>
                <dt className="text-muted-foreground">Emitido em</dt><dd className="font-medium">{new Date(result.issued_at).toLocaleDateString("pt-AO")}</dd>
              </dl>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
