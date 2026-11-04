import {
  hexToOklch,
  calculateContrastRatio,
  pickReadableForeground,
  resolveTheme,
  defaultThemeInput,
} from "../index";

describe("MindSchool Theme Engine: Mathematical Derivation & Color Science", () => {
  it("converte HEX para espaço OKLCH correctamente", () => {
    const oklch = hexToOklch("#9956F6");
    expect(oklch.l).toBeGreaterThan(0.5);
    expect(oklch.l).toBeLessThan(0.7);
    expect(oklch.c).toBeGreaterThan(0.15);
    expect(oklch.h).toBeGreaterThan(280);
    expect(oklch.h).toBeLessThan(320);
  });

  it("calcula rácio de contraste WCAG 2.1 com precisão", () => {
    const whiteOnBlack = calculateContrastRatio("#FFFFFF", "#000000");
    expect(whiteOnBlack).toBeCloseTo(21, 0);

    const sameColor = calculateContrastRatio("#123456", "#123456");
    expect(sameColor).toBeCloseTo(1, 0);
  });

  it("escolhe cor de texto legível para fundos claros e escuros", () => {
    const darkBg = { l: 0.2, c: 0.05, h: 280 };
    const lightBg = { l: 0.85, c: 0.05, h: 280 };

    const fgForDark = pickReadableForeground(darkBg);
    const fgForLight = pickReadableForeground(lightBg);

    expect(fgForDark.l).toBeGreaterThan(0.9); // Texto quase-branco
    expect(fgForLight.l).toBeLessThan(0.2); // Texto quase-preto
  });

  it("resolve tema completo para modo claro e escuro sem excepções", () => {
    const lightTheme = resolveTheme(defaultThemeInput, "light");
    expect(lightTheme.colors.primary).toBe(defaultThemeInput.primary);
    expect(lightTheme.colors.primaryForeground).toBe("#ffffff"); // Botão primário no modo light DEVE ter cor branca
    expect(lightTheme.colors.primary50).toBeDefined();
    expect(lightTheme.colors.primary900).toBeDefined();
    expect(lightTheme.colors.rail).toBeDefined();

    const darkTheme = resolveTheme(defaultThemeInput, "dark");
    expect(darkTheme.colors.primary).toBe(defaultThemeInput.primary);
    expect(darkTheme.colors.primaryForeground).toBe("#ffffff");
    expect(darkTheme.colors.background).toBeDefined();
  });
});

