import { expect, test } from "@playwright/test";
import writeXlsxFile from "write-excel-file/node";
import { ACCOUNTS, API, RUN, apiFind, apiGet, choose, expectNoScroll, login, openDialog, schoolId } from "./helpers";

/**
 * Operação diária pela interface: horário, chamada, lançamento de notas e importação de alunos por Excel.
 * Usa a turma «Turma A» (7.ª Classe) da escola de teste, com a disciplina e o professor já atribuídos.
 *
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-operacao.spec.ts --project=chromium --workers=1
 */
test.use({ viewport: { width: 1440, height: 900 } });

const stamp = Date.now().toString();

test.describe.serial("Horário", () => {
  const removerAula = async (page: import("@playwright/test").Page) => {
    await page.getByText("Matematica", { exact: false }).first().click();
    await page.getByRole("button", { name: "Remover do horário" }).click();
  };

  test("Adicionar uma aula ao horário, vê-la na grelha e removê-la", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/timetables");
    await expect(page.getByRole("button", { name: "Adicionar Aula" })).toBeVisible({ timeout: 15_000 });
    // sobras de uma corrida interrompida: o horário impede choques, por isso limpa-se primeiro
    if (await page.getByText("Matematica").count()) {
      await removerAula(page);
      await expect(page.getByText("Matematica")).toHaveCount(0, { timeout: 15_000 });
    }

    const d = await openDialog(page, "Adicionar Aula");
    await expectNoScroll(d);
    await d.getByRole("button", { name: /^Qui/ }).first().click();
    await choose(page, d, /Tempo Inicial/, /4\.º Tempo/);
    await choose(page, d, /Disciplina Curricular/, /Matematica/);
    await choose(page, d, /Professor Responsável/, /Joao Fernandes/);
    await d.getByRole("button", { name: "Adicionar ao Horário" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    await page.reload();
    await expect(page.getByText("Matematica").first()).toBeVisible({ timeout: 15_000 });
    await removerAula(page);
    await expect(page.getByText("Matematica")).toHaveCount(0, { timeout: 15_000 });
  });
});

test.describe.serial("Chamada e notas", () => {
  test("Chamada: marcar presente e falta e confirmar na API", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/attendance");
    await page.locator('input[type="date"]').fill("2026-10-19"); // segunda-feira: 2.º tempo de Língua Portuguesa
    await page.getByText(/2º Tempo/).first().click();
    const linhas = page.locator("tbody tr", { hasText: /Silva|Fernando|Francisco/ });
    await expect(linhas.first()).toBeVisible({ timeout: 15_000 });
    await linhas.nth(0).getByRole("button", { name: "P", exact: true }).click();
    await linhas.nth(1).getByRole("button", { name: "FI", exact: true }).click();
    await expect(page.locator("main")).toContainText(/Presentes:\s*1/, { timeout: 15_000 });
    await expect(page.locator("main")).toContainText(/Faltas injustificadas:\s*1/);

    await page.reload();
    await page.locator('input[type="date"]').fill("2026-10-19");
    await page.getByText(/2º Tempo/).first().click();
    await expect(page.locator("main")).toContainText(/Presentes:\s*1/, { timeout: 15_000 });
  });

  test("Notas: lançar MAC, NPP e NPT, ver a MT calculada e confirmar que persiste", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/grades/entry");
    const linha = page.locator("tbody tr").first();
    await expect(linha).toBeVisible({ timeout: 15_000 });
    const notas = linha.locator('input[type="number"]');
    for (const [i, v] of ["14", "12", "16"].entries()) {
      await notas.nth(i).fill(v);
      await notas.nth(i).blur();
      await page.waitForTimeout(600);
    }
    await expect(linha).not.toContainText("Pendente", { timeout: 15_000 });

    await page.reload();
    const depois = page.locator("tbody tr").first().locator('input[type="number"]');
    await expect(depois.nth(0)).toHaveValue("14", { timeout: 15_000 });
    await expect(depois.nth(1)).toHaveValue("12");
    await expect(depois.nth(2)).toHaveValue("16");
  });
});

test.describe.serial("Importação de dados", () => {
  const nome = `Importado E2E ${RUN}`;

  test("Importar um aluno por Excel: validar, rever e confirmar", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/settings/imports");
    const d = await openDialog(page, /Nova Importação/);
    await expectNoScroll(d);

    const cabecalho = ["full_name", "birth_date", "gender", "document_type", "document_number", "previous_school_name", "guardian_full_name", "guardian_phone", "guardian_document_number", "guardian_relationship"];
    const linha = [nome, "2014-03-21", "feminino", "cedula_pessoal", `${stamp.slice(-9)}LA901`, "", "", "", "", ""];
    const buffer = (await writeXlsxFile([cabecalho, linha].map((r) => r.map((value) => ({ value })))).toBuffer()) as Buffer;
    await d.locator('input[type="file"]').setInputFiles({ name: "alunos.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer });
    await d.getByRole("button", { name: "Validar Ficheiro Excel" }).click();

    // revisão: a grelha mostra a linha válida e pede confirmação final
    const confirmar = page.getByRole("button", { name: /Confirmar tudo ou nada/ });
    await expect(confirmar).toBeVisible({ timeout: 30_000 });
    await confirmar.click();
    await expect(d).toContainText("1 criados", { timeout: 30_000 });
    await d.getByRole("button", { name: "Cancelar" }).click();

    const aluno = await apiFind<{ full_name: string }>(page, "/students", (s) => s.full_name === nome);
    expect(aluno, "aluno importado criado na API").toBeTruthy();
    expect(await schoolId(page)).toBeTruthy();
    expect(await apiGet<{ data: unknown[] }>(page, "/imports/jobs")).toBeTruthy();
  });
});

test.describe("Permissões por papel (a API recusa o que o papel não pode fazer)", () => {
  const casos: Array<{ papel: keyof typeof ACCOUNTS; metodo: "GET" | "POST"; rota: string; dados?: object }> = [
    { papel: "professor", metodo: "GET", rota: "/invoices" },
    { papel: "encarregado", metodo: "GET", rota: "/students" },
    { papel: "encarregado", metodo: "GET", rota: "/invoices" },
    { papel: "aluno", metodo: "GET", rota: "/students" },
    { papel: "financeiro", metodo: "POST", rota: "/sections", dados: { name: "Não permitida" } },
    { papel: "secretaria", metodo: "POST", rota: "/subjects", dados: { name: "Não permitida", code: "NP" } },
  ];
  for (const c of casos) {
    test(`${c.papel}: ${c.metodo} ${c.rota} → 403`, async ({ page }) => {
      await login(page, ACCOUNTS[c.papel]);
      const id = await schoolId(page);
      const url = `${API}/schools/${id}${c.rota}`;
      const res = c.metodo === "GET" ? await page.request.get(url) : await page.request.post(url, { data: c.dados });
      expect(res.status(), `${c.papel} ${c.metodo} ${c.rota}: ${await res.text().catch(() => "")}`).toBe(403);
    });
  }
});
