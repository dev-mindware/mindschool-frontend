"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button, Icon } from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

export const TOTP_DIGITS = 6;
/** Só dígitos, no máximo 6 (cola de «123 456» ou «123-456» também funciona). */
export const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, TOTP_DIGITS);
/** Chave em grupos de 4 para ler e copiar à mão: «ABCD EFGH IJKL …». */
export const groupSecret = (secret: string) => secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();

const copy = (text: string, label: string) => navigator.clipboard.writeText(text).then(() => SucessMessage(`${label} copiado.`)).catch(() => ErrorMessage("Não foi possível copiar."));

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{n}</span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-medium">{title}</p>
        {children}
      </div>
    </li>
  );
}

/**
 * Passos para ligar o autenticador: instalar a aplicação, ler o código QR (ou copiar a chave, ou abrir a ligação no telemóvel) e confirmar
 * com o código de 6 dígitos. O QR é desenhado no navegador a partir da ligação `otpauth://`: a chave não sai daqui. Ao chegar ao 6.º dígito,
 * o formulário é submetido sozinho (`busy` evita um segundo envio).
 */
export function TotpSetupBody({ secret, code, onCode, busy }: { secret: { secret: string; otpauth_url: string }; code: string; onCode: (v: string) => void; busy: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (canvas.current) void QRCode.toCanvas(canvas.current, secret.otpauth_url, { width: 184, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
  }, [secret.otpauth_url]);

  const change = (raw: string) => {
    const v = onlyDigits(raw);
    onCode(v);
    if (v.length === TOTP_DIGITS && !busy) setTimeout(() => input.current?.form?.requestSubmit(), 0);
  };

  return (
    <ol className="sm:col-span-2 space-y-5">
      <Step n={1} title="Instale uma aplicação de autenticação">
        <p className="text-xs text-muted-foreground">Google Authenticator, Microsoft Authenticator, Authy ou 1Password. Já tem uma? Passe ao passo seguinte.</p>
      </Step>

      <Step n={2} title="Leia o código QR com a aplicação">
        <div className="flex flex-wrap items-start gap-4">
          <div className="rounded-lg border bg-white p-2"><canvas ref={canvas} aria-label="Código QR para o autenticador" /></div>
          <div className="min-w-0 flex-1 space-y-2 text-xs text-muted-foreground">
            <p>Na aplicação, escolha «Adicionar conta» e depois «Ler código QR».</p>
            <p>Não consegue ler? Escreva a chave à mão:</p>
            <div className="flex items-center gap-2">
              <code className="select-all break-all rounded bg-muted px-2 py-1.5 font-mono text-xs text-foreground">{groupSecret(secret.secret)}</code>
              <Button type="button" size="icon" variant="ghost" title="Copiar a chave" onClick={() => void copy(secret.secret, "Chave")}><Icon name="Copy" className="size-4" /></Button>
            </div>
            <a className="inline-flex items-center gap-1 underline" href={secret.otpauth_url}><Icon name="Smartphone" className="size-3.5" />Está no telemóvel? Abrir directamente na aplicação</a>
          </div>
        </div>
      </Step>

      <Step n={3} title="Escreva o código de 6 dígitos que a aplicação mostra">
        <input
          ref={input}
          value={code}
          onChange={(e) => change(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={TOTP_DIGITS + 3}
          placeholder="000000"
          aria-label="Código de 6 dígitos"
          className="w-full rounded-md border bg-background px-3 py-2 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="text-xs text-muted-foreground">O código muda a cada 30 segundos. Confirma sozinho ao escrever o 6.º dígito.</p>
      </Step>
    </ol>
  );
}
