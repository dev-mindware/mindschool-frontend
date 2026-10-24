import { expect, test } from "@playwright/test";
import { ACCOUNTS, RUN, apiFind, choose, combo, expectNoScroll, fill, login, openDialog } from "./helpers";
import { png } from "./png";

/**
 * Administração da escola (utilizadores, professores, candidaturas, relatórios, políticas) e portal da família.
 *
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-admin-portal.spec.ts --project=chromium --workers=1
 */
test.use({ viewport: { width: 1440, height: 800 } });

const stamp = Date.now().toString();
const email = `prof.${RUN.toLowerCase()}@e2e.mindschool.ao`;
const nomeProfessor = `Professor E2E ${RUN}`;

test.describe.serial("Utilizadores e professores", () => {
  test("Utilizador: o titular convida um professor novo", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/settings/users");
    const d = await openDialog(page, "Adicionar utilizador");
    await expectNoScroll(d);
    await fill(d, /E-mail/, email);
    await fill(d, /Nome/, nomeProfessor);
    await choose(page, d, /Papel/, "Professor");
    await d.getByRole("button", { name: "Adicionar" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const membership = await apiFind<{ user: { email: string }; role: string }>(page, "/memberships", (m) => m.user?.email === email);
    expect(membership, "utilizador criado na API").toBeTruthy();
  });

  test("Professor: criar a ficha do utilizador convidado", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/teachers");
    const d = await openDialog(page, "Nova ficha");
    await expectNoScroll(d);
    await d.getByRole("button", { name: "Seleccione" }).first().click();
    await page.getByText(nomeProfessor).last().click(); // lista de pesquisa (cmdk): os itens não têm role «option»
    await fill(d, /N\.º do documento/, `${stamp.slice(-9)}LA777`);
    await fill(d, /Habilitação/, "Licenciatura");
    await d.getByRole("button", { name: "Criar ficha" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const t = await apiFind<{ full_name: string }>(page, "/teachers", (x) => x.full_name === nomeProfessor);
    expect(t, "ficha de professor criada na API").toBeTruthy();
  });
});

test.describe.serial("Candidaturas, relatórios e definições", () => {
  test("Candidatura: registar uma nova candidatura", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/admissions");
    const d = await openDialog(page, "Nova Candidatura");
    await expectNoScroll(d);
    await fill(d, /Nome Completo do Candidato/, `Candidato E2E ${RUN}`);
    await fill(d, /Data de Nascimento/, "2013-05-20");
    await fill(d, /Número do Documento/, `${stamp.slice(-9)}LA555`);
    await combo(d, /Encarregado Registado/).click();
    await page.getByRole("option").first().click();
    const prova = combo(d, /Prova de Acesso Designada/);
    if (await prova.count()) {
      await prova.click();
      await page.getByRole("option").first().click();
    }
    // uploads obrigatórios: foto tipo passe (3:4) e cópia do documento de identificação
    await d.locator('input[type="file"]').nth(0).setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: png(300, 400) });
    // a foto abre um recorte 3:4 (outro diálogo por cima) que é preciso confirmar
    await page.getByRole("button", { name: /Confirmar Recorte/ }).click();
    await expect(page.getByRole("button", { name: /Confirmar Recorte/ })).toHaveCount(0);
    await d.locator('input[type="file"][accept*="pdf"]').first().setInputFiles({ name: "bi.png", mimeType: "image/png", buffer: png(600, 400) });
    await d.getByRole("button", { name: "Submeter Candidatura" }).click();
    await expect(d).toBeHidden({ timeout: 30_000 });

    const app = await apiFind<{ full_name: string }>(page, "/candidates", (a) => a.full_name === `Candidato E2E ${RUN}`);
    expect(app, "candidatura criada na API").toBeTruthy();
  });

  test("Mapas do MED: gerar um instantâneo", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/reports/med");
    const d = await openDialog(page, "Gerar instantâneo");
    await expectNoScroll(d);
    await d.getByRole("button", { name: "Gerar" }).last().click();
    await expect(d).toBeHidden({ timeout: 30_000 });
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 15_000 });
  });

  test("Relatórios: exportar para Excel e PDF faz descarregar um ficheiro", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/reports/academic");
    for (const formato of ["Excel", "PDF"]) {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 60_000 }),
        page.getByRole("button", { name: formato, exact: true }).first().click(),
      ]);
      expect(await download.failure(), `descarga ${formato}`).toBeNull();
    }
  });

  test("Políticas da escola: abre e guarda sem erros", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/settings/policies");
    await expect(page.getByText(/Políticas da Escola/).first()).toBeVisible();
    const guardar = page.getByRole("button", { name: /Guardar/ }).first();
    if (await guardar.count()) {
      await guardar.click();
      await expect(page.getByText(/guardad|sucesso/i).first()).toBeVisible({ timeout: 15_000 });
    }
  });
});

test.describe.serial("Portal da família", () => {
  test("Encarregado: vê o educando, as propinas e os documentos", async ({ page }) => {
    await login(page, ACCOUNTS.encarregado);
    await page.goto("/familia/financeiro");
    await expect(page.locator("main")).toContainText(/Educando/i, { timeout: 20_000 });
    await expect(page.locator("main")).not.toContainText(/Application error|Algo correu mal/i);
    await page.goto("/familia/horario");
    await expect(page.locator("main")).not.toBeEmpty();
    await page.goto("/familia/documentos");
    await expect(page.locator("main")).not.toBeEmpty();
  });

  test("Aluno: o portal abre sem bloqueio de plano", async ({ page }) => {
    await login(page, ACCOUNTS.aluno);
    for (const rota of ["/familia/aproveitamento", "/familia/horario", "/familia/biblioteca", "/familia/calendario"]) {
      await page.goto(rota);
      await expect(page.locator("main")).not.toContainText(/Recurso Exclusivo|Sem acesso/i);
    }
  });
});

test("Plano Essencial: as funcionalidades de planos superiores estão bloqueadas na API", async ({ page }) => {
  await login(page, ACCOUNTS.titular);
  // 402 ENTITLEMENT_REQUIRED nas rotas do Profissional/Enterprise (docs/testes-planos/1-escola-plano-essencial.md §4.3)
  const id = (await (await page.request.get("http://localhost:3011/api/v1/auth/me")).json()).memberships[0].school_id as string;
  const gated = ["risk-alerts", "attendance/teachers", "health/visits", "psycho-cases", "transport/routes", "activities", "rooms", "lessons"];
  const found: Record<string, number> = {};
  for (const rota of gated) {
    const res = await page.request.get(`http://localhost:3011/api/v1/schools/${id}/${rota}`);
    found[rota] = res.status();
  }
  const open = Object.entries(found).filter(([, s]) => s !== 402 && s !== 403 && s !== 404);
  expect(open, `rotas de planos superiores acessíveis no Essencial: ${JSON.stringify(found)}`).toEqual([]);
});
