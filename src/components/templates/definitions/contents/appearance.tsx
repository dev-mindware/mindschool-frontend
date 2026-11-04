"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Icon,
} from "@/components";
import { Button } from "@/components/ui/button";
import { SelectGroup } from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth";
import { useCan } from "@/hooks/auth/use-can";
import { SchoolBrandingStudio } from "@/components/client/settings/school/brand-studio/school-branding-studio";
import {
  DEFAULT_FONT,
  DEFAULT_PRIMARY,
  readFont,
  resetAppearance,
  saveFont,
  type FontName,
} from "@/lib/appearance";

export function Appearance() {
  const { setTheme, theme } = useTheme();
  const { user } = useAuth();
  const { can } = useCan();
  const [font, setFont] = useState<FontName>(DEFAULT_FONT);
  const [isMounted, setIsMounted] = useState(false);

  const role = user?.role ?? "";
  const isManager = [
    "DIRECTOR_GENERAL",
    "PEDAGOGIC_DIRECTOR",
    "OWNER",
    "MANAGER",
    "ADMIN",
  ].includes(role);
  const canManageBrand = isManager && can("school:update");

  const themes = [
    { name: "Claro", value: "light", img: "/themes/light.png" },
    { name: "Escuro", value: "dark", img: "/themes/dark.png" },
    { name: "Sistema", value: "system", img: "/themes/system.png" },
  ];

  useEffect(() => {
    setFont(readFont());
    setIsMounted(true);
  }, []);

  const handleFontChange = (fontName: string) => {
    saveFont(fontName as FontName);
    setFont(fontName as FontName);
  };

  const restoreDefaults = () => {
    resetAppearance();
    localStorage.removeItem("mindware-theme");
    setFont(DEFAULT_FONT);
    setTheme("system");
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Modo de Apresentação Global (Claro / Escuro / Sistema) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
            Modo de Apresentação
          </p>
          <span className="text-xs text-muted-foreground">
            Alternância instantânea do ambiente
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ name, value, img }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "group relative flex flex-col items-stretch gap-2 p-2 rounded-xs bg-card border transition-all active:scale-95 text-left cursor-pointer",
                theme === value
                  ? "border-primary shadow-xs bg-primary/5 ring-1 ring-primary"
                  : "border-border/60 hover:border-border hover:bg-muted/20"
              )}
            >
              <div className="relative aspect-[4/3] w-full rounded-xs overflow-hidden border border-border/30 bg-muted">
                <Image
                  src={img}
                  alt={name}
                  fill
                  className="object-cover"
                />
                {theme === value && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                      <Icon name="Check" size={14} />
                    </div>
                  </div>
                )}
              </div>
              <p
                className={cn(
                  "text-[10px] font-semibold text-center uppercase tracking-wider",
                  theme === value ? "text-primary" : "text-muted-foreground"
                )}
              >
                {name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Identidade Visual & Brand Studio da Escola (quando aplicável) */}
      {canManageBrand ? (
        <div className="pt-2">
          <SchoolBrandingStudio />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] px-1">
              Preferências Pessoais de Ecrã
            </p>
            <div className="bg-card rounded-xs border border-border/50 overflow-hidden divide-y divide-border/30 shadow-xs">
              {/* Tipografia */}
              <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xs bg-primary/10 flex items-center justify-center">
                    <Icon name="Type" size={16} className="text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Tipografia</p>
                    <p className="text-[11px] text-muted-foreground">Tipo de letra preferido no sistema</p>
                  </div>
                </div>
                <Select value={font} onValueChange={handleFontChange}>
                  <SelectTrigger className="w-[140px] h-8 text-[11px] bg-muted/50 border-none rounded-xs cursor-pointer">
                    <SelectValue placeholder="Outfit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Outfit">Outfit</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Sistema">Sistema</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <Button
              variant="ghost"
              onClick={restoreDefaults}
              className="text-[11px] text-muted-foreground hover:text-foreground h-auto py-2 px-4 rounded-full cursor-pointer"
            >
              <Icon name="RotateCcw" size={12} className="mr-2" />
              Restaurar padrões
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
