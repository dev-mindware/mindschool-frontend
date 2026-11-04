"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useThemeEngine } from "@/providers/theme-engine-provider";
import {
  PRESET_THEMES,
  validateThemeInput,
  type BaseColorPreset,
  type ThemeInput,
  type UIMode,
  type UIDensity,
} from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemePreview } from "./theme-preview";
import { SURFACE_CARD } from "@/lib/theme/surfaces";
import { cn } from "@/lib/utils";

export function SchoolBrandingStudio() {
  const {
    schoolId,
    themeInput,
    previewInput,
    isPreviewing,
    setPreviewInput,
    resetPreview,
    publishChanges,
  } = useThemeEngine();

  const [formState, setFormState] = useState<ThemeInput>(previewInput);
  const [isPublishing, setIsPublishing] = useState(false);

  const validation = validateThemeInput(formState);

  const handleChange = <K extends keyof ThemeInput>(key: K, value: ThemeInput[K]) => {
    const updated = { ...formState, [key]: value };
    setFormState(updated);
    setPreviewInput(updated);
  };

  const handleBrandChange = (key: keyof ThemeInput["brand"], value: string) => {
    const updated = {
      ...formState,
      brand: { ...formState.brand, [key]: value },
    };
    setFormState(updated);
    setPreviewInput(updated);
  };

  const handlePresetSelect = (presetInput: ThemeInput) => {
    setFormState(presetInput);
    setPreviewInput(presetInput);
    toast.info("Preset aplicado no Live Preview.");
  };

  const handleReset = () => {
    resetPreview();
    setFormState(themeInput);
    toast.info("Alterações descartadas.");
  };

  const handlePublish = async () => {
    if (!validation.valid) {
      toast.error("Por favor corrija os erros de validação antes de publicar.");
      return;
    }
    setIsPublishing(true);
    try {
      await publishChanges();
      toast.success("Identidade visual da escola publicada e sincronizada com sucesso!");
    } catch {
      toast.error("Ocorreu um erro ao publicar as alterações na API.");
    } finally {
      setIsPublishing(false);
    }
  };

  const UI_MODE_OPTIONS: Array<{ mode: UIMode; title: string; desc: string; icon: any }> = [
    {
      mode: "default",
      title: "Standard",
      desc: "Superfícies sólidas, sem contornos pesados e com máxima produtividade.",
      icon: "Layout",
    },
    {
      mode: "apple",
      title: "Apple (Vidro)",
      desc: "Translucidez óptica (backdrop-blur 20px), profundidade fluida e raios generosos.",
      icon: "Sparkles",
    },
    {
      mode: "vintage",
      title: "Vintage (Académico)",
      desc: "Cantos vivos (rounded-xs), grelha de alto contraste e foco institucional estrito.",
      icon: "BookOpen",
    },
  ];

  const BASE_COLORS: Array<{ id: BaseColorPreset; label: string; desc: string }> = [
    { id: "neutral", label: "Neutral", desc: "Cinza puro e balanceado" },
    { id: "stone", label: "Stone", desc: "Cinza quente mineral clássico" },
    { id: "zinc", label: "Zinc", desc: "Cinza frio industrial moderno" },
    { id: "mauve", label: "Mauve", desc: "Toque subtil púrpura/violeta" },
    { id: "olive", label: "Olive", desc: "Toque natural esverdeado" },
    { id: "mist", label: "Mist", desc: "Toque ciano/oceânico leve" },
    { id: "taupe", label: "Taupe", desc: "Areia e terra acolhedora" },
  ];

  const DENSITY_OPTIONS: Array<{ id: UIDensity; label: string }> = [
    { id: "compact", label: "Compacta" },
    { id: "comfortable", label: "Confortável" },
    { id: "spacious", label: "Espaçosa" },
  ];

  const FONT_OPTIONS = [
    { id: "Outfit", label: "Outfit (Padrão MindSchool)" },
    { id: "Inter", label: "Inter" },
    { id: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
    { id: "Roboto", label: "Roboto" },
    { id: "Sistema", label: "Sistema Operativo" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Barra de Publicação / Live Preview Activo */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Brand Studio Escolar</h2>
            {isPreviewing && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                Modo Preview Activo
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Personalize a identidade da escola em tempo real. As alterações aplicam-se a todos os utilizadores da instituição.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPreviewing && (
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isPublishing}>
              <Icon name="RotateCcw" className="w-4 h-4 mr-1.5" />
              Descartar
            </Button>
          )}
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={!validation.valid || isPublishing}
            className="font-medium"
          >
            {isPublishing ? (
              <Icon name="Loader2" className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Icon name="Check" className="w-4 h-4 mr-1.5" />
            )}
            Publicar Identidade
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel Esquerdo: Controlos e Configurações */}
        <div className="lg:col-span-6 space-y-6">
          {/* Presets Temáticos Rápidos */}
          <div className={cn(SURFACE_CARD, "p-5 space-y-4")}>
            <div className="flex items-center gap-2">
              <Icon name="Palette" className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Presets Institucionais</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_THEMES.map((preset) => {
                const isSelected = formState.primary === preset.input.primary && formState.uiMode === preset.input.uiMode;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset.input)}
                    className={cn(
                      "text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between gap-2",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/60 hover:bg-muted/30"
                    )}
                  >
                    <div>
                      <div className="font-semibold text-foreground flex items-center justify-between">
                        <span>{preset.name}</span>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: preset.input.primary }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linguagem Visual (UI Mode) */}
          <div className={cn(SURFACE_CARD, "p-5 space-y-4")}>
            <div className="flex items-center gap-2">
              <Icon name="Layout" className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Modo Visual de Interface (UI Mode)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {UI_MODE_OPTIONS.map((opt) => {
                const isSelected = (formState.uiMode || "default") === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => handleChange("uiMode", opt.mode)}
                    className={cn(
                      "text-left p-3.5 rounded-lg border transition-all text-xs flex flex-col justify-between gap-3",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/60 hover:bg-muted/30"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{opt.title}</span>
                        {isSelected && <Icon name="Check" className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paleta de Cores e Contraste */}
          <div className={cn(SURFACE_CARD, "p-5 space-y-4")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Pipette" className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Cores da Instituição</h3>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground">
                WCAG AA Claro: {validation.contrastLight}:1
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Cor Primária */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Cor Primária</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-border shadow-inner overflow-hidden relative shrink-0 cursor-pointer"
                    style={{ backgroundColor: formState.primary }}
                  >
                    <input
                      type="color"
                      value={formState.primary}
                      onChange={(e) => handleChange("primary", e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <Input
                    value={formState.primary}
                    onChange={(e) => handleChange("primary", e.target.value)}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Cor Secundária */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Cor Secundária</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-border shadow-inner overflow-hidden relative shrink-0 cursor-pointer"
                    style={{ backgroundColor: formState.secondary }}
                  >
                    <input
                      type="color"
                      value={formState.secondary}
                      onChange={(e) => handleChange("secondary", e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <Input
                    value={formState.secondary}
                    onChange={(e) => handleChange("secondary", e.target.value)}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Aviso de Contraste WCAG */}
            {validation.contrastLight < 3.0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs flex items-center gap-2">
                <Icon name="AlertTriangle" className="w-4 h-4 shrink-0" />
                <span>
                  Aviso: Esta cor possui baixo contraste com fundos claros ({validation.contrastLight}:1). O sistema inverterá automaticamente os textos de botões para quase-preto.
                </span>
              </div>
            )}
          </div>

          {/* Base Neutra (7 Presets OKLCH) */}
          <div className={cn(SURFACE_CARD, "p-5 space-y-4")}>
            <div className="flex items-center gap-2">
              <Icon name="Layers" className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Base Neutra (Escala de Cinzentos OKLCH)</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BASE_COLORS.map((base) => {
                const isSelected = formState.baseColor === base.id;
                return (
                  <button
                    key={base.id}
                    type="button"
                    onClick={() => handleChange("baseColor", base.id)}
                    className={cn(
                      "p-2.5 rounded-lg border text-left transition-all text-xs space-y-0.5",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/60 hover:bg-muted/30"
                    )}
                  >
                    <div className="font-semibold text-foreground capitalize">{base.label}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">{base.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tipografia e Densidade */}
          <div className={cn(SURFACE_CARD, "p-5 space-y-4")}>
            <div className="flex items-center gap-2">
              <Icon name="Type" className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Tipografia & Densidade</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Fonte do Sistema</label>
                <select
                  value={formState.typography.fontFamily}
                  onChange={(e) =>
                    handleChange("typography", {
                      ...formState.typography,
                      fontFamily: e.target.value,
                    })
                  }
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Ritmo / Densidade</label>
                <div className="grid grid-cols-3 gap-1">
                  {DENSITY_OPTIONS.map((d) => {
                    const isSelected = (formState.density || "comfortable") === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleChange("density", d.id)}
                        className={cn(
                          "py-2 px-1 text-center rounded-lg border text-xs font-medium transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                        )}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Simulador Live Preview em Tempo Real */}
        <div className="lg:col-span-6">
          <div className="sticky top-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Simulador em Tempo Real
            </h3>
            <ThemePreview />
          </div>
        </div>
      </div>
    </div>
  );
}

