import { expect, test } from "@playwright/test";
import { ACCOUNTS, RUN, apiFind, apiGet, apiList, combo, dialog, expectNoScroll, fill, findRow, login, openDialog, rowAction } from "./helpers";

/**
 * CRUD do plano Essencial pela interface, módulo a módulo, com confirmação na API. Os testes de cada bloco são
 * sequenciais porque usam os dados criados pelo anterior (encarregado → aluno → matrícula).
 *
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-crud.spec.ts --project=chromium --workers=1
 */
test.use({ viewport: { width: 1440, height: 800 } });

// Identificadores únicos desta execução.
const stamp = Date.now().toString();
const doc = (n: number) => `${stamp.slice(-9)}LA${String(n).padStart(3, "0")}`;
const phone = `92${stamp.slice(-7)}`; // prefixo móvel angolano válido

const turma = `E2E-${RUN} A`;
const disciplina = `Disciplina E2E ${RUN}`;
// os nomes de pessoas só aceitam letras: sem «E2E» nem dígitos do sufixo da corrida
const LETRAS = RUN.replace(/\d/g, (d) => "ABCDEFGHIJ"[Number(d)]!);
const encarregado = `Encarregado Teste ${LETRAS}`;
const aluno = `Aluno Teste ${LETRAS}`;

test.describe.serial("Académico e Secretaria", () => {
  test("Turma: criar, ver na lista e na API", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/classes");
    const d = await openDialog(page, "Criar Nova Turma");
    await expectNoScroll(d);
    await fill(d, /Nome Descritivo da Turma/, turma);
    await fill(d, /Sala de Aulas/, `Sala ${RUN}`);
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const row = await apiFind<{ name: string; capacity: number }>(page, "/sections", (s) => s.name === turma);
    expect(row, "turma criada na API").toBeTruthy();
    await findRow(page, turma); // as listas são paginadas: procura-se pelo nome
  });

  test("Disciplina: criar", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/subjects");
    const d = await openDialog(page, "Nova Disciplina");
    await expectNoScroll(d);
    await fill(d, /Nome Descritivo da Disciplina/, disciplina);
    await fill(d, /Código \/ Sigla/, `E${RUN}`);
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const row = await apiFind<{ name: string }>(page, "/subjects", (s) => s.name === disciplina);
    expect(row, "disciplina criada na API").toBeTruthy();
  });

  test("Encarregado: criar", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/guardians");
    const d = await openDialog(page, "Cadastrar Encarregado");
    await expectNoScroll(d);
    await fill(d, /Nome Completo/, encarregado);
    await fill(d, /Número do BI/, doc(1));
    await fill(d, /Telefone Principal/, phone);
    await fill(d, /Endereço de E-mail/, `enc.${RUN.toLowerCase()}@e2e.mindschool.ao`);
    await d.getByRole("button", { name: "Cadastrar Encarregado" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const row = await apiFind<{ full_name: string }>(page, "/guardians", (g) => g.full_name === encarregado);
    expect(row, "encarregado criado na API").toBeTruthy();
  });

  test("Aluno: criar com o encarregado existente", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/list");
    const d = await openDialog(page, "Cadastrar Aluno");
    await expectNoScroll(d);
    await fill(d, /Nome Completo do Estudante/, aluno);
    await fill(d, /Data de Nascimento/, "2012-03-15");
    await fill(d, /Número do Documento/, doc(2));
    // encarregado: «Selecionar Existente» é o modo por omissão
    await combo(d, /Encarregado Registado/).click();
    await page.getByRole("option", { name: new RegExp(encarregado) }).first().click();
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const row = await apiFind<{ full_name: string }>(page, "/students", (s) => s.full_name === aluno);
    expect(row, "aluno criado na API").toBeTruthy();
  });

  test("Matrícula: matricular o aluno na turma", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/enrollments");
    const d = await openDialog(page, "Nova Matrícula");
    await expectNoScroll(d);
    await combo(d, /Seleccionar Estudante/).click();
    await page.getByPlaceholder("Digite o nome ou número...").fill(aluno);
    await page.getByRole("option", { name: new RegExp(aluno) }).first().click();
    await combo(d, /Turma de Destino/).click();
    await page.getByRole("option", { name: new RegExp(turma) }).first().click();
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const student = await apiFind<{ id: string; full_name: string }>(page, "/students", (s) => s.full_name === aluno);
    const enr = await apiFind<{ student: { id: string } }>(page, "/enrollments", (e) => e.student?.id === student?.id);
    expect(enr, "matrícula criada na API").toBeTruthy();
  });

  test("Atribuição docente: atribuir o professor à turma e à disciplina", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/assignments");
    const d = await openDialog(page, "Nova Atribuição");
    await expectNoScroll(d);
    await d.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /Joao Fernandes|João Fernandes/ }).first().click();
    // escolha múltipla: o botão abre um popover com pesquisa; as opções são role=option
    for (const [rotulo, escolha] of [["Turmas alocadas", turma], ["Disciplinas", disciplina]] as const) {
      await d.locator("label", { hasText: rotulo }).locator("xpath=following-sibling::button[1]").click();
      await page.getByPlaceholder(/Filtrar/).fill(escolha);
      await page.getByRole("option", { name: new RegExp(escolha) }).first().click();
      await page.keyboard.press("Escape");
    }
    await d.getByRole("button", { name: "Atribuir Docente" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const section = await apiFind<{ id: string; name: string }>(page, "/sections", (s) => s.name === turma);
    const subjects = await apiGet<{ data: Array<{ subject: { name: string } }> }>(page, `/sections/${section!.id}/subjects`);
    expect(subjects.data.some((x) => x.subject.name === disciplina), "disciplina atribuída à turma na API").toBe(true);
  });

  test("Conselho de turma: agendar para a turma criada", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/grades/councils");
    const d = await openDialog(page, "Agendar conselho");
    await expectNoScroll(d);
    await combo(d, /Turma/).click();
    await page.getByRole("option", { name: new RegExp(turma) }).first().click();
    await fill(d, /Data e hora/, "2026-12-10T10:00");
    await fill(d, /Agenda/, `Agenda e2e ${RUN}`);
    await d.getByRole("button", { name: "Agendar" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const row = await apiFind<{ agenda: string }>(page, "/councils", (c) => String(c.agenda ?? "").includes(`Agenda e2e ${RUN}`));
    expect(row, "conselho criado na API").toBeTruthy();
  });

  test("Exame final: nova chamada para a turma e a disciplina criadas", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/grades/final-exams");
    const before = (await apiList(page, "/final-exams")).length;
    const d = await openDialog(page, "Nova chamada");
    await expectNoScroll(d);
    await combo(d, /Disciplina e turma/).click();
    await page.getByRole("option", { name: new RegExp(turma) }).first().click();
    await fill(d, /Data/, "2027-01-15");
    await d.getByRole("button", { name: "Criar chamada" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });
    expect((await apiList(page, "/final-exams")).length).toBeGreaterThan(before);
  });

  test("Propinas: o financeiro marca duas cobranças como pagas numa só liquidação", async ({ page }) => {
    // as cobranças da matrícula são geradas de forma assíncrona: espera-se que existam
    await login(page, ACCOUNTS.financeiro);
    for (let i = 0; i < 30; i++) {
      const invoices = await apiList<{ student: { full_name: string } }>(page, "/invoices");
      if (invoices.filter((x) => x.student.full_name === aluno).length >= 2) break;
      await page.waitForTimeout(1000);
    }
    await page.goto("/tuition/payments");
    await page.getByPlaceholder(/Pesquisar/i).first().fill(aluno);
    const rows = page.locator("tbody tr", { hasText: aluno });
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    await rows.nth(0).getByRole("checkbox").check();
    await rows.nth(1).getByRole("checkbox").check();
    // o botão da barra de seleção (as linhas têm o seu próprio «Marcar como pago», que liquida só essa cobrança)
    const barra = page.getByText(/propinas seleccionadas/).locator("xpath=ancestor::div[contains(@class,'border-primary')][1]");
    await expect(barra).toContainText("2 propinas seleccionadas");
    await barra.getByRole("button", { name: "Marcar como pago" }).click();

    const d = dialog(page);
    await expect(d).toBeVisible();
    await expect(d).toContainText("2 cobranças");
    await expectNoScroll(d);
    await d.getByRole("button", { name: /Numerário/ }).click();
    await d.getByRole("button", { name: "Marcar como pago" }).last().click();
    await expect(d.getByText(/Pagamento registado/)).toBeVisible({ timeout: 25_000 });

    const paid = (await apiList<{ student: { full_name: string }; status: string }>(page, "/invoices", { status: "paga" })).filter((i) => i.student.full_name === aluno);
    expect(paid.length, "duas cobranças pagas na API").toBeGreaterThanOrEqual(2);
    // uma liquidação = um documento fiscal (sem MindGest ligado, fica em espera: nunca se simula a certificação)
    const docs = (await apiList<{ student: { full_name: string }; status: string }>(page, "/fiscal-documents")).filter((x) => x.student?.full_name === aluno);
    expect(docs.length, "um documento fiscal para a liquidação").toBe(1);
    expect(docs[0]!.status).toBe("sem_ligacao");
  });

  test("Turma: editar a capacidade e a sala", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/classes");
    await rowAction(page, await findRow(page, turma), "Editar Turma");
    const d = dialog(page);
    await expect(d).toBeVisible();
    await expectNoScroll(d);
    await fill(d, /Capacidade de Alunos/, "28");
    await fill(d, /Sala de Aulas/, `Sala ${RUN}-B`);
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const row = await apiFind<{ name: string; capacity: number; room_number: string }>(page, "/sections", (s) => s.name === turma && s.capacity === 28);
    expect(row?.room_number).toBe(`Sala ${RUN}-B`);
  });

  test("Disciplina: editar o nome", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    await page.goto("/academic/subjects");
    await rowAction(page, await findRow(page, disciplina), "Editar Disciplina");
    const d = dialog(page);
    await expect(d).toBeVisible();
    await expectNoScroll(d);
    await fill(d, /Nome Descritivo da Disciplina/, `${disciplina} (editada)`);
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    expect(await apiFind<{ name: string }>(page, "/subjects", (s) => s.name === `${disciplina} (editada)`)).toBeTruthy();
  });

  test("Encarregado: editar o telefone", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/guardians");
    await rowAction(page, await findRow(page, encarregado), "Editar Dados");
    const d = dialog(page);
    await expect(d).toBeVisible();
    await expectNoScroll(d);
    const novo = `93${stamp.slice(-7)}`;
    await fill(d, /Telefone Principal/, novo);
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const g = await apiFind<{ full_name: string; phone: string }>(page, "/guardians", (x) => x.full_name === encarregado && String(x.phone).includes(novo));
    expect(g, "telefone atualizado na API").toBeTruthy();
  });

  test("Aluno: editar e desativar", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/list");
    await rowAction(page, await findRow(page, aluno), "Editar");
    const d = dialog(page);
    await expect(d).toBeVisible();
    await expectNoScroll(d);
    await fill(d, /Escola Anterior|Nome Completo do Estudante/, `${aluno} Editado`);
    await d.locator('button[type="submit"]').click();
    await expect(d).toBeHidden({ timeout: 20_000 });
    const edited = await apiFind<{ id: string; full_name: string }>(page, "/students", (s) => s.full_name === `${aluno} Editado`);
    expect(edited, "nome atualizado na API").toBeTruthy();

    await page.goto("/students/list");
    await rowAction(page, await findRow(page, `${aluno} Editado`), "Desativar aluno");
    const confirm = page.getByRole("alertdialog").or(page.getByRole("dialog")).last();
    await confirm.getByRole("button", { name: /Desativar|Confirmar|Sim/ }).last().click();
    const inactive = await apiFind<{ full_name: string; status: string }>(page, "/students", (s) => s.full_name === `${aluno} Editado` && s.status === "inactivo");
    expect(inactive, "aluno desativado na API").toBeTruthy();
  });

  test("Matrícula: cancelar", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/students/enrollments");
    const row = await findRow(page, `${aluno}`);
    await rowAction(page, row, "Cancelar Matrícula");
    const d = dialog(page);
    await expect(d).toBeVisible();
    await expectNoScroll(d);
    const reason = d.locator("textarea, input[type=text]").first();
    if (await reason.count()) await reason.fill("Cancelamento de teste e2e");
    await d.getByRole("button", { name: /Cancelar Matrícula|Confirmar/ }).last().click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const student = await apiFind<{ id: string; full_name: string }>(page, "/students", (s) => s.full_name.startsWith(aluno));
    const enr = await apiFind<{ student: { id: string }; status: string }>(page, "/enrollments", (e) => e.student?.id === student?.id && e.status === "anulado");
    expect(enr, "matrícula cancelada na API").toBeTruthy();
  });
});
