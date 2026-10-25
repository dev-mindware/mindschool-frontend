import { expect, test } from "@playwright/test";
import { ACCOUNTS, RUN, apiFind, apiGet, combo, dialog, expectNoScroll, fill, findRow, login, openDialog, rowAction } from "./helpers";

/**
 * Finanças, Comunicação, Biblioteca e Documentos pela interface, com confirmação na API.
 *
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-servicos.spec.ts --project=chromium --workers=1
 */
test.use({ viewport: { width: 1440, height: 800 } });

const emolumento = `Emolumento E2E ${RUN}`;
const codigoEmolumento = `E2E_${RUN}`;
const circular = `Circular E2E ${RUN}`;
const obra = `Obra E2E ${RUN}`;

test.describe.serial("Finanças: emolumentos e política", () => {
  test("Permissões: o financeiro vê «Novo emolumento» desactivado; só o titular configura", async ({ page }) => {
    await login(page, ACCOUNTS.financeiro);
    await page.goto("/tuition/plans");
    const botao = page.getByRole("button", { name: "Novo emolumento" }).first();
    await expect(botao).toBeVisible();
    // o botão está dentro de um invólucro `pointer-events-none` (FeatureGate desativado): o clique não abre nada
    await botao.click({ force: true });
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Emolumento: criar", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/tuition/plans");
    const d = await openDialog(page, "Novo emolumento");
    await expectNoScroll(d);
    await fill(d, /Nome do Emolumento/, emolumento);
    await fill(d, /Código Identificador/, codigoEmolumento);
    await fill(d, /Preço em Kwanzas/, "2500");
    await fill(d, /Prazo de Entrega/, "2");
    await d.getByRole("button", { name: "Criar emolumento" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });
    await expect(await findRow(page, emolumento)).toContainText("2.500");
  });

  test("Emolumento: editar o preço", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/tuition/plans");
    await rowAction(page, await findRow(page, emolumento), "Editar emolumento");
    const d = dialog(page);
    await expect(d).toBeVisible();
    await expectNoScroll(d);
    await fill(d, /Preço em Kwanzas/, "3000");
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });
    await expect(await findRow(page, emolumento)).toContainText("3.000");
  });

  test("Emolumento: eliminar", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/tuition/plans");
    await rowAction(page, await findRow(page, emolumento), "Eliminar");
    const confirm = page.getByRole("alertdialog").or(page.getByRole("dialog")).last();
    await confirm.getByRole("button", { name: /Eliminar|Confirmar|Sim/ }).last().click();
    await page.getByPlaceholder(/Pesquisar/i).first().fill(emolumento);
    await expect(page.locator("tbody tr", { hasText: emolumento })).toHaveCount(0, { timeout: 15_000 });
  });

  test("Política financeira: abrir (sem scroll), alterar o dia limite e guardar", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/tuition/plans");
    const d = await openDialog(page, "Configurar política financeira");
    await expectNoScroll(d);
    const fees = async () => (await apiGet<{ settings: { finance: { monthly_fee: string; enrollment_fee: string; due_day: number } } }>(page, "")).settings.finance;
    const antes = await fees();
    await fill(d, /Dia Limite/, "12");
    await d.getByRole("button", { name: "Guardar política" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });
    // guardar só o dia limite não pode apagar as propinas já definidas
    const depois = await fees();
    expect(depois.due_day).toBe(12);
    expect(Number(depois.monthly_fee), "propina mensal preservada").toBe(Number(antes.monthly_fee));
    expect(Number(depois.enrollment_fee), "propina de matrícula preservada").toBe(Number(antes.enrollment_fee));
  });
});

test.describe.serial("Comunicação e Biblioteca", () => {
  test("Comunicado: criar rascunho e publicar; o encarregado vê-o no portal", async ({ page, browser }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/communication/circulars");
    const d = await openDialog(page, "Novo comunicado");
    await expectNoScroll(d);
    await fill(d, /Título/, circular);
    await fill(d, /Mensagem/, `Mensagem do teste e2e ${RUN}`);
    await d.getByRole("button", { name: "Criar rascunho" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const draft = await apiFind<{ id: string; title: string; status: string }>(page, "/announcements", (a) => a.title === circular);
    expect(draft, "comunicado criado na API").toBeTruthy();

    // publicar pelo menu da linha (acção irreversível: o diálogo de confirmação pede confirmação)
    await rowAction(page, await findRow(page, circular), "Publicar");
    const confirm = dialog(page);
    await expect(confirm).toBeVisible();
    await expectNoScroll(confirm);
    const ack = confirm.getByRole("checkbox");
    if (await ack.count()) await ack.first().check();
    await confirm.getByRole("button", { name: "Publicar" }).last().click();
    const published = await apiFind<{ title: string; status: string }>(page, "/announcements", (a) => a.title === circular && /public/i.test(a.status));
    expect(published, "comunicado publicado na API").toBeTruthy();

    // o encarregado vê-o
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 800 } });
    const family = await ctx.newPage();
    await login(family, ACCOUNTS.encarregado);
    await family.goto("/familia/comunicados");
    await expect(family.getByText(circular).first()).toBeVisible({ timeout: 20_000 });
    await ctx.close();
  });

  test("Obra da biblioteca: cadastrar", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/library");
    const d = await openDialog(page, "Cadastrar Obra");
    await expectNoScroll(d);
    await fill(d, /Título/, obra);
    await fill(d, /Autor/, "Autor E2E");
    await fill(d, /ISBN/, `978${Date.now().toString().slice(-10)}`);
    await fill(d, /Categoria/, "Teste e2e");
    await d.getByRole("button", { name: "Cadastrar" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const book = await apiFind<{ title: string }>(page, "/library/books", (b) => b.title === obra);
    expect(book, "obra criada na API").toBeTruthy();
  });
});

test.describe.serial("Documentos da secretaria", () => {
  test("Requerimento: abrir", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/certificates/documents");
    const d = await openDialog(page, "Novo Requerimento");
    await expectNoScroll(d);
    await fill(d, /Assunto/, `Requerimento e2e ${RUN}`);
    await d.getByRole("button", { name: "Abrir requerimento" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const req = await apiFind<{ subject: string }>(page, "/requests", (r) => String(r.subject ?? "").includes(`Requerimento e2e ${RUN}`));
    expect(req, "requerimento criado na API").toBeTruthy();
  });

  test("Emissão directa: gerar uma declaração", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/certificates/documents");
    const before = (await apiGet<{ data: unknown[] }>(page, "/documents", { limit: "100" })).data.length;
    const d = await openDialog(page, "Emissão Direta");
    await expectNoScroll(d);
    await combo(d, /Aluno/).click();
    await page.getByRole("option").first().click();
    await fill(d, /Finalidade/, `Teste e2e ${RUN}`);
    await d.getByRole("button", { name: "Gerar documento" }).click();
    await expect(d).toBeHidden({ timeout: 30_000 });

    const after = (await apiGet<{ data: unknown[] }>(page, "/documents", { limit: "100" })).data.length;
    expect(after).toBeGreaterThan(before);
  });
});
