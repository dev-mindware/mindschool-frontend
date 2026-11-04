import { resolveUIModeTokens } from "../ui-mode-resolver";

describe("MindSchool Theme Engine: UI Mode Resolver", () => {
  it("resolve modo Standard com valores padrão e sem bordas duras", () => {
    const tokens = resolveUIModeTokens("default", "comfortable", "light");
    expect(tokens.mode).toBe("default");
    expect(tokens.cardBorderColor).toBe("transparent");
    expect(tokens.backdropBlur).toBe("0px");
  });

  it("resolve modo Apple com vidro translúcido e raio normal/ampliado", () => {
    const tokens = resolveUIModeTokens("apple", "comfortable", "light", "0.5rem");
    expect(tokens.mode).toBe("apple");
    expect(tokens.radius).toBe("0.75rem");
    expect(tokens.radiusXs).toBe("0.5rem");
    expect(tokens.backdropBlur).toBe("20px");
    expect(tokens.surfaceChrome).toContain("color-mix");
  });

  it("resolve modo Vintage com cantos estritos e contorno de borda", () => {
    const tokens = resolveUIModeTokens("vintage", "compact", "light");
    expect(tokens.mode).toBe("vintage");
    expect(tokens.radius).toBe("0.125rem");
    expect(tokens.radiusXs).toBe("0.125rem");
    expect(tokens.cardBorderColor).toBe("var(--border)");
    expect(tokens.paddingY).toBe("0.25rem");
  });
});

