"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { securityService } from "@/services/security-service";

/** Sessoes, segundo factor (TOTP e passkeys) e codigos de recuperacao do utilizador autenticado. */
export function useSecurity() {
  const qc = useQueryClient();
  const sessions = useQuery({ queryKey: ["auth-sessions"], queryFn: securityService.sessions, staleTime: 15 * 1000 });
  const passkeys = useQuery({ queryKey: ["auth-passkeys"], queryFn: securityService.passkeys, staleTime: 15 * 1000 });
  const me = useQuery({ queryKey: ["auth-me-mfa"], queryFn: async () => (await (await import("@/services/api")).default.get<{ mfa_enabled?: boolean; mfa_enrollment_required?: boolean; user?: { mfa_enabled?: boolean } }>("/auth/me")).data, staleTime: 15 * 1000 });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["auth-sessions"] });
    qc.invalidateQueries({ queryKey: ["auth-passkeys"] });
    qc.invalidateQueries({ queryKey: ["auth-me-mfa"] });
    qc.invalidateQueries({ queryKey: ["me-mfa"] }); // o convite global ao 2.º factor reflecte o estado novo
  };
  const revoke = useMutation({ mutationFn: securityService.revokeSession, onSuccess: refresh });
  const logoutAll = useMutation({ mutationFn: securityService.logoutAll });
  const enroll = useMutation({ mutationFn: securityService.mfaEnroll });
  const verify = useMutation({ mutationFn: securityService.mfaVerify, onSuccess: refresh });
  const disable = useMutation({ mutationFn: (v: { password: string; code: string }) => securityService.mfaDisable(v.password, v.code), onSuccess: refresh });
  const recovery = useMutation({ mutationFn: securityService.recoveryCodes });
  const addPasskey = useMutation({ mutationFn: securityService.registerPasskey, onSuccess: refresh });
  const removePasskey = useMutation({ mutationFn: (v: { id: string; password: string }) => securityService.removePasskey(v.id, v.password), onSuccess: refresh });
  return {
    sessions: sessions.data ?? [], passkeys: passkeys.data ?? [], mfaEnabled: Boolean(me.data?.mfa_enabled ?? me.data?.user?.mfa_enabled), mfaRequired: me.data?.mfa_enrollment_required === true,
    revoke, logoutAll, enroll, verify, disable, recovery, addPasskey, removePasskey,
  };
}
