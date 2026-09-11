import { authService } from "@/services/auth-service";
import { useMutation } from "@tanstack/react-query";

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authService.resetPassword(data),
  });
}
