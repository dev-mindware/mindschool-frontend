"use client";
import { formatDateTime } from "@/utils";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, FormModal, Icon, Input, type Column } from "@/components";
import { useSecurity } from "@/hooks/school/use-security";
import type { ApiPasskey, ApiSession } from "@/services/security-service";
import { RecoveryCodesBody } from "./recovery-codes-body";
import { TOTP_DIGITS, TotpSetupBody } from "./totp-setup-body";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, (e as Error)?.message || "A operação falhou.")); throw e; };

/** Segundo factor (TOTP), passkeys, códigos de recuperação e sessões activas — tudo com acções em modais. */
export function SecurityCenter() {
  const s = useSecurity();
  const { openModal, closeModal } = useModal();
  const [secret, setSecret] = useState<{ secret: string; otpauth_url: string } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [device, setDevice] = useState("Chave de segurança");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [passkey, setPasskey] = useState<ApiPasskey | null>(null);
  const [session, setSession] = useState<ApiSession | null>(null);

  const showCodes = (c: string[]) => { setCodes(c); openModal("sec-recovery-codes"); };
  const resetFields = () => { setCode(""); setPassword(""); };

  const passkeyColumns: Column<ApiPasskey>[] = [
    { key: "device_name", header: "Dispositivo", render: (_, p) => <span className="font-medium">{p.device_name}</span> },
    { key: "created_at", header: "Criada em", render: (_, p) => <span className="font-mono text-xs">{p.created_at.slice(0, 10)}</span> },
    { key: "last_used_at", header: "Última utilização", render: (_, p) => <span className="font-mono text-xs">{p.last_used_at ? p.last_used_at.slice(0, 10) : "—"}</span> },
    { key: "backed_up", header: "Cópia", render: (_, p) => (p.backed_up ? <Badge variant="outline">Sincronizada</Badge> : <Badge variant="secondary">Local</Badge>) },
    { key: "action", header: "Acção", render: (_, p) => <ButtonOnlyAction data={p} actions={[{ label: "Remover", icon: "Trash2", variant: "destructive", onClick: (x) => { setPasskey(x); resetFields(); openModal("sec-remove-passkey"); } }]} /> },
  ];

  const sessionColumns: Column<ApiSession>[] = [
    { key: "user_agent", header: "Dispositivo", render: (_, x) => (<div className="flex items-center gap-2"><span>{x.user_agent?.slice(0, 60) ?? "Dispositivo"}</span>{x.current && <Badge variant="outline">Esta sessão</Badge>}</div>) },
    { key: "ip", header: "IP", render: (_, x) => <span className="font-mono text-xs">{x.ip ?? "—"}</span> },
    { key: "started_at", header: "Iniciada", render: (_, x) => <span className="text-xs">{formatDateTime(x.started_at)}</span> },
    { key: "last_active_at", header: "Última actividade", render: (_, x) => <span className="text-xs">{formatDateTime(x.last_active_at)}</span> },
    { key: "action", header: "Acção", render: (_, x) => (x.current ? null : <ButtonOnlyAction data={x} actions={[{ label: "Terminar sessão", icon: "LogOut", variant: "destructive", onClick: (r) => { setSession(r); openModal("sec-end-session"); } }]} />) },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Autenticação em dois passos (TOTP)</h3>
            <p className="text-xs text-muted-foreground">Além da palavra-passe, pede um código de 6 dígitos gerado no telemóvel (Google Authenticator, Microsoft Authenticator, Authy…).</p>
          </div>
          <Badge variant="outline" className={s.mfaEnabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : ""}>{s.mfaEnabled ? "Segundo factor activo" : "Sem segundo factor"}</Badge>
        </div>
        {!s.mfaEnabled && s.mfaRequired && (
          <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
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
              <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={() => { resetFields(); openModal("sec-disable-mfa"); }}><Icon name="ShieldOff" className="size-4" />Desactivar</Button>
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
          <Button size="sm" className="gap-2" onClick={() => openModal("sec-add-passkey")}><Icon name="Plus" className="size-4" />Registar passkey</Button>
        </div>
        <DataList<ApiPasskey> prefix="passkeys" rows={s.passkeys} columns={passkeyColumns} emptyTitle="Nenhuma passkey registada" emptyDescription="Registe uma chave para iniciar sessão com mais segurança." emptyIcon="Fingerprint" skeletonCols={4} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Sessões activas</h3>
            <p className="text-xs text-muted-foreground">Dispositivos com sessão iniciada na sua conta.</p>
          </div>
          <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={() => openModal("sec-end-all")}><Icon name="LogOut" className="size-4" />Terminar todas</Button>
        </div>
        <DataList<ApiSession>
          prefix="sessoes"
          rows={s.sessions}
          columns={sessionColumns}
          filters={[{ key: "tipo", label: "Sessão", icon: "Monitor", options: [{ value: "actual", label: "Esta sessão" }, { value: "outras", label: "Outros dispositivos" }], match: (x, v) => (v === "actual" ? x.current : !x.current) }]}
          sorts={[{ value: "actividade", label: "Última actividade", compare: (a, b) => a.last_active_at.localeCompare(b.last_active_at) }]}
          emptyTitle="Sem sessões"
          emptyIcon="Monitor"
          skeletonCols={4}
        />
      </section>

      <FormModal id="sec-totp-setup" title="Configurar autenticador" description="Três passos rápidos: instalar, ler o código QR e confirmar." submitLabel="Activar" isLoading={s.verify.isPending} disabled={code.length < TOTP_DIGITS} onSubmit={() => s.verify.mutateAsync(code).then((r) => { SucessMessage("Autenticador activado."); setSecret(null); setCode(""); if (r.recovery_codes) showCodes(r.recovery_codes); }).catch((e) => { setCode(""); fail(e); })}>
        {secret && <TotpSetupBody secret={secret} code={code} onCode={setCode} busy={s.verify.isPending} />}
      </FormModal>

      <FormModal id="sec-new-codes" title="Novos códigos de recuperação" description="Os códigos anteriores deixam de funcionar. Confirme com o código actual do autenticador." submitLabel="Gerar códigos" isLoading={s.recovery.isPending} disabled={code.trim().length < 6} onSubmit={() => s.recovery.mutateAsync(code.trim()).then((r) => { setCode(""); SucessMessage("Novos códigos gerados."); showCodes(r.recovery_codes); }).catch(fail)}>
        <div className="sm:col-span-2"><Input label="Código actual *" startIcon="Hash" value={code} onChange={(e) => setCode(e.target.value)} /></div>
      </FormModal>

      <FormModal id="sec-disable-mfa" title="Desactivar segundo factor" description="A conta fica protegida apenas pela palavra-passe." submitLabel="Desactivar" isLoading={s.disable.isPending} disabled={!password || code.trim().length < 6} onSubmit={() => s.disable.mutateAsync({ password, code: code.trim() }).then(() => { SucessMessage("Segundo factor desactivado."); resetFields(); }).catch(fail)}>
        <Input label="Palavra-passe *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Código actual *" startIcon="Hash" value={code} onChange={(e) => setCode(e.target.value)} />
      </FormModal>

      <FormModal id="sec-add-passkey" title="Registar passkey" description="Dê um nome ao dispositivo e siga as instruções do navegador." submitLabel="Registar" isLoading={s.addPasskey.isPending} disabled={!device.trim()} onSubmit={() => s.addPasskey.mutateAsync(device.trim()).then((r) => { SucessMessage("Passkey registada."); if (r.recovery_codes) showCodes(r.recovery_codes); }).catch(fail)}>
        <div className="sm:col-span-2"><Input label="Nome do dispositivo *" startIcon="Fingerprint" value={device} onChange={(e) => setDevice(e.target.value)} /></div>
      </FormModal>

      <FormModal id="sec-remove-passkey" title="Remover passkey" description={passkey ? `Remover «${passkey.device_name}»? Confirme com a palavra-passe.` : undefined} submitLabel="Remover" isLoading={s.removePasskey.isPending} disabled={!password} onSubmit={() => (passkey ? s.removePasskey.mutateAsync({ id: passkey.id, password }).then(() => { SucessMessage("Passkey removida."); setPassword(""); }).catch(fail) : undefined)}>
        <div className="sm:col-span-2"><Input label="Palavra-passe *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      </FormModal>

      <FormModal id="sec-recovery-codes" title="Códigos de recuperação" description="Guarde-os agora num local seguro." readOnly onSubmit={() => closeModal("sec-recovery-codes")}>
        <RecoveryCodesBody codes={codes ?? []} />
      </FormModal>

      <ConfirmModal id="sec-end-session" destructive title="Terminar sessão" description="O dispositivo escolhido perde o acesso de imediato." confirmLabel="Terminar" isLoading={s.revoke.isPending} onConfirm={() => (session ? s.revoke.mutateAsync(session.id).then(() => SucessMessage("Sessão terminada.")).catch(fail) : undefined)} />
      <ConfirmModal id="sec-end-all" destructive title="Terminar todas as sessões" description="Todas as sessões, incluindo esta, serão terminadas e terá de iniciar sessão novamente." confirmLabel="Terminar todas" isLoading={s.logoutAll.isPending} onConfirm={() => s.logoutAll.mutateAsync().then(() => { window.location.href = "/auth/login"; }).catch(fail)} />
    </div>
  );
}
