"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { passkeysSupported, stepUpWithPasskey } from "@/services/security-service";
import { completeStepUp, STEP_UP_REQUEST_EVENT, type StepUpRequest } from "@/lib/step-up";
import { getApiErrorMessage } from "@/utils/api-error";

/**
 * Janela de reautenticação para operações críticas (ver `lib/step-up.ts`). Montada uma só vez no layout: escuta o pedido
 * do cliente HTTP, valida a palavra-passe (e o código do segundo factor, se existir) e devolve o token de curta duração.
 */
export function StepUpDialog() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const request = useRef<StepUpRequest | null>(null);

  useEffect(() => {
    const onRequest = (e: Event) => {
      request.current = (e as CustomEvent<StepUpRequest>).detail;
      setPassword(""); setCode(""); setError(null); setOpen(true);
    };
    window.addEventListener(STEP_UP_REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(STEP_UP_REQUEST_EVENT, onRequest);
  }, []);

  const close = (cancelled: boolean) => {
    setOpen(false);
    if (cancelled) request.current?.reject(new Error("Reautenticação cancelada."));
    request.current = null;
  };

  const finish = (token: string, expiresIn: number) => {
    completeStepUp(token, expiresIn);
    request.current?.resolve(token);
    request.current = null;
    setOpen(false);
  };

  const usePasskey = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await stepUpWithPasskey();
      finish(data.step_up_token, data.expires_in);
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível confirmar com a passkey. Use a palavra-passe."));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post<{ step_up_token: string; expires_in: number }>("/auth/step-up", { password, ...(code.trim() ? { totp_code: code.trim() } : {}) });
      completeStepUp(data.step_up_token, data.expires_in);
      request.current?.resolve(data.step_up_token);
      request.current = null;
      setOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível confirmar a sua identidade."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(true); }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Confirme a sua identidade</DialogTitle>
            <DialogDescription>Esta operação é crítica. Confirme com a sua passkey ou introduza a palavra-passe (e o código do segundo factor, se o tiver).</DialogDescription>
          </DialogHeader>
          {passkeysSupported() && (
            <>
              <Button type="button" className="w-full" onClick={usePasskey} disabled={busy}>{busy ? "A confirmar…" : "Confirmar com passkey"}</Button>
              <p className="text-center text-xs text-muted-foreground">ou use a palavra-passe</p>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="stepup-password">Palavra-passe</Label>
            <Input id="stepup-password" type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stepup-code">Código do segundo factor <span className="text-muted-foreground">(se activo)</span></Label>
            <Input id="stepup-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(true)}>Cancelar</Button>
            <Button type="submit" disabled={busy || password.length === 0}>{busy ? "A confirmar…" : "Confirmar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
