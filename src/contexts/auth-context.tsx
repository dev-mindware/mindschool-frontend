"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { SubscriptionGuard } from "@/components/guards/subscription-guard";
import { PUBLIC_ROUTES, AUTH_PAGES } from "@/constants/routes";
import { useFetchUser } from "@/hooks";
import { Loader } from "./loader";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  });
  const isAuthRoute = AUTH_PAGES.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  });
  const { isAuthenticating } = useAuthStore();

  // Só busca user em rotas privadas
  useFetchUser({ enabled: !isPublicRoute });

  if (isPublicRoute || isAuthRoute) return <>{children}</>;
  if (isAuthenticating) return <Loader />;

  return <SubscriptionGuard>{children}</SubscriptionGuard>;
}
