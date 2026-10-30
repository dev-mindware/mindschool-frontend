import { expect, test } from "@playwright/test";
import { ACCOUNTS, API, RUN, apiFind, expectNoScroll, field, fill, findRow, login, openDialog, schoolId } from "./helpers";

/**
 * Correções do relatório de testes em produção (24/10/2026), validadas pela interface.
 * Cada teste diz o ponto do relatório a que responde.
 *
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-relatorio.spec.ts --project=chromium --workers=1
 */
test.use({ viewport: { width: 1536, height: 900 } });

// Os nomes só aceitam letras: o sufixo da corrida (que tem dígitos) passa a letras.
const LETRAS = RUN.replace(/\d/g, (d) => "ABCDEFGHIJ"[Number(d)]!);
const nomeAluno = `Ângelo Domingos ${LETRAS}`;
const stamp = Date.now().toString();
const bi = `${stamp.slice(-9)}LA${stamp.slice(-3)}`;

test.describe.serial("Secretaria", () => {
  test("#3, #4, #11: aluno novo tem n.º de processo próprio; a pesquisa ignora acentos; cartão bloqueado sem matrícula", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    const id = await schoolId(page);
    const res = await page.request.post(`${API}/schools/${id}/students`, {
      data: { full_name: nomeAluno, birth_date: "2013-05-20", document_type: "bilhete_identidade", document_number: bi },
    });
    expect(res.status(), await res.text()).toBe(201);
    const criado = (await res.json()) as { process_number: string; document_number: string };
    expect(criado.process_number).toMatch(/^\d{6}$/);
    expect(criado.process_number).not.toBe(criado.document_number);

    await page.goto("/students/list");
    // «ângelo» com acento encontra «Ângelo»; e «angelo» sem acento também
    for (const termo of [`ângelo domingos ${LETRAS}`, `angelo domingos ${LETRAS}`]) {
      await page.getByPlaceholder(/Pesquisar/i).first().fill(termo);
      const linha = page.locator("tbody tr", { hasText: nomeAluno });
      await expect(linha).toHaveCount(1, { timeout: 15_000 });
      // o n.º de processo e o BI são colunas diferentes: o BI aparece uma vez só na linha
      const texto = (await linha.innerText()).replace(/\s+/g, " ");
      expect(texto.split(bi).length - 1, "o BI só aparece na coluna do BI").toBe(1);
      expect(texto).toContain(criado.process_number);
    }

    const linha = await findRow(page, nomeAluno);
    await linha.locator('button[aria-haspopup="menu"]').first().click();
    // aluno pendente: «Desativar aluno» não se oferece (a API recusava com 409)
    await expect(page.getByText("Desativar aluno")).toHaveCount(0);
    await page.getByText("Cartão de Estudante", { exact: true }).last().click();
    await expect(page.getByText(/ainda não tem matrícula/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("#6, #7, #27: Cadastrar Aluno valida nome e data no campo e pede confirmação ao cancelar", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/list");
    await page.getByRole("button", { name: /Cadastrar Aluno/ }).first().click();
    const sheet = page.getByRole("dialog").last();
    await expect(sheet).toBeVisible();

    await field(sheet, /Nome Completo/).fill("Teste 123 @@");
    await expect(sheet.getByText(/O nome só pode ter letras/)).toBeVisible();
    await field(sheet, /Data de Nascimento/).fill("2030-05-10");
    await expect(sheet.getByText(/não pode ser futura/)).toBeVisible();

    await sheet.getByRole("button", { name: "Cancelar" }).click();
    const aviso = page.getByRole("alertdialog");
    await expect(aviso).toContainText("Descartar os dados preenchidos?");
    await aviso.getByRole("button", { name: "Continuar a preencher" }).click();
    await expect(sheet).toBeVisible(); // continua aberto com o que escreveu
    await expect(field(sheet, /Nome Completo/)).toHaveValue("Teste 123 @@");

    await sheet.getByRole("button", { name: "Cancelar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Descartar" }).click();
    await expect(sheet).toBeHidden();
  });

  test("#5: Nova Candidatura mostra os erros nos campos ao submeter vazia", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/admissions");
    await page.getByRole("button", { name: /Nova Candidatura/ }).first().click();
    const sheet = page.getByRole("dialog").last();
    await expect(sheet).toBeVisible();
    const submeter = sheet.getByRole("button", { name: "Submeter Candidatura" });
    if (await submeter.isDisabled()) {
      // sem sessões de prova a candidatura não se submete: o aviso aparece logo ao abrir (antes só a meio do formulário)
      await expect(sheet.getByText(/Não existem Provas de Acesso agendadas/).first()).toBeVisible();
      await expect(sheet.getByText(/Não existem Provas de Acesso agendadas/).first()).toBeInViewport();
    } else {
      await submeter.click();
      // vários campos assinalados ao mesmo tempo (antes só havia um aviso temporário por tentativa)
      await expect(sheet.locator("[data-field-error], p.text-destructive").first()).toBeVisible({ timeout: 10_000 });
      expect(await sheet.locator("[data-field-error], p.text-destructive").count()).toBeGreaterThanOrEqual(3);
    }
    // cancelar sem escrever nada fecha logo; depois de escrever pede confirmação
    await field(sheet, /Nome Completo do Candidato/).fill("Candidato Teste");
    await sheet.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("alertdialog")).toContainText("Descartar");
    await page.getByRole("alertdialog").getByRole("button", { name: "Descartar" }).click();
    await expect(sheet).toBeHidden();
  });

  test("#8: o BI do encarregado é validado no formulário", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/guardians");
    await page.getByRole("button", { name: /Cadastrar Encarregado/ }).first().click();
    const sheet = page.getByRole("dialog").last();
    await expect(sheet).toBeVisible();
    await field(sheet, /Nome Completo/).fill("Valentim Domingos");
    await field(sheet, /Bilhete|Documento|BI/).first().fill("0164740LA041"); // 7 dígitos: o formato do relatório
    await sheet.locator('button[type="submit"]').click();
    await expect(sheet.getByText(/Documento inválido/)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe.serial("Financeiro e navegação", () => {
  test("#31: o campo de preço não multiplica por 10 ao escrever", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/tuition/plans");
    const d = await openDialog(page, "Configurar política financeira");
    await expectNoScroll(d);
    const preco = field(d, /Propina mensal|Mensalidade|Valor/i).first();
    // apagar tudo e escrever 300: tem de ficar 300 (antes ficava 3.000,00)
    await preco.fill(""); // campo apagado (o valor passa a 0)
    await expect(preco).toHaveValue("");
    await preco.pressSequentially("300");
    await expect(preco).toHaveValue(/^300(,00)?$/);
    await preco.fill("");
    await preco.pressSequentially("2500");
    await expect(preco).toHaveValue(/^2\.500(,00)?$/);
    await d.getByRole("button", { name: "Cancelar" }).click();
  });

  test("#12: no Financeiro só a página aberta fica destacada no menu (não «Visão geral» ao mesmo tempo)", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/tuition/payments");
    const itensAtivos = page.locator('nav a[aria-current="page"], aside a[aria-current="page"]');
    await expect(itensAtivos.first()).toBeVisible();
    expect(await itensAtivos.count()).toBe(1);
    await expect(itensAtivos.first()).not.toHaveText(/Visão geral/);
  });

  test("#1, #59: Faturas abre sem erro 500 e explica quando o MindGest não está ligado", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/tuition/invoices");
    await expect(page.locator("main")).not.toContainText(/\b500\b|Application error/i);
    await expect(page.locator("main")).toContainText(/Fatura|Pagamento|MindGest/i, { timeout: 20_000 });
  });
});

test.describe.serial("Académico, biblioteca e importações", () => {
  test("#38: ISBN inválido mostra a mensagem em português no campo", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/academic/library");
    const d = await openDialog(page, /Cadastrar Obra/);
    await expectNoScroll(d);
    await fill(d, /Título/, "Obra Teste");
    await fill(d, /Autor/, "Autor Teste");
    await fill(d, /ISBN/, "abc");
    await expect(d.getByText(/10 ou 13 dígitos/)).toBeVisible();
    await expect(d.getByRole("button", { name: "Cadastrar", exact: true })).toBeDisabled();
    await d.getByRole("button", { name: "Cancelar" }).click();
  });

  test("#34: a sigla da disciplina grava-se (antes dizia «sucesso» e perdia-se)", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/subjects");
    const d = await openDialog(page, "Nova Disciplina");
    await expectNoScroll(d); // inclui o scroll horizontal (#47)
    const nome = `Disciplina Sigla ${LETRAS}`;
    await fill(d, /Nome Descritivo da Disciplina/, nome);
    await fill(d, /Código|Sigla/, `Z${LETRAS}`.slice(0, 6));
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });
    const criada = await apiFind<{ name: string; code: string }>(page, "/subjects", (s) => s.name === nome);
    expect(criada, "disciplina criada").toBeTruthy();
    expect(criada!.code).toBe(`Z${LETRAS}`.slice(0, 6).toUpperCase());
  });

  test("#56: os modelos Excel de alunos, matrículas e notas descarregam sem erro", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/settings/imports");
    for (const tipo of [/Alunos e Encarregados/, /Matrículas/, /Classificações e Notas/]) {
      const d = await openDialog(page, /Nova Importação/);
      await d.getByRole("combobox").first().click();
      await page.getByRole("option", { name: tipo }).first().click();
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 30_000 }),
        d.getByRole("button", { name: /Descarregar Modelo Excel/ }).click(),
      ]);
      expect(await download.failure(), `modelo ${tipo}`).toBeNull();
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
      await d.getByRole("button", { name: /^(Cancelar|Fechar)$/ }).click();
      await expect(d).toBeHidden();
    }
  });
});

test.describe("Definições e aparência", () => {
  test("#54: os temas aparecem em português", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/settings");
    await page.getByText(/Aparência/).first().click();
    await expect(page.getByText("Claro").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Escuro").first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/\bLIGHT\b|\bDARK\b|\bSYSTEM\b/);
  });

  test("#24: ao mudar de separador nas Definições a página abre no topo", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/settings/users");
    await page.locator("main").evaluate((m) => m.scrollTo(0, 400));
    await page.goto("/settings/policies");
    const topo = await page.evaluate(() => Math.max(window.scrollY, ...[...document.querySelectorAll("main")].map((m) => m.scrollTop)));
    expect(topo).toBe(0);
  });
});
