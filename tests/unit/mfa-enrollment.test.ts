import { isMfaEnrollmentRequired, MFA_ENROLLMENT_EVENT, notifyMfaEnrollmentRequired } from "@/lib/mfa-enrollment";

describe("segundo factor obrigatório", () => {
  it("reconhece o código da API e ignora o resto", () => {
    expect(isMfaEnrollmentRequired({ code: "MFA_ENROLLMENT_REQUIRED", status: 403 })).toBe(true);
    expect(isMfaEnrollmentRequired({ code: "FORBIDDEN" })).toBe(false);
    expect(isMfaEnrollmentRequired(undefined)).toBe(false);
    expect(isMfaEnrollmentRequired("MFA_ENROLLMENT_REQUIRED")).toBe(false);
  });

  it("avisa a interface com um evento", () => {
    const seen = jest.fn();
    window.addEventListener(MFA_ENROLLMENT_EVENT, seen);
    notifyMfaEnrollmentRequired();
    window.removeEventListener(MFA_ENROLLMENT_EVENT, seen);
    expect(seen).toHaveBeenCalledTimes(1);
  });
});
