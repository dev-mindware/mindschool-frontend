/**
 * Papéis sensíveis (administração de sistema, Titular, direcção, financeiro) só usam a API depois de activarem o segundo factor
 * (a API responde 403 `MFA_ENROLLMENT_REQUIRED` quando a política está activa, por omissão em produção). O cliente HTTP avisa
 * a interface com este evento e `MfaEnrollmentDialog` leva o utilizador à activação, em vez de mostrar páginas «restritas» sem explicação.
 */
export const MFA_ENROLLMENT_EVENT = "mfa:enrollment-required";

export function isMfaEnrollmentRequired(data: unknown): boolean {
  return typeof data === "object" && data !== null && (data as { code?: unknown }).code === "MFA_ENROLLMENT_REQUIRED";
}

export function notifyMfaEnrollmentRequired(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(MFA_ENROLLMENT_EVENT));
}
