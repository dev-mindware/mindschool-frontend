import { z } from "zod";
import { calculateContrastRatio } from "./theme-derive";
import type { ThemeInput } from "./theme-types";

export const themeInputSchema = z
  .object({
    version: z.number().default(1),
    brand: z.object({
      name: z.string().min(1, "O nome da escola é obrigatório"),
      logo: z.string().optional(),
      logoDark: z.string().optional(),
      crest: z.string().optional(),
      favicon: z.string().optional(),
    }),
    uiMode: z.enum(["default", "apple", "vintage"]).default("default"),
    density: z.enum(["compact", "comfortable", "spacious"]).default("comfortable"),
    baseColor: z.enum([
      "neutral",
      "stone",
      "zinc",
      "mauve",
      "olive",
      "mist",
      "taupe",
    ]),
    primary: z
      .string()
      .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Insira um código HEX válido (ex: #9956F6)"),
    secondary: z
      .string()
      .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Insira um código HEX válido (ex: #6366F1)"),
    typography: z.object({
      fontFamily: z.string().min(1, "Selecione uma fonte"),
      headingFontFamily: z.string().optional(),
    }),
    radius: z.string().default("0.25rem").optional(),
    appearance: z.object({
      defaultMode: z.enum(["light", "dark", "system"]),
    }),
  })
  .superRefine((input, ctx) => {
    try {
      const contrastLight = calculateContrastRatio(input.primary, "#FFFFFF");
      const contrastDark = calculateContrastRatio(input.primary, "#000000");

      if (contrastLight < 3.0 && contrastDark < 3.0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primary"],
          message: `A cor primária seleccionada (${input.primary}) tem contraste insuficiente em ambos os modos (mínimo 3:1).`,
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["primary"],
        message: "Falha ao calcular o contraste das cores seleccionadas.",
      });
    }
  });

export interface ThemeValidationResult {
  valid: boolean;
  contrastLight: number;
  contrastDark: number;
  errors: string[];
}

export function validateThemeInput(input: ThemeInput): ThemeValidationResult {
  const parseResult = themeInputSchema.safeParse(input);

  const contrastLight = Number(calculateContrastRatio(input.primary, "#FFFFFF").toFixed(2));
  const contrastDark = Number(calculateContrastRatio(input.primary, "#000000").toFixed(2));

  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((issue) => issue.message);
    return { valid: false, contrastLight, contrastDark, errors };
  }

  return { valid: true, contrastLight, contrastDark, errors: [] };
}

