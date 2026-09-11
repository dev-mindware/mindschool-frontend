import { authService } from "@/services/auth-service";
import { useMutation } from "@tanstack/react-query";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}
