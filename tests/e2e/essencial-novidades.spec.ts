import { expect, test } from "@playwright/test";
import { ACCOUNTS, API, APP_ORIGIN, RUN, apiFind, apiGet, apiList, expectNoScroll, fill, findRow, login, rowAction, schoolId } from "./helpers";

/**
 * Funcionalidades pedidas depois do relatório de testes em produção: apagar turma vazia, editar sessão da prova de
 * acesso e o assistente MIND adaptado ao MindSchool.
 *
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-novidades.spec.ts --project=chromium --workers=1
 */
test.use({ viewport: { width: 1536, height: 900 } });

const LETRAS = RUN.replace(/\d/g, (d) => "ABCDEFGHIJ"[Number(d)]!);

type Seccao = { id: string; name: string; academic_year_id: string; class_level: { id: string } };

test.describe.serial("Turmas: apagar só se estiver vazia", () => {
  test("limpeza: as turmas de teste antigas (vazias) apagam-se pela API e libertam a quota", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    const id = await schoolId(page);
    const antigas = (await apiList<Seccao>(page, "/sections")).filter((s) => s.name.startsWith("E2E-"));
    let apagadas = 0;
    for (const s of antigas) {
      const res = await page.request.delete(`${API}/schools/${id}/sections/${s.id}`);
      expect([200, 409], `apagar ${s.name}: ${res.status()}`).toContain(res.status());
      if (res.status() === 200) apagadas++;
    }
    console.log(`turmas de teste apagadas: ${apagadas} de ${antigas.length}`);
  });

  test("uma turma vazia apaga-se pela interface (com confirmação) e deixa de existir na API", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    const id = await schoolId(page);
    const modelo = (await apiList<Seccao>(page, "/sections"))[0]!;
    const nome = `Vazia-${LETRAS}`;
    const criada = await page.request.post(`${API}/schools/${id}/sections`, {
      data: { academic_year_id: modelo.academic_year_id, class_level_id: modelo.class_level.id, name: nome, shift: "manha", capacity: 30 },
    });
    expect(criada.status(), await criada.text()).toBe(201);

    await page.goto("/academic/classes");
    const linha = await findRow(page, nome);
    await rowAction(page, linha, "Apagar Turma");
    const d = page.getByRole("dialog").last();
    await expect(d).toContainText("Apagar turma");
    await expectNoScroll(d);
    await d.getByRole("button", { name: "Apagar turma" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    expect(await apiFind(page, "/sections", (s) => (s as unknown as Seccao).name === nome), "a turma deixou de existir").toBeUndefined();
  });

  test("uma disciplina livre apaga-se pela interface (com confirmação) e deixa de existir na API", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    const id = await schoolId(page);
    const nome = `Livre ${LETRAS}`;
    const criada = await page.request.post(`${API}/schools/${id}/subjects`, { data: { name: nome, grading_scale: "quantitativa", is_core_subject: false } });
    expect(criada.status(), await criada.text()).toBe(201);

    await page.goto("/academic/subjects");
    await rowAction(page, await findRow(page, nome), "Apagar Disciplina");
    const d = page.getByRole("dialog").last();
    await expect(d).toContainText("Apagar disciplina");
    await d.getByRole("button", { name: "Apagar disciplina" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    expect(await apiFind(page, "/subjects", (s) => (s as unknown as { name: string }).name === nome), "a disciplina deixou de existir").toBeUndefined();
  });

  test("uma turma com alunos não se apaga: o sistema diz porquê e a turma fica", async ({ page }) => {
    await login(page, ACCOUNTS.direccao);
    const id = await schoolId(page);
    const comAlunos = (await apiGet<{ data: Array<{ id: string; name: string; enrolled_count: number }> }>(page, "/sections", { limit: "100" })).data.find((s) => s.enrolled_count > 0);
    expect(comAlunos, "há uma turma com alunos nos dados de teste").toBeTruthy();

    await page.goto("/academic/classes");
    const linha = await findRow(page, comAlunos!.name);
    await rowAction(page, linha, "Apagar Turma");
    await page.getByRole("dialog").last().getByRole("button", { name: "Apagar turma" }).click();
    await expect(page.getByText(/não se pode apagar: tem .*matrícula/i).first()).toBeVisible({ timeout: 15_000 });
    const res = await page.request.get(`${API}/schools/${id}/sections/${comAlunos!.id}`);
    expect(res.status()).toBe(200); // continua lá
  });
});

test.describe.serial("Sessões da prova de acesso: editar", () => {
  const titulo = `Prova Editavel ${LETRAS}`;

  test("a secretaria edita título, local e vagas de uma sessão agendada", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    const id = await schoolId(page);
    const ano = (await apiList<{ id: string; status: string }>(page, "/academic-years")).find((a) => a.status === "activo");
    expect(ano, "há um ano lectivo activo").toBeTruthy();
    const futuro = new Date(Date.now() + 40 * 86_400_000).toISOString();
    const criada = await page.request.post(`${API}/schools/${id}/admission-exam-sessions`, { data: { academic_year_id: ano!.id, title: titulo, scheduled_at: futuro, location: "Sala 1", capacity: 10 } });
    expect(criada.status(), await criada.text()).toBe(201);

    await page.goto("/admissions/sessions");
    const linha = await findRow(page, titulo);
    await rowAction(page, linha, "Editar Sessão");
    const d = page.getByRole("dialog").last();
    await expect(d).toContainText("Editar sessão da prova de acesso");
    await expectNoScroll(d);
    await fill(d, /Título da Prova/, `${titulo} (2.ª fase)`);
    await fill(d, /Sala \/ Local/, "Sala 7");
    await fill(d, /Capacidade de Vagas/, "25");
    await d.getByRole("button", { name: "Guardar alterações" }).click();
    await expect(d).toBeHidden({ timeout: 20_000 });

    const sessao = await apiFind<{ title: string; location: string; capacity: number }>(page, "/admission-exam-sessions", (s) => s.title === `${titulo} (2.ª fase)`);
    expect(sessao, "a sessão actualizada existe").toBeTruthy();
    expect(sessao).toMatchObject({ location: "Sala 7", capacity: 25 });
  });

  test("a data no passado é recusada no próprio campo", async ({ page }) => {
    await login(page, ACCOUNTS.secretaria);
    await page.goto("/admissions/sessions");
    const linha = await findRow(page, titulo);
    await rowAction(page, linha, "Editar Sessão");
    const d = page.getByRole("dialog").last();
    await fill(d, /Data e Hora da Prova/, "2020-01-10T09:00");
    await expect(d.getByText(/tem de ser no futuro/)).toBeVisible();
    await expect(d.getByRole("button", { name: "Guardar alterações" })).toBeDisabled();
    await d.getByRole("button", { name: "Cancelar" }).click();
  });
});

test.describe("Assistente MIND no MindSchool", () => {
  test("pede o contexto da escola e mostra sugestões do papel", async ({ page }) => {
    let corpo: Record<string, unknown> = {};
    // o servidor do assistente é outra origem: a resposta simulada tem de trazer os cabeçalhos CORS
    const cors = { "access-control-allow-origin": APP_ORIGIN, "access-control-allow-credentials": "true", "access-control-allow-methods": "POST, OPTIONS" };
    await page.context().route(/chatbot\.mindware-vps\.cloud\/chat/, async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: { ...cors, "access-control-allow-headers": route.request().headers()["access-control-request-headers"] ?? "content-type" } });
      corpo = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ success: true, reply: "Olá! Sou o MIND.", sessionId: "s" }) });
    });
    await login(page, ACCOUNTS.encarregado);
    await page.goto("/dashboard");
    const expirada = page.getByRole("button", { name: "Agora não" });
    if (await expirada.isVisible({ timeout: 3000 }).catch(() => false)) await expirada.click();
    await page.locator("button.mind-button").first().click();
    const folha = page.getByRole("dialog").last();
    await expect(folha).toBeVisible();
    // sugestões do encarregado (e não as da secretaria ou das pautas)
    await expect(folha.getByRole("button", { name: "Propinas", exact: true })).toBeVisible();
    await expect(folha.getByRole("button", { name: "Faltas", exact: true })).toBeVisible();
    await expect(folha.getByRole("button", { name: "Pautas", exact: true })).toHaveCount(0);

    await folha.getByPlaceholder(/Pergunte qualquer coisa/).fill("Quando vence a propina?");
    await folha.getByPlaceholder(/Pergunte qualquer coisa/).press("Enter");
    await expect(folha.getByText("Olá! Sou o MIND.")).toBeVisible({ timeout: 15_000 });
    expect(corpo).toMatchObject({ product: "mindschool", message: "Quando vence a propina?" });
    expect(String(corpo.schoolId)).toMatch(/^[0-9a-f-]{36}$/);
    expect(String(corpo.schoolName)).not.toBe("");
    expect(corpo.storeId).toBeNull();
  });
});

test.describe("Relatório 6: o que cada papel pode fazer", () => {
  test("a Direção Geral vê as notas só em consulta (a API recusava ao gravar) e o trimestre inicial é o em curso", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/grades/entry");
    await expect(page.getByText(/Só consulta: as notas são lançadas pelo professor/)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('tbody tr').first().locator('input[type="number"]').first()).toBeDisabled();
    // outubro: o trimestre por omissão é o 1.º (antes era sempre o 2.º)
    await expect(page.getByRole("combobox", { name: "Trimestre de Avaliação" })).toContainText("1.º Trimestre");
  });

  test("a grelha de tempos mostra «Só consulta» à Direção Geral em vez de um botão que dá 403", async ({ page }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/academic/timetables");
    await expect(page.getByRole("button", { name: "Criar grelha de tempos" })).toHaveCount(0);
  });
});
