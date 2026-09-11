"use client";

import { Icon } from "@/components";
import { cn } from "@/lib/utils";

export type MobileTab = "home" | "history" | "order" | "profile";

interface MobileNavBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  cartCount: number;
}

export function MobileNavBar({ activeTab, onTabChange, cartCount }: MobileNavBarProps) {
  const tabs = [
    { id: "home", label: "Início", icon: "LayoutGrid" as const },
    { id: "history", label: "Histórico", icon: "History" as const },
    { id: "order", label: "Carrinho", icon: "ShoppingCart" as const, count: cartCount },
    { id: "profile", label: "Configurações", icon: "Settings" as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around h-16 px-2 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as MobileTab)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            activeTab === tab.id ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="relative">
            <Icon name={tab.icon} size={24} />
            {tab.count !== undefined && tab.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
