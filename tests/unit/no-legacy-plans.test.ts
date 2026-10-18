import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Os planos vieram do ecossistema MindGest (Base/Smart/Pro); a MindSchool só tem os códigos da API. */
const SRC = join(__dirname, "..", "..", "src");

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

describe("nomes de plano", () => {
  it("o código não usa os planos legados Base/Smart/Pro", () => {
    const legacy = /["'`](Base|Smart|Pro)["'`]\s*[,:;)\]}=]|(?:minPlan|requiredPlan|PlanType)\W{1,4}["'`]?(Base|Smart|Pro)\b|plano (Smart|Base)\b/;
    const hits = files(SRC).filter((f) => legacy.test(readFileSync(f, "utf8")));
    expect(hits.map((f) => f.slice(SRC.length + 1))).toEqual([]);
  });

  it("o tipo do plano são só os códigos da API", () => {
    const types = readFileSync(join(SRC, "types", "subscription.ts"), "utf8");
    expect(types).toContain('"essencial" | "profissional" | "enterprise"');
  });
});
