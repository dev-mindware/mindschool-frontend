import { expect, test } from "@playwright/test";
import { ACCOUNTS, expectNoScroll, login } from "./helpers";

/**
 * Auditoria dos modais: abre, em cada página da escola, todos os botões que abrem um formulário e confirma que nenhum
 * modal tem scroll (regra do produto). Só abre e fecha: não grava nada.
 *
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-modais.spec.ts --project=chromium --workers=1
 */
test.use({ viewport: { width: 1440, height: 800 } });

const PAGES = [
  "/students/admissions", "/students/list", "/students/enrollments", "/students/guardians",
  "/certificates/report-cards", "/certificates/declarations", "/certificates/requests",
  "/academic/classes", "/academic/subjects", "/academic/assignments", "/academic/timetables", "/academic/calendar", "/academic/library",
  "/teachers", "/grades/councils", "/grades/final-exams", "/tuition/plans", "/communication/circulars",
  "/reports/med", "/settings/users", "/settings/imports",
];

const ABRE_FORMULARIO = /^(Novo|Nova|Adicionar|Criar|Registar|Agendar|Emitir|Configurar|Gerar|Marcar|Cadastrar|Convidar)\b/i;

for (const rota of PAGES) {
  test(`${rota}: os modais de criação não têm scroll`, async ({ page }) => {
    test.setTimeout(120_000);
    await login(page, ACCOUNTS.titular);
    await page.goto(rota);
    await expect(page.locator("main")).toBeVisible();
    await page.waitForTimeout(1500);
    const nomes = (await page.locator("main").getByRole("button").filter({ hasText: ABRE_FORMULARIO }).allInnerTexts())
      .map((t) => t.trim())
      .filter((t, i, a) => t && a.indexOf(t) === i);
    const comScroll: string[] = [];

    for (const nome of nomes) {
      const b = page.locator("main").getByRole("button", { name: nome, exact: true }).first();
      if (!(await b.isVisible()) || !(await b.isEnabled())) continue;
      await b.click();
      const d = page.getByRole("dialog").last();
      const aberto = await d.waitFor({ state: "visible", timeout: 2500 }).then(() => true, () => false);
      if (!aberto) continue;
      await page.waitForTimeout(300);
      // painéis laterais (Sheet) de formulários longos têm scroll por desenho; a regra é para os modais
      if ((await d.getAttribute("data-slot")) === "sheet-content") {
        test.info().annotations.push({ type: "painel lateral", description: `${rota} → ${nome}` });
        await page.keyboard.press("Escape");
        await d.waitFor({ state: "hidden", timeout: 5000 }).catch(() => undefined);
        continue;
      }
      try {
        await expectNoScroll(d);
      } catch {
        comScroll.push(nome);
      }
      await page.keyboard.press("Escape");
      if (await d.isVisible()) await d.getByRole("button", { name: /Cancelar|Fechar/ }).first().click({ timeout: 3000 }).catch(() => undefined);
      if (await d.isVisible()) await page.goto(rota);
    }
    expect(comScroll, `modais com scroll em ${rota}: ${comScroll.join(", ")}`).toEqual([]);
  });
}
