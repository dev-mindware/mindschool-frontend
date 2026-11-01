import { expect, test, type Page } from "@playwright/test";
import { RUN, choose, dialog, expectNoScroll, field, login, openDialog } from "./helpers";

/**
 * Área do professor e da direção pedagógica (plano Enterprise, escola «Complexo Escolar Internacional Horizonte»):
 * mini-pauta com fórmula, historial e exportação; painel do director de turma e relatórios de faltas;
 * dosificação e plano de aula com aprovação (a IA é simulada: o serviço de IA corre à parte); notas sem ligação.
 *
 *   PORT=3001 pnpm exec playwright test tests/e2e/enterprise-docente.spec.ts --project=chromium --workers=1
 */
const ACCOUNTS = {
  professor: "professor.enterprise@mindschool.ao",
  direccao: "pedagogico.enterprise@mindschool.ao",
} as const;

test.use({ viewport: { width: 1440, height: 900 } });

// Os guias orientados arrancam sozinhos e o seu fundo bloqueia os cliques: desligam-se (como em mobile-navigation.spec.ts).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      const tours = ["setup", "dashboard", "plans", "students", "enrollments", "grades", "tuition"];
      const entry = { autoStartEnabled: false, tourButtonEnabled: true, seenTours: Object.fromEntries(tours.map((t) => [t, "completed"])) };
      window.localStorage.setItem("mindgest-onboarding-preferences", JSON.stringify({ state: { preferencesByScope: { "*": entry, "company:user": entry } }, version: 1 }));
    } catch {
      // sem armazenamento: o guia pode aparecer
    }
  });
});

/** Entra com outra conta no mesmo browser (a sessão vive nos cookies: limpam-se primeiro). */
async function loginAs(page: Page, email: string): Promise<void> {
  await page.context().clearCookies();
  await login(page, email);
}

/** Responde ao pedido do serviço de IA sem o chamar. */
async function mockAi(page: Page, path: "dosificacao" | "plano-aula", body: unknown): Promise<void> {
  await page.route(`**/planning/${path}`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }));
}

test.describe.serial("Mini-pauta: fórmula, historial e exportação", () => {
  test("a fórmula da MT e o fim do período aparecem com os pesos da escola", async ({ page }) => {
    await login(page, ACCOUNTS.professor);
    await page.goto("/grades/entry");
    const card = page.getByText("Como se calcula a MT nesta escola").locator("xpath=ancestor::div[contains(@class,'rounded-sm')][1]");
    await expect(card).toBeVisible({ timeout: 30_000 });
    await expect(card).toContainText(/MT = \(MAC × \d+(\.\d+)? \+ MAS × \d+(\.\d+)? \+ NPT × \d+(\.\d+)?\) ÷ \d+/);
    await expect(card).toContainText(/Fim do período/);
    await expect(card).toContainText(/\d{2}\/\d{2}\/\d{4}/);
  });

  test("o historial abre num painel lateral com as versões e quem as registou", async ({ page }) => {
    await login(page, ACCOUNTS.professor);
    await page.goto("/grades/entry");
    await expect(page.getByRole("button", { name: "Historial de notas" })).toBeEnabled({ timeout: 30_000 });
    const d = await openDialog(page, "Historial de notas");
    await expect(d.getByRole("heading", { name: "Historial de notas" })).toBeVisible();
    await expect(d.getByText("Atual").first()).toBeVisible({ timeout: 20_000 });
    await expectNoScroll(d); // os painéis laterais têm scroll por desenho; a verificação é só para modais
  });

  test("exportar a mini-pauta descarrega um CSV com cabeçalho e alunos", async ({ page }) => {
    await login(page, ACCOUNTS.professor);
    await page.goto("/grades/entry");
    const exportBtn = page.getByRole("button", { name: /Exportar \(Excel\/CSV\)/ });
    await expect(exportBtn).toBeEnabled({ timeout: 30_000 });
    const [download] = await Promise.all([page.waitForEvent("download"), exportBtn.click()]);
    expect(download.suggestedFilename()).toMatch(/^mini-pauta-.*\.csv$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    const csv = Buffer.concat(chunks).toString("utf8");
    expect(csv.startsWith("﻿")).toBe(true); // BOM: o Excel abre os acentos bem
    expect(csv).toContain('"N.º";"Nome do estudante";"MAC";"NPP";"MAS";"NPT";"MT";"Resultado"');
    expect(csv.split("\n").length).toBeGreaterThan(3);
  });
});

test.describe.serial("Direção de Turma", () => {
  test("o painel mostra alunos por sexo, notas por lançar e resultado provisório", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await openCoordination(page);
    await expect(page.getByText(/\d+ rapazes · \d+ raparigas/)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Notas lançadas", { exact: true }).first()).toBeVisible();

    await expect(page.locator("tbody tr").first()).toBeVisible();
    await page.getByRole("tab", { name: "Alunos" }).click();
    await expect(page.getByText(/Indefinido|Aprovado|Não aprovado/).first()).toBeVisible();
    await page.getByRole("tab", { name: "Horário" }).click();
    await expect(page.getByText("Segunda")).toBeVisible();
  });

  test("relatório de faltas: gera, e exporta CSV", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await openCoordination(page);
    await page.getByRole("tab", { name: "Faltas e relatórios" }).click();
    await page.getByRole("button", { name: "Gerar relatório" }).click();
    const report = page.locator("#absence-report");
    await expect(report).toBeVisible({ timeout: 30_000 });
    await expect(report).toContainText("Resumo por aluno");
    await expect(report.locator("thead")).toContainText("% faltas");

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "CSV", exact: true }).click()]);
    expect(download.suggestedFilename()).toMatch(/^faltas-resumo-.*\.csv$/);
  });
});

test.describe.serial("Planeamento pedagógico", () => {
  const TITLE = `Plano e2e ${RUN}`;
  const DOS = `Dosificação e2e ${RUN}`;

  test("dosificação: o professor gera com a IA (simulada), edita e guarda; depois elimina o rascunho", async ({ page }) => {
    await mockAi(page, "dosificacao", { success: true, weeks: [1, 2, 3].map((n) => ({ week: n, theme: `Tema IA ${n}`, objectives: "Objetivo", contents: "Conteúdo", lessons: 2 })) });
    await login(page, ACCOUNTS.professor);
    await openPlanning(page);
    const d = await openDialog(page, "Nova dosificação");
    await expect(d.getByRole("heading", { name: "Nova dosificação trimestral" })).toBeVisible();
    await choose(page, d, /Disciplina e turma/, /Língua Portuguesa/);
    await choose(page, d, /Trimestre/, /3\.º Trimestre/);
    await field(d, /Título/).fill(DOS);
    await d.getByRole("button", { name: "Gerar com IA" }).click();
    await expect(d.locator('input[type="text"]').nth(1)).toHaveValue("Tema IA 1", { timeout: 15_000 });
    await d.locator('input[type="text"]').nth(2).fill("Tema editado pelo professor");
    await d.getByRole("button", { name: "Guardar rascunho" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const row = page.locator("tbody tr", { hasText: DOS }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText("Rascunho");

    // a Direção não vê rascunhos; o professor elimina o seu com confirmação
    await row.getByTitle("Eliminar rascunho").click();
    const confirm = dialog(page);
    await expectNoScroll(confirm);
    await expect(confirm).toContainText("Eliminar rascunho");
    await confirm.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.locator("tbody tr", { hasText: DOS })).toHaveCount(0, { timeout: 15_000 });
  });

  test("plano de aula: criar com IA, submeter; a Direção devolve com observação; o professor corrige; a Direção aprova", async ({ page }) => {
    await mockAi(page, "plano-aula", {
      success: true,
      plan: { thematic_unit: "Frações", summary: "Introdução às frações", objectives: "Reconhecer frações", phases: [{ name: "Introdução", minutes: 10, activities: "Exemplos" }, { name: "Desenvolvimento", minutes: 35, activities: "Exercícios" }], assessment: "Exercício", post_class: "TPC" },
    });
    await login(page, ACCOUNTS.professor);
    await openPlanning(page);
    await page.getByRole("tab", { name: "Planos de aula" }).click();
    const d = await openDialog(page, "Novo plano de aula");
    await d.getByRole("checkbox").first().click();
    await choose(page, d, /Trimestre/, /1\.º Trimestre/);
    await field(d, /^Título/).fill(TITLE);
    await field(d, /Unidade temática/).fill("Frações");
    await d.getByRole("button", { name: "Preencher com IA" }).click();
    await expect(field(d, /^Objetivos/)).toHaveValue("Reconhecer frações", { timeout: 15_000 });
    await d.getByRole("button", { name: "Guardar e submeter" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });
    const mine = page.locator("tbody tr", { hasText: TITLE }).first();
    await expect(mine).toContainText("Submetido");

    // Direção: devolver sem observação é recusado; com observação passa
    await loginAs(page, ACCOUNTS.direccao);
    await openPlanning(page);
    await page.getByRole("tab", { name: "Planos de aula" }).click();
    await page.locator("tbody tr", { hasText: TITLE }).first().getByRole("button", { name: "Rever" }).click();
    const review = dialog(page);
    await expect(review).toContainText("Frações");
    await review.getByRole("button", { name: "Devolver ao professor" }).click();
    await expect(page.getByText(/Explique ao professor o que falta/)).toBeVisible();
    await field(review, /Observação/).fill("Falta o tempo da consolidação.");
    await review.getByRole("button", { name: "Devolver ao professor" }).click();
    await expect(review).toBeHidden({ timeout: 20_000 });

    // Professor: vê a observação, edita e volta a submeter
    await loginAs(page, ACCOUNTS.professor);
    await openPlanning(page);
    await page.getByRole("tab", { name: "Planos de aula" }).click();
    const returned = page.locator("tbody tr", { hasText: TITLE }).first();
    await expect(returned).toContainText("Devolvido");
    await expect(returned).toContainText("Falta o tempo da consolidação.");
    await returned.getByRole("button", { name: "Editar" }).click();
    const edit = dialog(page);
    await field(edit, /^Pós-aula/).fill("TPC página 12 e reflexão");
    await edit.getByRole("button", { name: "Guardar e submeter" }).click();
    await expect(edit).toBeHidden({ timeout: 20_000 });
    await expect(page.locator("tbody tr", { hasText: TITLE }).first()).toContainText("Submetido");

    // Direção aprova
    await loginAs(page, ACCOUNTS.direccao);
    await openPlanning(page);
    await page.getByRole("tab", { name: "Planos de aula" }).click();
    await page.locator("tbody tr", { hasText: TITLE }).first().getByRole("button", { name: "Rever" }).click();
    await dialog(page).getByRole("button", { name: "Aprovar" }).click();
    await expect(page.locator("tbody tr", { hasText: TITLE }).first()).toContainText("Aprovado", { timeout: 15_000 });
  });
});

test.describe.serial("Notas sem ligação", () => {
  test("uma nota lançada sem rede fica guardada no dispositivo e sincroniza quando a rede volta", async ({ page, context }) => {
    await login(page, ACCOUNTS.professor);
    await page.goto("/grades/entry");
    const mac = page.locator('main input[aria-label^="Nota: "][aria-label*="MAC"]').first();
    await expect(mac).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Historial de notas" })).toBeEnabled({ timeout: 30_000 }); // a folha já traz as avaliações
    const original = await mac.inputValue();
    const novo = original === "15" ? "14" : "15";

    await context.setOffline(true);
    await mac.fill(novo);
    await mac.blur();
    const chip = page.getByRole("status").filter({ hasText: /guardada/ });
    await expect(chip).toBeVisible({ timeout: 15_000 });
    await expect(mac).toHaveValue(novo); // a nota lançada continua visível sem rede

    await context.setOffline(false);
    await expect(chip).toBeHidden({ timeout: 40_000 }); // sincronizou
    await page.reload();
    await expect(page.locator('main input[aria-label^="Nota: "][aria-label*="MAC"]').first()).toHaveValue(novo, { timeout: 30_000 });

    // repõe o valor original (também é uma nota auditada)
    const again = page.locator('main input[aria-label^="Nota: "][aria-label*="MAC"]').first();
    await again.fill(original);
    await again.blur();
    await page.waitForTimeout(1500);
    await page.reload();
    await expect(page.locator('main input[aria-label^="Nota: "][aria-label*="MAC"]').first()).toHaveValue(original, { timeout: 30_000 });
  });
});

/** O planeamento e a direção de turma são separadores das páginas Aulas e Sumários e Turmas (cada módulo do menu tem no máximo 8 páginas). */
async function openPlanning(page: Page): Promise<void> {
  await page.goto("/academic/lessons");
  await page.getByRole("tab", { name: "Planeamento" }).click();
}

async function openCoordination(page: Page): Promise<void> {
  await page.goto("/academic/classes");
  await page.getByRole("tab", { name: "Direção de turma" }).click();
}
