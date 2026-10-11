"use client";

import { useEffect, useState } from "react";
import { FormModal, FormSelect, FormTextarea } from "@/components";
import { enterImpersonationAction } from "@/actions/impersonation";
import { adminImpersonationService, type ImpersonationMode } from "@/modules/admin/services/admin-impersonation-service";
import type { AdminUser } from "@/modules/admin/services/admin-directory-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";

export const IMPERSONATE_MODAL = "admin-impersonate";

/** Utilizadores que podem ser personificados: activos, com papel numa escola e nunca administradores de sistema. */
export const canImpersonate = (u: AdminUser) => u.status === "activo" && u.memberships.some((m) => m.is_active) && !u.memberships.some((m) => m.role === "admin_sistema");

/**
 * Assume temporariamente a identidade de um utilizador (suporte). Salvaguardas: só leitura por omissão, duração máxima de 30 minutos,
 * motivo obrigatório, reautenticação, auditoria com o actor original e aviso por email ao Titular da escola.
 */
export function ImpersonateModal({ user }: { user: AdminUser | null }) {
  const schools = [...new Map((user?.memberships ?? []).filter((m) => m.is_active).map((m) => [m.school.id, m.school])).values()];
  const [schoolId, setSchoolId] = useState("");
  const [mode, setMode] = useState<ImpersonationMode>("leitura");
  const [minutes, setMinutes] = useState("15");
  const [reason, setReason] = useState("");
  useEffect(() => { setSchoolId(schools[0]?.id ?? ""); setMode("leitura"); setMinutes("15"); setReason(""); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!user) return;
    try {
      const started = await adminImpersonationService.start({ targetUserId: user.id, schoolId, reason: reason.trim(), durationMinutes: Number(minutes), mode });
      const entered = await enterImpersonationAction({ accessToken: started.access_token, expiresAt: started.expires_at, schoolId });
      if (!entered.ok) throw new Error(entered.message ?? "Não foi possível entrar na personificação.");
      // a escola activa passa a ser a da personificação; o recarregamento total limpa caches e dados do administrador
      useActiveSchoolStore.setState({ schoolId, memberships: [] });
      window.location.assign(entered.redirectPath ?? "/dashboard");
      await new Promise(() => undefined); // mantém o modal em «a enviar» até a página recarregar
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível iniciar a personificação."));
      throw e;
    }
  };

  return (
    <FormModal
      id={IMPERSONATE_MODAL} title="Personificar utilizador" submitLabel="Iniciar personificação"
      description={user ? `Vai ver o sistema como ${user.full_name} (${user.email}). O Titular da escola é avisado por email e tudo fica registado na auditoria com o seu nome.` : undefined}
      disabled={!user || !schoolId || reason.trim().length < 10} onSubmit={submit}
    >
      <FormSelect label="Escola" value={schoolId} onValueChange={setSchoolId} options={schools.map((s) => ({ value: s.id, label: s.name }))} />
      <FormSelect label="Duração" value={minutes} onValueChange={setMinutes} options={[5, 10, 15, 20, 30].map((m) => ({ value: String(m), label: `${m} minutos` }))} />
      <div className="sm:col-span-2">
        <FormSelect
          label="Modo" value={mode} onValueChange={(v) => setMode(v as ImpersonationMode)}
          options={[{ value: "leitura", label: "Só leitura (recomendado): consulta, não altera nada" }, { value: "escrita", label: "Leitura e escrita: pode alterar dados (excepto operações de alto risco)" }]}
        />
      </div>
      <div className="sm:col-span-2"><FormTextarea label="Motivo * (mínimo 10 caracteres)" value={reason} onChange={setReason} rows={3} placeholder="Ex.: Pedido #1234, a secretaria não consegue importar alunos." /></div>
    </FormModal>
  );
}
