"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components";
import { currentStoreStore } from "@/stores";
import { useLogout } from "@/hooks/auth";
import { useAuth } from "@/hooks/auth";
import { cn } from "@/lib/utils";

type PageTab = "home" | "history" | "order" | "profile" | "notifications";

interface MobilePosPageLayoutProps {
  children: React.ReactNode;
  activeTab?: PageTab;
  title?: string;
}

const tabs = [
  { id: "home" as PageTab, label: "Início", icon: "LayoutGrid" as const, route: "/pos/counter" },
  { id: "history" as PageTab, label: "Histórico", icon: "History" as const, route: "/pos/counter?tab=history" },
  { id: "order" as PageTab, label: "Carrinho", icon: "ShoppingCart" as const, route: "/pos/counter?tab=order" },
  { id: "profile" as PageTab, label: "Configurações", icon: "Settings" as const, route: "/pos/settings" },
];

export function MobilePosPageLayout({
  children,
  activeTab = "profile",
  title,
}: MobilePosPageLayoutProps) {
  const router = useRouter();
  const { currentStore } = currentStoreStore();
  const { handleLogout } = useLogout();
  const { user } = useAuth();

  const canGoToDashboard = user?.role === "OWNER" || user?.role === "MANAGER";

  return (
    <div className="flex flex-col h-dvh bg-background overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 shrink-0 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Store" size={18} className="text-primary" />
            </div>
            <h1
              className="text-lg font-bold truncate max-w-[160px]"
              title={currentStore?.name}
            >
              {title || currentStore?.name || "Empresa"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {canGoToDashboard && (
              <button
                onClick={() => router.push("/dashboard")}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                title="Ir para Dashboard"
              >
                <Icon name="LayoutDashboard" size={18} />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
              title="Sair"
            >
              <Icon name="LogOut" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-16">
        {children}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around h-16 px-2 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(tab.route)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon name={tab.icon} size={24} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
