/**
 * Receitas de classes utilitárias para superfícies padronizadas da aplicação.
 *
 * Ao invés de hardcodar bordas e sombras em dezenas de cartões, os componentes
 * consomem estas receitas que respeitam o UI Mode (Standard, Apple, Vintage)
 * através das variáveis CSS `--ui-*`.
 */

export const SURFACE_CARD =
  "rounded-lg border border-(--ui-card-border-color) bg-card text-card-foreground shadow-(--ui-card-shadow)";

export const SURFACE_ELEVATED =
  "rounded-lg bg-(--ui-surface-elevated) text-popover-foreground shadow-(--ui-elevated-shadow) backdrop-blur-(--ui-backdrop-blur)";

