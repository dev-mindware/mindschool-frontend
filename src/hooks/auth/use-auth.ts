import { useAuthStore } from "@/stores/auth";
import { SubscriptionStatus } from "@/types";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);

  const subscriptionStatus = user?.company?.subscription?.status;

  return { user, setUser, isAuthenticating, subscriptionStatus };
}
