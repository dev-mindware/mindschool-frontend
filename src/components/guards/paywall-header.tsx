"use client";

import Logo from "@/assets/brand.png";
import Image from "next/image";
import { useAuthStore } from "@/stores";
import { useLogout } from "@/hooks/auth";

export function PaywallHeader() {
  const { isLoggingOut } = useAuthStore();
  const { handleLogout } = useLogout();

  return (
    <header className="sticky top-0 z-50 border-b bg-card border-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Image src={Logo} alt="Logo" className="size-12" />
          <button
            className="text-foreground cursor-pointer hover:underline font-bold text-base disabled:opacity-50 tracking-wide"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </header>
  );
}

