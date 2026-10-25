import { expect, test } from "@playwright/test";
import { ACCOUNTS, RUN, apiFind, combo, expectNoScroll, login, openDialog } from "./helpers";

/**
 * Boletins e calendário pela interface. Conselhos de turma e exames finais estão em essencial-crud.spec.ts porque usam
 * a turma e a disciplina criadas na mesma corrida (cada combinação só pode existir uma vez).
 *
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-pedagogico.spec.ts --project=chromium --workers=1
 */
test.use({ viewport: { width: 1440, height: 800 } });

test.describe.serial("Pedagógico", () => {
  test("Boletim: emitir para um aluno", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/certificates/report-cards");
    const d = await openDialog(page, "Emitir boletim");
    await expectNoScroll(d);
    await combo(d, /Aluno/).click();
    await page.getByRole("option").first().click();
    await d.getByRole("button", { name: "Emitir boletim" }).click();
    // sem pauta fechada a API recusa com uma regra de negócio clara; com pauta fechada o boletim é emitido
    const emitido = d.waitFor({ state: "hidden", timeout: 30_000 }).then(() => "emitido" as const);
    const recusado = page.getByText(/pauta ainda não pode fechar|pauta.*fech/i).first().waitFor({ timeout: 30_000 }).then(() => "recusado" as const);
    const resultado = await Promise.race([emitido, recusado]);
    if (resultado === "emitido") await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 15_000 });
    else await expect(page.locator("main")).not.toContainText(/Application error/i);
  });

  test("Calendário: a direção marca um dia não letivo", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/calendar");
    const d = await openDialog(page, "Marcar dia não letivo");
    await expectNoScroll(d);
    const inputs = d.locator("input:visible, textarea:visible");
    const n = await inputs.count();
    for (let i = 0; i < n; i++) {
      const el = inputs.nth(i);
      const type = (await el.getAttribute("type")) ?? "text";
      if (type === "date") await el.fill("2026-12-18");
      else if (type === "text" || (await el.evaluate((x) => x.tagName)) === "TEXTAREA") await el.fill(`Dia e2e ${RUN}`);
    }
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const mark = await apiFind<{ date: string }>(page, "/school-days", (m) => String(m.date ?? "").startsWith("2026-12-18"), { from: "2026-12-01", to: "2026-12-31" });
    expect(mark, "dia não letivo registado na API").toBeTruthy();
  });
});
