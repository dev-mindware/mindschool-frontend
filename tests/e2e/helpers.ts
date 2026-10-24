import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Auxiliares dos testes e2e do plano Essencial. Correm contra uma API e um frontend locais com os dados de demonstração
 * (docs/testes-planos/1-escola-plano-essencial.md): escola «Colégio Esperança do Saber», palavra-passe universal de testes.
 *
 * Cada execução cria dados com um sufixo próprio (`RUN`), para não colidir com execuções anteriores nem com dados de demonstração.
 */
export const API = process.env.E2E_API_URL ?? "http://localhost:3011/api/v1";
export const APP_ORIGIN = process.env.E2E_APP_ORIGIN ?? `http://localhost:${process.env.PORT ?? 3003}`;
export const PASSWORD = process.env.E2E_PASSWORD ?? "TestesEscola2026!";

/** Sufixo único desta execução (4 letras/dígitos), para nomes e códigos. */
export const RUN = Date.now().toString(36).slice(-4).toUpperCase();

export const ACCOUNTS = {
  titular: "titular.essencial@mindschool.ao",
  direccao: "pedagogico.essencial@mindschool.ao",
  secretaria: "secretaria.essencial@mindschool.ao",
  financeiro: "financeiro.essencial@mindschool.ao",
  professor: "professor.essencial@mindschool.ao",
  encarregado: "encarregado.essencial@mindschool.ao",
  aluno: "aluno.essencial@mindschool.ao",
} as const;

export async function login(page: Page, email: string): Promise<void> {
  await page.goto("/auth/login");
  await page.getByPlaceholder("exemplo@escola.ao").fill(email);
  const password = page.locator('input[type="password"]').first();
  await password.fill(PASSWORD);
  await password.press("Enter");
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/login"), { timeout: 30_000 });
  // O frontend guarda a sessão em cookies do Next e envia `Authorization`; para confirmar dados na API entra-se também
  // directamente nela (cookies da própria API, no mesmo contexto do browser).
  const direct = await page.request.post(`${API}/auth/login`, { data: { email, password: PASSWORD }, headers: { Origin: APP_ORIGIN } });
  expect(direct.ok(), `login directo na API → ${direct.status()}`).toBeTruthy();
}

// ---- API (com a sessão do browser) ------------------------------------------------------------------------------------

interface ApiPage<T> {
  data: T[];
  page?: { has_more: boolean; next_cursor: string | null };
}

export async function schoolId(page: Page): Promise<string> {
  const res = await page.request.get(`${API}/auth/me`);
  expect(res.ok(), `GET /auth/me → ${res.status()}`).toBeTruthy();
  const me = (await res.json()) as { memberships: Array<{ school_id: string }> };
  return me.memberships[0]!.school_id;
}

/** GET de uma rota de escola (`/students`, `/academic-years`…); devolve o corpo JSON. */
export async function apiGet<T = unknown>(page: Page, path: string, params: Record<string, string> = {}): Promise<T> {
  const id = await schoolId(page);
  const q = new URLSearchParams(params).toString();
  const res = await page.request.get(`${API}/schools/${id}${path}${q ? `?${q}` : ""}`);
  expect(res.ok(), `GET ${path} → ${res.status()} ${await res.text().catch(() => "")}`).toBeTruthy();
  return (await res.json()) as T;
}

/** Todas as linhas de uma lista paginada por cursor. */
export async function apiList<T = Record<string, unknown>>(page: Page, path: string, params: Record<string, string> = {}): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | null = null;
  do {
    const body: ApiPage<T> = await apiGet<ApiPage<T>>(page, path, { ...params, limit: "100", ...(cursor ? { cursor } : {}) });
    out.push(...body.data);
    cursor = body.page?.has_more ? body.page.next_cursor : null;
  } while (cursor && out.length < 2000);
  return out;
}

/** Procura, com algumas tentativas, uma linha que cumpra o critério (as listas podem demorar a reflectir a gravação). */
export async function apiFind<T extends Record<string, unknown>>(page: Page, path: string, match: (row: T) => boolean, params: Record<string, string> = {}): Promise<T | undefined> {
  for (let i = 0; i < 6; i++) {
    const row = (await apiList<T>(page, path, params)).find(match);
    if (row) return row;
    await page.waitForTimeout(500);
  }
  return undefined;
}

// ---- Interface ----------------------------------------------------------------------------------------------------------

export function dialog(page: Page): Locator {
  return page.getByRole("dialog").last();
}

/** Abre o diálogo clicando no botão e espera que apareça. */
export async function openDialog(page: Page, button: string | RegExp): Promise<Locator> {
  await page.getByRole("button", { name: button }).first().click();
  const d = dialog(page);
  await expect(d).toBeVisible();
  return d;
}

/** Regra do produto: nenhum modal tem scroll. */
export async function expectNoScroll(d: Locator): Promise<void> {
  // qualquer elemento do modal (ele próprio incluído) com overflow vertical activo e conteúdo maior do que a caixa
  const scrolls = await d.evaluate((el) =>
    [el, ...el.querySelectorAll("*")].some((n) => {
      const oy = getComputedStyle(n).overflowY;
      return (oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight + 1;
    }),
  );
  expect(scrolls, "o modal tem scroll (nenhum modal pode ter)").toBe(false);
}

/** Campo (input/textarea) que vem a seguir ao rótulo: os rótulos da aplicação não estão ligados por `for`/`id`. */
export function field(d: Locator, label: string | RegExp): Locator {
  return d.locator("label", { hasText: label }).first().locator('xpath=following::*[self::input or self::textarea][1]');
}

/** Select (Radix) que vem a seguir ao rótulo. */
export function combo(d: Locator, label: string | RegExp): Locator {
  return d.locator("label", { hasText: label }).first().locator('xpath=following::*[@role="combobox"][1]');
}

/** Preenche um campo de texto pelo rótulo (aceita texto parcial). */
export async function fill(d: Locator, label: string | RegExp, value: string): Promise<void> {
  await field(d, label).fill(value);
}

/** Escolhe uma opção num select (Radix) pelo rótulo do campo e pelo texto da opção. */
export async function choose(page: Page, d: Locator, label: string | RegExp, option: string | RegExp): Promise<void> {
  await combo(d, label).click();
  await page.getByRole("option", { name: option }).first().click();
}

/** Clica num botão do diálogo e espera que o diálogo feche (gravação concluída). */
export async function submitDialog(page: Page, d: Locator, button: string | RegExp): Promise<void> {
  await d.getByRole("button", { name: button }).click();
  await expect(d).toBeHidden({ timeout: 20_000 });
}

/** Filtra a lista pela caixa de pesquisa (as listas são paginadas) e devolve a linha com o texto. */
export async function findRow(page: Page, text: string): Promise<Locator> {
  const search = page.getByPlaceholder(/Pesquisar/i).first();
  await search.fill(text);
  const row = page.locator("tbody tr", { hasText: text }).first();
  await expect(row, `linha «${text}» na lista`).toBeVisible({ timeout: 15_000 });
  return row;
}

/** Menu de acções de uma linha: abre-o e escolhe o item. */
export async function rowAction(page: Page, row: Locator, item: string | RegExp): Promise<void> {
  await row.locator('button[aria-haspopup="menu"]').first().click();
  await page.getByText(item, { exact: typeof item === "string" }).last().click();
}
