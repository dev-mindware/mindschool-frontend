import type { UIMode, UIDensity, UIDesignTokens } from "./theme-types";

const BASE_RADIUS = "0.5rem";

const CARD_SHADOW_LIGHT = "0 1px 2px 0 rgb(0 0 0 / 0.05)";
const CARD_SHADOW_DARK = "0 1px 2px 0 rgb(0 0 0 / 0.5)";

const ELEVATED_SHADOW_LIGHT =
  "0 4px 16px -6px rgb(0 0 0 / 0.12), 0 1px 2px 0 rgb(0 0 0 / 0.04)";
const ELEVATED_SHADOW_DARK =
  "0 4px 16px -6px rgb(0 0 0 / 0.6), 0 1px 2px 0 rgb(0 0 0 / 0.4)";

export function resolveUIModeTokens(
  uiMode: UIMode = "default",
  density: UIDensity = "comfortable",
  colorMode: "light" | "dark" = "light",
  baseRadius: string = BASE_RADIUS
): UIDesignTokens {
  const isDark = colorMode === "dark";

  let paddingY = "0.5rem";
  let paddingX = "0.75rem";
  let gap = "0.5rem";

  if (density === "compact") {
    paddingY = "0.25rem";
    paddingX = "0.5rem";
    gap = "0.375rem";
  } else if (density === "spacious") {
    paddingY = "0.75rem";
    paddingX = "1.25rem";
    gap = "0.75rem";
  }

  const cardShadow = isDark ? CARD_SHADOW_DARK : CARD_SHADOW_LIGHT;
  const elevatedShadow = isDark ? ELEVATED_SHADOW_DARK : ELEVATED_SHADOW_LIGHT;
  const overlay = isDark ? "rgb(0 0 0 / 0.7)" : "rgb(0 0 0 / 0.45)";

  switch (uiMode) {
    case "apple":
      return {
        mode: "apple",
        density,
        radius: "0.75rem",
        radiusXs: "0.5rem",
        surface: "var(--card)",
        surfaceElevated: isDark
          ? "color-mix(in oklab, var(--popover) 82%, transparent)"
          : "color-mix(in oklab, var(--popover) 86%, transparent)",
        surfaceChrome: isDark
          ? "color-mix(in oklab, var(--topbar) 72%, transparent)"
          : "color-mix(in oklab, var(--topbar) 76%, transparent)",
        surfaceOverlay: overlay,
        backdropBlur: "20px",
        cardShadow: isDark
          ? "0 14px 36px -6px rgba(0, 0, 0, 0.45)"
          : "0 10px 28px -6px rgba(0, 0, 0, 0.07)",
        elevatedShadow: isDark
          ? "0 24px 56px -12px rgba(0, 0, 0, 0.65)"
          : "0 16px 36px -8px rgba(0, 0, 0, 0.12)",
        cardBorderColor: isDark
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.08)",
        motionFast: "140ms cubic-bezier(0.32, 0.72, 0, 1)",
        motionNormal: "260ms cubic-bezier(0.32, 0.72, 0, 1)",
        motionSlow: "380ms cubic-bezier(0.32, 0.72, 0, 1)",
        paddingY,
        paddingX,
        gap,
      };

    case "vintage":
      return {
        mode: "vintage",
        density,
        radius: "0.125rem",
        radiusXs: "0.125rem",
        surface: "var(--card)",
        surfaceElevated: "var(--popover)",
        surfaceChrome: "var(--topbar)",
        surfaceOverlay: overlay,
        backdropBlur: "0px",
        cardShadow: "0 0 #0000",
        elevatedShadow: "0 0 0 1px var(--border)",
        cardBorderColor: "var(--border)",
        motionFast: "120ms linear",
        motionNormal: "180ms linear",
        motionSlow: "240ms linear",
        paddingY,
        paddingX,
        gap,
      };

    case "default":
    default:
      return {
        mode: "default",
        density,
        radius: baseRadius || "0.5rem",
        radiusXs: "0.375rem",
        surface: "var(--card)",
        surfaceElevated: "var(--popover)",
        surfaceChrome: "var(--topbar)",
        surfaceOverlay: overlay,
        backdropBlur: "0px",
        cardShadow,
        elevatedShadow,
        cardBorderColor: "transparent",
        motionFast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
        motionNormal: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
        motionSlow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
        paddingY,
        paddingX,
        gap,
      };
  }
}

