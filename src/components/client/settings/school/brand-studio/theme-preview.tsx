"use client";

import { useState } from "react";
import { useThemeEngine } from "@/providers/theme-engine-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { Badge } from "@/components/ui/badge";
import { SURFACE_CARD, SURFACE_ELEVATED } from "@/lib/theme/surfaces";
import { cn } from "@/lib/utils";

export function ThemePreview() {
  const { previewInput, themeConfig } = useThemeEngine();
  const [activeSegment, setActiveSegment] = useState<"geral" | "horas" | "taxas">("geral");
  const isApple = previewInput.uiMode === "apple";

  return (
    <div
      className={cn(
        "space-y-6 transition-all duration-500",
        isApple &&
          "p-5 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-gradient-to-b from-primary/10 via-background/60 to-background/90"
      )}
    >
      {/* Barra de Contexto do Modo e Densidade */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg border border-border/40 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" className="w-4 h-4 text-primary" />
          <span className="font-semibold">Pré-visualização em Tempo Real (Live Preview)</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] uppercase font-mono tracking-wider",
              isApple && "rounded-full bg-primary/15 text-primary border-primary/30"
            )}
          >
            Modo: {previewInput.uiMode || "default"}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] uppercase font-mono tracking-wider",
              isApple && "rounded-full"
            )}
          >
            Densidade: {previewInput.density || "comfortable"}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] uppercase font-mono tracking-wider",
              isApple && "rounded-full"
            )}
          >
            Base: {previewInput.baseColor}
          </Badge>
        </div>
      </div>

      {/* Barra de Pesquisa e Controlos Apple (inspirada nas interfaces fluidas visionOS / macOS) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Icon
            name="Search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <input
            type="text"
            readOnly
            value="Pesquisar estudante, pauta ou lançamento..."
            className={cn(
              "w-full h-9 pl-9 pr-4 text-xs bg-muted/30 border border-border/50 text-muted-foreground transition-all cursor-default select-none",
              isApple
                ? "rounded-full bg-white/5 border-white/10 backdrop-blur-md shadow-xs focus:outline-none"
                : "rounded-md"
            )}
          />
        </div>

        {/* Segmented Control Cápsula (como nos dashboards visionOS) */}
        <div
          className={cn(
            "flex items-center p-1 bg-muted/40 border border-border/40 text-xs",
            isApple ? "rounded-full bg-white/5 border-white/10 backdrop-blur-md" : "rounded-md"
          )}
        >
          <button
            type="button"
            onClick={() => setActiveSegment("geral")}
            className={cn(
              "px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
              isApple ? "rounded-full" : "rounded-sm",
              activeSegment === "geral"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Estatísticas
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("horas")}
            className={cn(
              "px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
              isApple ? "rounded-full" : "rounded-sm",
              activeSegment === "horas"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Horas & Aulas
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("taxas")}
            className={cn(
              "px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
              isApple ? "rounded-full" : "rounded-sm",
              activeSegment === "taxas"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Aproveitamento
          </button>
        </div>
      </div>

      {/* 1. Header do Estabelecimento Escolar */}
      <div className={cn(SURFACE_CARD, "p-5", isApple && "rounded-2xl")}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 flex items-center justify-center font-semibold text-lg shadow-sm transition-all",
                isApple ? "rounded-2xl shadow-md" : "rounded-lg"
              )}
              style={{
                backgroundColor: previewInput.primary,
                color: themeConfig.colors.primaryForeground,
              }}
            >
              {previewInput.brand.name.substring(0, 2).toUpperCase() || "MS"}
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground tracking-tight">
                {previewInput.brand.name || "Instituto Politécnico Vanguard"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Ministério da Educação da República de Angola • Ano Lectivo 2026/2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className={cn("text-xs font-medium cursor-pointer", isApple && "rounded-full")}
            >
              <Icon name="Printer" className="w-3.5 h-3.5 mr-1" />
              Imprimir
            </Button>
            <Button
              size="sm"
              className={cn("text-xs font-medium cursor-pointer shadow-xs", isApple && "rounded-full")}
              style={{
                backgroundColor: previewInput.primary,
                color: themeConfig.colors.primaryForeground,
              }}
            >
              <Icon name="Plus" className="w-3.5 h-3.5 mr-1" />
              Nova Matrícula
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Grelha de Métricas e KPIs com Tratamento Óptico Glass (Gráficos Donut & Barras de Progresso) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cartão 1: Total Alunos com Mini Barra de Progresso */}
        <div className={cn(SURFACE_CARD, "p-4.5 space-y-2.5", isApple && "rounded-xl")}>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium">Total de Estudantes</span>
            <div className={cn("p-1.5 rounded-full bg-primary/10 text-primary")}>
              <Icon name="Users" className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-foreground tracking-tight">1.480</div>
            <div className="text-[11px] text-success font-medium flex items-center gap-1">
              <Icon name="TrendingUp" className="w-3 h-3" />
              <span>+12% face ao ano anterior</span>
            </div>
          </div>
          {/* Barra de Progresso Fluida Apple */}
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: "78%", backgroundColor: previewInput.primary }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>Capacidade instalada</span>
              <span>78%</span>
            </div>
          </div>
        </div>

        {/* Cartão 2: Arrecadação de Propinas com Indicador Ring / Donut */}
        <div className={cn(SURFACE_CARD, "p-4.5 space-y-2", isApple && "rounded-xl")}>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium">Arrecadação de Propinas</span>
            <div className="p-1.5 rounded-full bg-primary/10 text-primary">
              <Icon name="CreditCard" className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-2xl font-semibold text-foreground tracking-tight">94,6%</div>
              <div className="text-[11px] text-muted-foreground">Regularizadas</div>
            </div>
            {/* Donut Chart Ring SVG estilo VisionOS */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted/30 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray="94.6, 100"
                  strokeLinecap="round"
                  fill="none"
                  className="text-primary transition-all duration-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ color: previewInput.primary }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-semibold text-foreground">
                95%
              </span>
            </div>
          </div>
        </div>

        {/* Cartão 3: Aproveitamento Geral com Análise Qualitativa */}
        <div className={cn(SURFACE_CARD, "p-4.5 space-y-2.5", isApple && "rounded-xl")}>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium">Média Global</span>
            <div className="p-1.5 rounded-full bg-primary/10 text-primary">
              <Icon name="GraduationCap" className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-foreground tracking-tight">14,8 / 20</div>
            <div className="text-[11px] text-primary font-medium flex items-center gap-1">
              <Icon name="Award" className="w-3 h-3" />
              <span>Conforme Decreto Presidencial 424/25</span>
            </div>
          </div>
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-success"
                style={{ width: "74%" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>Aprovados directos</span>
              <span className="text-success font-medium">84.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Amostra de Tabela Translúcida / Mini Pauta de Alunos */}
      <div className={cn(SURFACE_CARD, "overflow-hidden", isApple && "rounded-2xl")}>
        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-muted/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Icon name="BookOpen" className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pauta Resumida da Turma (10.ª Classe - A)
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn("text-[10px]", isApple && "rounded-full bg-white/5 border-white/10")}
          >
            Trimestre I
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border/40 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">N.º</th>
                <th className="py-2.5 px-3 font-semibold">Nome do Estudante</th>
                <th className="py-2.5 px-3 font-semibold text-center">Matemática</th>
                <th className="py-2.5 px-3 font-semibold text-center">Física</th>
                <th className="py-2.5 px-3 font-semibold text-center">Química</th>
                <th className="py-2.5 px-3 font-semibold text-center">Média MT</th>
                <th className="py-2.5 px-3 font-semibold text-center">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-medium">01</td>
                <td className="py-2.5 px-3 font-semibold text-foreground">Afonso Manuel Domingos</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground">16.5</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground">15.0</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground">17.2</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground bg-muted/30">16.2</td>
                <td className="py-2.5 px-3 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-success-muted text-success border-success-border text-[10px]",
                      isApple && "rounded-full shadow-2xs"
                    )}
                  >
                    Transita
                  </Badge>
                </td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-medium">02</td>
                <td className="py-2.5 px-3 font-semibold text-foreground">Beatriz Kipungo Vieira</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-destructive">08.5</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground">13.0</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground">11.0</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground bg-muted/30">10.8</td>
                <td className="py-2.5 px-3 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-warning-muted text-warning border-warning-border text-[10px]",
                      isApple && "rounded-full shadow-2xs"
                    )}
                  >
                    Transita (Art. 24.º)
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Amostra de Camada Elevada / Popover com Tratamento de Profundidade */}
      <div
        className={cn(
          SURFACE_ELEVATED,
          "p-4 space-y-2 border border-border/40",
          isApple && "rounded-xl border-white/15 shadow-xl"
        )}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Icon name="Layers" className="w-4 h-4 text-primary" />
          <span>Camada Flutuante & Translucidez Óptica</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tratamento de materiais e profundidade Apple: reflexo especular de borda superior (luz a incidir no topo do vidro), desfoque fosco contínuo (24px) e resposta táctil elástica imediata com curvas físicas <code className="font-mono text-[10px] text-primary">cubic-bezier(0.32, 0.72, 0, 1)</code>.
        </p>
      </div>
    </div>
  );
}
