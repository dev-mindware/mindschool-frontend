"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/stores";
import { authService } from "@/services/auth-service";
import { User } from "@/types";
import { clearLocalSession } from "@/actions/auth";

async function fetchCurrentUser(): Promise<User> {
  const user = await authService.getMe();
  if (!user) throw new Error("Sessão inválida");
  return user;
}

interface UseFetchUserOptions {
  enabled?: boolean;
}

export function useFetchUser({ enabled = true }: UseFetchUserOptions = {}) {
  const { setUser, setIsAuthenticating } = useAuthStore();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: fetchCurrentUser,
    enabled: enabled && process.env.NEXT_PUBLIC_BYPASS_AUTH !== "true",
    retry: false, // ✅ FIX: não retry para evitar múltiplos requests em loop
    staleTime: 5 * 60 * 1000,
  });

  // ✅ FIX: sempre fecha o loading, sucesso ou falha
  useEffect(() => {
    if (!enabled) {
      setIsAuthenticating(false);
      return;
    }

    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      setUser({
        id: "dev-admin-1",
        name: "Administrador MindSchool",
        email: "admin@mindschool.ao",
        role: "OWNER",
        phone: "923000000",
        company: {
          id: "dev-school-1",
          name: "Colégio MindSchool",
          taxNumber: "5000000000",
          phone: "923000000",
          email: "secretaria@mindschool.ao",
          address: "Luanda, Angola",
          isActive: true,
          subscription: {
            id: "sub-1",
            status: "ACTIVE",
            plan: {
              id: "enterprise",
              name: "enterprise",
              price: 25000,
              billingCycle: "MONTHLY",
            } as any,
          } as any,
        } as any,
        store: {
          id: "store-1",
          name: "Campus Central",
        },
      });
      setIsAuthenticating(false);
      return;
    }

    if (query.isSuccess && query.data) {
      setUser(query.data);
      setIsAuthenticating(false);
    }

    if (query.isError) {
      // Falha em buscar user → sessão inválida → limpa tudo
      (async () => {
        await clearLocalSession();
        setUser(null);
        setIsAuthenticating(false);
      })();
    }
  }, [
    enabled,
    query.isSuccess,
    query.isError,
    query.data,
    setUser,
    setIsAuthenticating,
  ]);

  // Listener para evento de sessão expirada (vindo do interceptor axios)
  useEffect(() => {
    function handleSessionExpired() {
      if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") return;
      setUser(null);
      setIsAuthenticating(false);
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/auth/login"
      ) {
        window.location.replace("/auth/login");
      }
    }

    window.addEventListener("session:expired", handleSessionExpired);
    return () =>
      window.removeEventListener("session:expired", handleSessionExpired);
  }, [setUser, setIsAuthenticating]);

  return query;
}
