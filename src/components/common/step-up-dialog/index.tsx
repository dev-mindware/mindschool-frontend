"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { passkeysSupported, stepUpWithPasskey } from "@/services/security-service";
import { completeStepUp, STEP_UP_REQUEST_EVENT, type StepUpRequest } from "@/lib/step-up";
import { stripControlChars, totpSixDigitSchema } from "@/schemas/helps";
import { getApiErrorMessage } from "@/utils/api-error";

const stepUpSchema = z.object({
  password: z
    .string()
    .transform((v) => stripControlChars(v))
    .refine((v) => v.trim().length > 0, "A palavra-passe é obrigatória.")
    .refine((v) => v.length <= 128, "A palavra-passe não pode exceder 128 caracteres."),
  code: z
    .string()
    .transform((v) => stripControlChars(v).replace(/[\s-]/g, ""))
    .refine(
      (v) => v === "" || totpSixDigitSchema.safeParse(v).success,
      "O código deve conter exatamente 6 dígitos numéricos."
    ),
});

/**
 * Janela de reautenticação para operações críticas (ver `lib/step-up.ts`). Montada uma só vez no layout: escuta o pedido
 * do cliente HTTP, valida a palavra-passe (e o código do segundo factor, se existir) e devolve o token de curta duração.
 */
export function StepUpDialog() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const request = useRef<StepUpRequest | null>(null);

  useEffect(() => {
    const onRequest = (e: Event) => {
      request.current = (e as CustomEvent<StepUpRequest>).detail;
      setPassword(""); setCode(""); setPasswordTouched(false); setCodeTouched(false); setError(null); setOpen(true);
    };
    window.addEventListener(STEP_UP_REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(STEP_UP_REQUEST_EVENT, onRequest);
  }, []);

  const parsed = stepUpSchema.safeParse({ password, code });
  const passwordError = passwordTouched && !parsed.success
    ? parsed.error.issues.find((i) => i.path[0] === "password")?.message
    : undefined;
  const codeError = (codeTouched || code.length > 0) && !parsed.success
    ? parsed.error.issues.find((i) => i.path[0] === "code")?.message
    : undefined;

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
    setPasswordTouched(true);
    setCodeTouched(true);
    if (!parsed.success || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post<{ step_up_token: string; expires_in: number }>("/auth/step-up", {
        password: parsed.data.password,
        ...(parsed.data.code ? { totp_code: parsed.data.code } : {}),
      });
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
            <Input
              id="stepup-password"
              type="password"
              autoComplete="current-password"
              maxLength={128}
              autoFocus
              value={password}
              error={passwordError}
              onChange={(e) => { setPassword(stripControlChars(e.target.value)); setPasswordTouched(true); setError(null); }}
              placeholder="Introduza a sua palavra-passe actual"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stepup-code">Código do segundo factor <span className="text-muted-foreground">(se ativo)</span></Label>
            <Input
              id="stepup-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={9}
              value={code}
              error={codeError}
              onChange={(e) => { setCode(stripControlChars(e.target.value)); setCodeTouched(true); setError(null); }}
              placeholder="000000"
            />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(true)}>Cancelar</Button>
            <Button type="submit" disabled={busy || !parsed.success}>{busy ? "A confirmar…" : "Confirmar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
