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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  // ✅ Continua true por padrão — espera o useFetchUser resolver
  // Mas o useFetchUser SEMPRE seta para false (sucesso OU erro)
  isAuthenticating: true,
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