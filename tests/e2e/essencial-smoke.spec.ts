import { expect, test, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";

/**
 * Percurso do plano Essencial pela interface: cada perfil da escola «Colégio Esperança do Saber» entra e abre as páginas
 * a que o menu dá acesso. Falha se alguma página rebentar (erro da aplicação), se a API responder 5xx ou se a página ficar
 * vazia. As respostas 4xx ficam no relatório (`test-results/essencial-smoke.json`) porque 402/403 são esperadas nas
 * funcionalidades de planos superiores ou sem permissão.
 *
 * Corre contra um frontend e uma API locais com os dados de demonstração (docs/testes-planos/1-escola-plano-essencial.md):
 *   PORT=3003 pnpm exec playwright test tests/e2e/essencial-smoke.spec.ts --project=chromium
 */
const PASSWORD = process.env.E2E_PASSWORD ?? "TestesEscola2026!";

const SCHOOL_PAGES = [
  "/dashboard", "/students/admissions", "/admissions/sessions", "/students/list", "/students/enrollments", "/students/guardians",
  "/certificates/documents", "/certificates/report-cards", "/certificates/declarations", "/certificates/requests", "/certificates/archive",
  "/academic/classes", "/academic/subjects", "/academic/timetables", "/academic/calendar", "/academic/attendance", "/academic/library",
  "/teachers", "/grades/entry", "/grades/pautas", "/grades/reviews", "/grades/councils", "/grades/final-exams", "/grades/transitions",
  "/tuition/invoices", "/tuition/payments", "/tuition/plans", "/tuition/submissions", "/communication/circulars",
  "/reports/academic", "/reports/finance", "/reports/med",
  "/settings", "/settings/general", "/settings/users", "/settings/policies", "/settings/security", "/settings/audit", "/settings/imports", "/settings/export",
  "/plans", "/subscription", "/notifications",
];

const FAMILY_PAGES = [
  "/dashboard", "/familia/aproveitamento", "/familia/biblioteca", "/familia/calendario", "/familia/comunicados",
  "/familia/disciplinas", "/familia/documentos", "/familia/financeiro", "/familia/horario", "/familia/provas", "/settings",
];

const ROLES: Array<{ role: string; email: string; pages: string[] }> = [
  { role: "titular", email: "titular.essencial@mindschool.ao", pages: SCHOOL_PAGES },
  { role: "direccao_pedagogica", email: "pedagogico.essencial@mindschool.ao", pages: SCHOOL_PAGES },
  { role: "secretaria", email: "secretaria.essencial@mindschool.ao", pages: SCHOOL_PAGES },
  { role: "financeiro", email: "financeiro.essencial@mindschool.ao", pages: SCHOOL_PAGES },
  { role: "professor", email: "professor.essencial@mindschool.ao", pages: SCHOOL_PAGES },
  { role: "encarregado", email: "encarregado.essencial@mindschool.ao", pages: FAMILY_PAGES },
  { role: "aluno", email: "aluno.essencial@mindschool.ao", pages: FAMILY_PAGES },
];

async function login(page: Page, email: string) {
  await page.goto("/auth/login");
  await page.getByPlaceholder("exemplo@escola.ao").fill(email);
  const password = page.locator('input[type="password"]').first();
  await password.fill(PASSWORD);
  await password.press("Enter");
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/login"), { timeout: 30_000 });
}

const report: Record<string, Array<{ page: string; status: "ok" | "falhou"; client_errors: string[]; server_errors: string[]; app_error?: string }>> = {};

for (const { role, email, pages } of ROLES) {
  test(`Essencial › ${role}: todas as páginas abrem sem erros`, async ({ page }) => {
    test.setTimeout(15 * 60_000);
    await login(page, email);
    const rows: (typeof report)[string] = [];
    report[role] = rows;

    for (const path of pages) {
      const server: string[] = [];
      const client: string[] = [];
      const onResponse = (r: import("@playwright/test").Response) => {
        const s = r.status();
        if (s >= 500) server.push(`${s} ${r.request().method()} ${r.url().replace(/\?.*/, "")}`);
        else if (s >= 400 && s !== 401) client.push(`${s} ${r.request().method()} ${r.url().replace(/\?.*/, "")}`);
      };
      page.on("response", onResponse);
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => undefined);

      const bodyText = (await page.locator("body").innerText().catch(() => "")) ?? "";
      const crashed = /Application error|Algo correu mal|Something went wrong|Unhandled Runtime Error/i.test(bodyText);
      const empty = bodyText.trim().length < 20;
      const failed = server.length > 0 || crashed || empty;
      rows.push({
        page: path,
        status: failed ? "falhou" : "ok",
        client_errors: [...new Set(client)],
        server_errors: [...new Set(server)],
        ...(crashed ? { app_error: "erro da aplicação" } : empty ? { app_error: "página vazia" } : {}),
      });
      page.off("response", onResponse);
    }

    mkdirSync("test-results", { recursive: true });
    writeFileSync("test-results/essencial-smoke.json", JSON.stringify(report, null, 2));
    const bad = rows.filter((r) => r.status === "falhou");
    expect(bad, `Páginas com erro para ${role}: ${JSON.stringify(bad, null, 1)}`).toEqual([]);
  });
}
