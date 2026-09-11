"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Label,
  Icon,
  Separator,
} from "@/components"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SelectGroup } from "@radix-ui/react-select"

export function Appearance() {
  const { setTheme, theme } = useTheme()
  const [primaryColor, setPrimaryColor] = useState("#9956F6")
  const [font, setFont] = useState("Outfit")

  const themes = [
    { name: "Light", value: "light", img: "/themes/light.png" },
    { name: "Dark", value: "dark", img: "/themes/dark.png" },
    { name: "System", value: "system", img: "/themes/system.png" },
  ]

  useEffect(() => {
    const savedColor = localStorage.getItem("primary-color")
    const savedFont = localStorage.getItem("font-family")

    if (savedColor) {
      document.documentElement.style.setProperty("--primary", savedColor)
      setPrimaryColor(savedColor)
    }

    if (savedFont) {
      document.documentElement.style.setProperty("--font-family", savedFont)
      setFont(savedFont)
    }
  }, [])

  const handlePrimaryColorChange = (hex: string) => {
    document.documentElement.style.setProperty("--primary", hex)
    localStorage.setItem("primary-color", hex)
    setPrimaryColor(hex)
  }

  const handleFontChange = (fontName: string) => {
    const fontValue = `'${fontName}', sans-serif`
    document.documentElement.style.setProperty("--font-family", fontValue)
    localStorage.setItem("font-family", fontValue)
    setFont(fontName)
  }

  const restoreDefaults = () => {
    const defaultColor = "#9956F6"
    const defaultFont = "'Outfit', sans-serif"
    const defaultFontName = "Outfit"
    const defaultTheme = "system"

    document.documentElement.style.setProperty("--primary", defaultColor)
    document.documentElement.style.setProperty("--font-family", defaultFont)

    localStorage.removeItem("primary-color")
    localStorage.removeItem("font-family")
    localStorage.removeItem("mindware-theme")

    setPrimaryColor(defaultColor)
    setFont(defaultFontName)
    setTheme(defaultTheme)
  }

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Visual Identity Group */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] px-1">Identidade Visual</p>
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/30 shadow-sm">
          {/* Color Picker Item */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <Icon name="Palette" size={16} className="text-primary-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Cor Primária</p>
                <p className="text-[11px] text-muted-foreground">Cor de destaque da interface</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full border border-border/50 shadow-sm overflow-hidden relative cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{primaryColor}</span>
            </div>
          </div>

          {/* Font Selection Item */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <Icon name="Type" size={16} className="text-primary-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Tipografia</p>
                <p className="text-[11px] text-muted-foreground">Tipo de letra do sistema</p>
              </div>
            </div>
            <Select value={font} onValueChange={handleFontChange}>
              <SelectTrigger className="w-[120px] h-8 text-[11px] bg-muted/50 border-none rounded-lg">
                <SelectValue placeholder="Outfit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Outfit">Outfit</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Plus Jakarta Sans">Plus Jakarta</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Theme Selection Group */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] px-1">Tema sugerido</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ name, value, img }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "group relative flex flex-col gap-2 p-2 rounded-2xl bg-card border transition-all active:scale-95",
                theme === value ? "border-primary shadow-sm bg-primary/5" : "border-border/50 hover:border-border"
              )}
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/30 bg-muted">
                <Image
                  src={img}
                  alt={name}
                  fill
                  className="object-cover"
                />
                {theme === value && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                      <Icon name="Check" size={14} />
                    </div>
                  </div>
                )}
              </div>
              <p className={cn(
                "text-[10px] font-bold text-center uppercase tracking-wider",
                theme === value ? "text-primary" : "text-muted-foreground"
              )}>{name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-center">
        <Button 
          variant="ghost" 
          onClick={restoreDefaults}
          className="text-[11px] text-muted-foreground hover:text-foreground h-auto py-2 px-4 rounded-full"
        >
          <Icon name="RotateCcw" size={12} className="mr-2" />
          Restaurar padrões
        </Button>
      </div>
    </div>
  )
}
