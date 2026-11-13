"use client";
import { formatDateTime, formatIsoDay } from "@/utils";

import { useState } from "react";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, FormModal, Icon, Input, type Column } from "@/components";
import { useSecurity } from "@/hooks/school/use-security";
import type { ApiPasskey, ApiSession } from "@/services/security-service";
import { safeTextSchema, stripControlChars, totpSixDigitSchema } from "@/schemas/helps";
import { RecoveryCodesBody } from "./recovery-codes-body";
import { TOTP_DIGITS, TotpSetupBody, onlyDigits } from "./totp-setup-body";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const currentPasswordSchema = z
  .string()
  .transform((v) => stripControlChars(v))
  .refine((v) => v.trim().length > 0, "A palavra-passe atual é obrigatória.")
  .refine((v) => v.length <= 128, "A palavra-passe não pode exceder 128 caracteres.");

const passkeyDeviceSchema = safeTextSchema(2, 80, "O nome do dispositivo");

const disableMfaSchema = z.object({
  password: currentPasswordSchema,
  code: totpSixDigitSchema,
});

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, (e as Error)?.message || "A operação falhou.")); throw e; };

/** Segundo factor (TOTP), passkeys, códigos de recuperação e sessões ativas — tudo com ações em modais. */
export function SecurityCenter() {
  const s = useSecurity();
  const { openModal, closeModal } = useModal();
  const [secret, setSecret] = useState<{ secret: string; otpauth_url: string } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [device, setDevice] = useState("Chave de segurança");
  const [codeTouched, setCodeTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [deviceTouched, setDeviceTouched] = useState(false);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [passkey, setPasskey] = useState<ApiPasskey | null>(null);
  const [session, setSession] = useState<ApiSession | null>(null);

  const showCodes = (c: string[]) => { setCodes(c); openModal("sec-recovery-codes"); };
  const resetFields = () => {
    setCode("");
    setPassword("");
    setCodeTouched(false);
    setPasswordTouched(false);
  };

  const codeResult = totpSixDigitSchema.safeParse(code);
  const passwordResult = currentPasswordSchema.safeParse(password);
  const deviceResult = passkeyDeviceSchema.safeParse(device);
  const disableMfaResult = disableMfaSchema.safeParse({ password, code });

  const codeError = (codeTouched || code.length > 0) && !codeResult.success ? codeResult.error.issues[0]?.message : undefined;
  const passwordError = passwordTouched && !passwordResult.success ? passwordResult.error.issues[0]?.message : undefined;
  const deviceError = (deviceTouched || device.length > 0) && !deviceResult.success ? deviceResult.error.issues[0]?.message : undefined;

  const passkeyColumns: Column<ApiPasskey>[] = [
    { key: "device_name", header: "Dispositivo", render: (_, p) => <span className="font-medium">{p.device_name}</span> },
    { key: "created_at", header: "Criada em", render: (_, p) => <span className="font-mono text-xs">{formatIsoDay(p.created_at)}</span> },
    { key: "last_used_at", header: "Última utilização", render: (_, p) => <span className="font-mono text-xs">{p.last_used_at ? formatIsoDay(p.last_used_at) : "—"}</span> },
    { key: "backed_up", header: "Cópia", render: (_, p) => (p.backed_up ? <Badge variant="outline">Sincronizada</Badge> : <Badge variant="secondary">Local</Badge>) },
    { key: "action", header: "Ação", render: (_, p) => <ButtonOnlyAction data={p} actions={[{ label: "Remover", icon: "Trash2", variant: "destructive", onClick: (x) => { setPasskey(x); resetFields(); openModal("sec-remove-passkey"); } }]} /> },
  ];

  const sessionColumns: Column<ApiSession>[] = [
    { key: "user_agent", header: "Dispositivo", render: (_, x) => (<div className="flex items-center gap-2"><span>{x.user_agent?.slice(0, 60) ?? "Dispositivo"}</span>{x.current && <Badge variant="outline">Esta sessão</Badge>}</div>) },
    { key: "ip", header: "IP", render: (_, x) => <span className="font-mono text-xs">{x.ip ?? "—"}</span> },
    { key: "started_at", header: "Iniciada", render: (_, x) => <span className="text-xs">{formatDateTime(x.started_at)}</span> },
    { key: "last_active_at", header: "Última atividade", render: (_, x) => <span className="text-xs">{formatDateTime(x.last_active_at)}</span> },
    { key: "action", header: "Ação", render: (_, x) => (x.current ? null : <ButtonOnlyAction data={x} actions={[{ label: "Terminar sessão", icon: "LogOut", variant: "destructive", onClick: (r) => { setSession(r); openModal("sec-end-session"); } }]} />) },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Autenticação em dois passos (TOTP)</h3>
            <p className="text-xs text-muted-foreground">Além da palavra-passe, pede um código de 6 dígitos gerado no telemóvel (Google Authenticator, Microsoft Authenticator, Authy…).</p>
          </div>
          <Badge variant="outline" className={s.mfaEnabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : ""}>{s.mfaEnabled ? "Segundo factor ativo" : "Sem segundo factor"}</Badge>
        </div>
        {!s.mfaEnabled && s.mfaRequired && (
          <div className="flex items-start gap-2 rounded-xs border border-primary/30 bg-primary/5 p-3 text-sm">
            <Icon name="ShieldAlert" className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>O seu perfil exige o segundo factor. Leva um minuto: clique em «Configurar autenticador» e siga os três passos.</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {!s.mfaEnabled && (
            <Button size="sm" className="gap-2" disabled={s.enroll.isPending} onClick={() => s.enroll.mutateAsync().then((r) => { setSecret(r); resetFields(); openModal("sec-totp-setup"); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>
              <Icon name="ShieldCheck" className="size-4" />Configurar autenticador
            </Button>
          )}
          {s.mfaEnabled && (
            <>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => { resetFields(); openModal("sec-new-codes"); }}><Icon name="KeyRound" className="size-4" />Novos códigos de recuperação</Button>
              <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={() => { resetFields(); openModal("sec-disable-mfa"); }}><Icon name="ShieldOff" className="size-4" />Desativar</Button>
            </>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Passkeys</h3>
            <p className="text-xs text-muted-foreground">Chaves de segurança, Windows Hello ou impressão digital como segundo factor.</p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => { setDevice("Chave de segurança"); setDeviceTouched(false); openModal("sec-add-passkey"); }}><Icon name="Plus" className="size-4" />Registar passkey</Button>
        </div>
        <DataList<ApiPasskey> prefix="passkeys" rows={s.passkeys} columns={passkeyColumns} emptyTitle="Nenhuma passkey registada" emptyDescription="Registe uma chave para iniciar sessão com mais segurança." emptyIcon="Fingerprint" skeletonCols={4} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Sessões ativas</h3>
            <p className="text-xs text-muted-foreground">Dispositivos com sessão iniciada na sua conta.</p>
          </div>
          <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={() => openModal("sec-end-all")}><Icon name="LogOut" className="size-4" />Terminar todas</Button>
        </div>
        <DataList<ApiSession>
          prefix="sessions"
          rows={s.sessions}
          columns={sessionColumns}
          filters={[{ key: "type", label: "Sessão", icon: "Monitor", options: [{ value: "current", label: "Esta sessão" }, { value: "others", label: "Outros dispositivos" }], match: (x, v) => (v === "current" ? x.current : !x.current) }]}
          sorts={[{ value: "activity", label: "Última atividade", compare: (a, b) => a.last_active_at.localeCompare(b.last_active_at) }]}
          emptyTitle="Sem sessões"
          emptyIcon="Monitor"
          skeletonCols={4}
        />
      </section>

      <FormModal id="sec-totp-setup" title="Configurar autenticador" description="Três passos rápidos: instalar, ler o código QR e confirmar." submitLabel="Ativar" isLoading={s.verify.isPending} disabled={!codeResult.success || s.verify.isPending} onSubmit={() => { setCodeTouched(true); if (!codeResult.success) return; return s.verify.mutateAsync(codeResult.data).then((r) => { SucessMessage("Autenticador ativado."); setSecret(null); resetFields(); if (r.recovery_codes) showCodes(r.recovery_codes); }).catch((e) => { setCode(""); setCodeTouched(false); fail(e); }); }}>
        {secret && <TotpSetupBody secret={secret} code={code} onCode={(v) => { setCode(v); setCodeTouched(true); }} busy={s.verify.isPending} error={codeError} />}
      </FormModal>

      <FormModal id="sec-new-codes" title="Novos códigos de recuperação" description="Os códigos anteriores deixam de funcionar. Confirme com o código atual do autenticador." submitLabel="Gerar códigos" isLoading={s.recovery.isPending} disabled={!codeResult.success || s.recovery.isPending} onSubmit={() => { setCodeTouched(true); if (!codeResult.success) return; return s.recovery.mutateAsync(codeResult.data).then((r) => { resetFields(); SucessMessage("Novos códigos gerados."); showCodes(r.recovery_codes); }).catch(fail); }}>
        <div className="sm:col-span-2">
          <Input
            label="Código atual *"
            startIcon="Hash"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={TOTP_DIGITS + 3}
            placeholder="Ex.: 123456"
            value={code}
            error={codeError}
            onChange={(e) => { setCode(onlyDigits(e.target.value)); setCodeTouched(true); }}
          />
        </div>
      </FormModal>

      <FormModal id="sec-disable-mfa" title="Desativar segundo factor" description="A conta fica protegida apenas pela palavra-passe." submitLabel="Desativar" isLoading={s.disable.isPending} disabled={!disableMfaResult.success || s.disable.isPending} onSubmit={() => { setPasswordTouched(true); setCodeTouched(true); if (!disableMfaResult.success) return; return s.disable.mutateAsync(disableMfaResult.data).then(() => { SucessMessage("Segundo factor desativado."); resetFields(); }).catch(fail); }}>
        <Input
          label="Palavra-passe *"
          type="password"
          autoComplete="current-password"
          maxLength={128}
          placeholder="Digite a sua palavra-passe atual..."
          value={password}
          error={passwordError}
          onChange={(e) => { setPassword(stripControlChars(e.target.value)); setPasswordTouched(true); }}
        />
        <Input
          label="Código atual *"
          startIcon="Hash"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={TOTP_DIGITS + 3}
          placeholder="Ex.: 123456"
          value={code}
          error={codeError}
          onChange={(e) => { setCode(onlyDigits(e.target.value)); setCodeTouched(true); }}
        />
      </FormModal>

      <FormModal id="sec-add-passkey" title="Registar passkey" description="Dê um nome ao dispositivo e siga as instruções do navegador." submitLabel="Registar" isLoading={s.addPasskey.isPending} disabled={!deviceResult.success || s.addPasskey.isPending} onSubmit={() => { setDeviceTouched(true); if (!deviceResult.success) return; return s.addPasskey.mutateAsync(deviceResult.data).then((r) => { SucessMessage("Passkey registada."); setDeviceTouched(false); if (r.recovery_codes) showCodes(r.recovery_codes); }).catch(fail); }}>
        <div className="sm:col-span-2">
          <Input
            label="Nome do dispositivo *"
            startIcon="Fingerprint"
            maxLength={80}
            placeholder="Ex.: MacBook Pro / Telemóvel Pessoal"
            value={device}
            error={deviceError}
            onChange={(e) => { setDevice(stripControlChars(e.target.value)); setDeviceTouched(true); }}
          />
        </div>
      </FormModal>

      <FormModal id="sec-remove-passkey" title="Remover passkey" description={passkey ? `Remover «${passkey.device_name}»? Confirme com a palavra-passe.` : undefined} submitLabel="Remover" isLoading={s.removePasskey.isPending} disabled={!passwordResult.success || s.removePasskey.isPending} onSubmit={() => { setPasswordTouched(true); if (!passkey || !passwordResult.success) return; return s.removePasskey.mutateAsync({ id: passkey.id, password: passwordResult.data }).then(() => { SucessMessage("Passkey removida."); resetFields(); }).catch(fail); }}>
        <div className="sm:col-span-2">
          <Input
            label="Palavra-passe *"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            placeholder="Digite a sua palavra-passe atual..."
            value={password}
            error={passwordError}
            onChange={(e) => { setPassword(stripControlChars(e.target.value)); setPasswordTouched(true); }}
          />
        </div>
      </FormModal>

      <FormModal id="sec-recovery-codes" title="Códigos de recuperação" description="Guarde-os agora num local seguro." readOnly onSubmit={() => closeModal("sec-recovery-codes")}>
        <RecoveryCodesBody codes={codes ?? []} />
      </FormModal>

      <ConfirmModal id="sec-end-session" destructive title="Terminar sessão" description="O dispositivo escolhido perde o acesso de imediato." confirmLabel="Terminar" isLoading={s.revoke.isPending} onConfirm={() => (session ? s.revoke.mutateAsync(session.id).then(() => SucessMessage("Sessão terminada.")).catch(fail) : undefined)} />
      <ConfirmModal id="sec-end-all" destructive title="Terminar todas as sessões" description="Todas as sessões, incluindo esta, serão terminadas e terá de iniciar sessão novamente." confirmLabel="Terminar todas" isLoading={s.logoutAll.isPending} onConfirm={() => s.logoutAll.mutateAsync().then(() => { window.location.href = "/auth/login"; }).catch(fail)} />
    </div>
  );
}
