import { create } from "zustand";
import { User } from "@/types";
import { logoutAction } from "@/actions/login";
import { queryClient } from "@/lib";

interface AuthState {
  user: User | null;
  isAuthenticating: boolean;
  isLoggingOut: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  logout: () => Promise<void>;
}

const DEV_MOCK_USER: User | null =
  process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
    ? {
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
      }
    : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEV_MOCK_USER,
  isAuthenticating: process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ? false : true,
  isLoggingOut: false,

  setUser: (user) => set({ user }),
  setIsAuthenticating: (isAuthenticating) => set({ isAuthenticating }),

  logout: async () => {
    // Evita logout duplo
    if (get().isLoggingOut) return;

    set({ isLoggingOut: true, isAuthenticating: true, user: null });

    try {
      await logoutAction();
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      queryClient.clear();
      set({ isLoggingOut: false });

      // ✅ FIX: só faz hard redirect se não estiver já em /auth/login
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/auth/login"
      ) {
        window.location.replace("/auth/login");
      } else {
        set({ isAuthenticating: false });
      }
    }
  },
}));

/* import { create } from "zustand";
import { User } from "@/types";
import { logoutAction } from "@/actions/login";
import { queryClient } from "@/lib";

interface AuthState {
  user: User | null;
  isAuthenticating: boolean;
  isLoggingOut: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticating: true,
  isLoggingOut: false,

  setUser: (user) => set({ user }),
  setIsAuthenticating: (isAuthenticating) => set({ isAuthenticating }),

  // ✅ Limpa estado, React Query e redireciona
  logout: async () => {
    set({ isLoggingOut: true, isAuthenticating: true, user: null }); // bloqueia tudo antes
    try {
      await logoutAction();
    } catch (error) {
      console.error("🚨 Erro ao fazer logout remoto:", error);
    } finally {
      queryClient.clear(); // Limpa toda a cache antiga (incluindo o ["user"])
      if (typeof window !== "undefined") {
        localStorage.removeItem("current-store");
        localStorage.removeItem("MGEST-AUTH-STORE");
        window.location.replace("/auth/login"); // Hard redirect para limpar a memória do browser
      }
      set({ isLoggingOut: false });
    }
  },
}));
 */