import type { ThemeInput, ThemeConfig } from "./theme-types";
import { resolveTheme } from "./theme-derive";
import { resolveFontStack } from "./theme-fonts";

function buildCssBlock(config: ThemeConfig): string {
  const c = config.colors;
  const ext = config.extendedColors;
  const ui = config.uiTokens;

  return `
    --radius: ${ui.radius};
    --radius-xs: ${ui.radiusXs};
    --font-family: ${resolveFontStack(config.typography.fontFamily)};
    --font-app: ${resolveFontStack(config.typography.fontFamily)};

    --background: ${c.background};
    --foreground: ${c.foreground};
    --card: ${c.card};
    --card-foreground: ${c.cardForeground};
    --popover: ${c.popover};
    --popover-foreground: ${c.popoverForeground};

    --primary: ${c.primary};
    --primary-foreground: ${c.primaryForeground};
    --primary-50: ${c.primary50};
    --primary-100: ${c.primary100};
    --primary-200: ${c.primary200};
    --primary-300: ${c.primary300};
    --primary-400: ${c.primary400};
    --primary-500: ${c.primary500};
    --primary-600: ${c.primary600};
    --primary-700: ${c.primary700};
    --primary-800: ${c.primary800};
    --primary-900: ${c.primary900};

    --secondary: ${c.secondary};
    --secondary-foreground: ${c.secondaryForeground};
    --muted: ${c.muted};
    --muted-foreground: ${c.mutedForeground};
    --accent: ${c.accent};
    --accent-foreground: ${c.accentForeground};
    --destructive: ${c.destructive};
    --destructive-foreground: ${c.destructiveForeground};

    --border: ${c.border};
    --input: ${c.input};
    --ring: ${c.ring};

    --chart-1: ${c.chart1};
    --chart-2: ${c.chart2};
    --chart-3: ${c.chart3};
    --chart-4: ${c.chart4};
    --chart-5: ${c.chart5};

    --sidebar: ${c.sidebar};
    --sidebar-foreground: ${c.sidebarForeground};
    --sidebar-primary: ${c.sidebarPrimary};
    --sidebar-primary-foreground: ${c.sidebarPrimaryForeground};
    --sidebar-accent: ${c.sidebarAccent};
    --sidebar-accent-foreground: ${c.sidebarAccentForeground};
    --sidebar-border: ${c.sidebarBorder};
    --sidebar-ring: ${c.sidebarRing};

    --rail: ${c.rail};
    --rail-foreground: ${c.railForeground};
    --rail-active: ${c.railActive};
    --rail-active-bg: ${c.railActiveBg};
    --rail-hover: ${c.railHover};
    --brandbox: ${c.brandbox};
    --brandbox-foreground: ${c.brandboxForeground};
    --topbar: ${c.topbar};

    --success: ${ext.success};
    --success-soft: ${ext.successSoft};
    --success-foreground: #ffffff;
    --success-muted: ${ext.successSoft};
    --success-border: color-mix(in oklab, ${ext.success} 35%, transparent);

    --warning: ${ext.warning};
    --warning-soft: ${ext.warningSoft};
    --warning-foreground: #ffffff;
    --warning-muted: ${ext.warningSoft};
    --warning-border: color-mix(in oklab, ${ext.warning} 35%, transparent);

    --info: ${ext.info};
    --info-soft: ${ext.infoSoft};
    --info-foreground: #ffffff;
    --info-muted: ${ext.infoSoft};
    --info-border: color-mix(in oklab, ${ext.info} 35%, transparent);

    --destructive-muted: ${ext.destructiveSoft};
    --destructive-border: color-mix(in oklab, ${c.destructive} 35%, transparent);

    --special: color-mix(in oklab, var(--primary) 80%, black);
    --special-foreground: #ffffff;
    --special-muted: color-mix(in oklab, var(--primary) 8%, white);
    --special-border: color-mix(in oklab, var(--primary) 24%, white);

    --card-shadow: ${ui.cardShadow};
    --ui-surface: ${ui.surface};
    --ui-surface-elevated: ${ui.surfaceElevated};
    --ui-surface-chrome: ${ui.surfaceChrome};
    --ui-surface-overlay: ${ui.surfaceOverlay};
    --ui-backdrop-blur: ${ui.backdropBlur};
    --ui-card-shadow: ${ui.cardShadow};
    --ui-elevated-shadow: ${ui.elevatedShadow};
    --ui-card-border-color: ${ui.cardBorderColor};
    --ui-motion-fast: ${ui.motionFast};
    --ui-motion-normal: ${ui.motionNormal};
    --ui-motion-slow: ${ui.motionSlow};
    --ui-density-py: ${ui.paddingY};
    --ui-density-px: ${ui.paddingX};
    --ui-density-gap: ${ui.gap};
  `.trim();
}

export function generateThemeCssVariables(input: ThemeInput): string {
  const lightConfig = resolveTheme(input, "light");
  const darkConfig = resolveTheme(input, "dark");

  return `
    :root {
      ${buildCssBlock(lightConfig)}
    }
    .dark {
      ${buildCssBlock(darkConfig)}
    }
  `.trim();
}

