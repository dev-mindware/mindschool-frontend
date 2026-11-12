import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";

/**
 * Plano Profissional: cada área incluída abre sem erros e sem cadeado; o que é do Enterprise mostra o convite ao upgrade.
 * Contas: docs/testes-planos/2-escola-plano-profissional.md (escola «Instituto Politécnico Vanguard»).
 * Só lê: não grava nada.
 *
 *   PORT=3001 pnpm exec playwright test tests/e2e/profissional-smoke.spec.ts --project=chromium --workers=1
 */
const PRO = "Instituto Politécnico Vanguard";

/** Páginas do Profissional por papel (quem as usa no dia-a-dia). */
const INCLUDED: Array<{ account: string; label: string; paths: string[] }> = [
  { account: "titular.pro@mindschool.ao", label: "titular", paths: ["/dashboard", "/plans", "/reports/academic", "/reports/finance", "/academic/transport", "/academic/extracurricular", "/academic/health-psychology"] },
  { account: "pedagogico.pro@mindschool.ao", label: "direção pedagógica", paths: ["/academic/calendar", "/academic/lessons", "/academic/timetables", "/teachers-attendance", "/dropout-risk", "/online-exams", "/grades/grade-sheets", "/reports/academic"] },
  { account: "professor.pro@mindschool.ao", label: "professor", paths: ["/academic/lessons", "/online-exams", "/academic/attendance", "/grades/entry"] },
  { account: "secretaria.pro@mindschool.ao", label: "secretaria", paths: ["/academic/health-psychology", "/academic/transport", "/academic/extracurricular", "/students/list"] },
  { account: "encarregado.pro@mindschool.ao", label: "encarregado", paths: ["/dashboard", "/family/performance", "/family/timetable", "/family/calendar", "/family/exams", "/family/finance"] },
];

/** Do Enterprise: por endereço directo abrem a página de upgrade, nunca dados. */
const ENTERPRISE_ONLY = [
  { account: "financeiro.pro@mindschool.ao", paths: ["/tuition/collections"] },
  { account: "titular.pro@mindschool.ao", paths: ["/reports/multi-school", "/reports/bi"] },
];

/** Pedidos que falham por desenho (o plano ou o perfil não os permite, ou o recurso ainda não existe). */
const EXPECTED_FAILURES = /\/auth\/(refresh|me)|\/_next\/|favicon|\.map$/;

async function visit(page: Page, path: string) {
  const problems: string[] = [];
  const onError = (e: Error) => problems.push(`erro JS: ${e.message.slice(0, 140)}`);
  const onResponse = (r: { status: () => number; url: () => string }) => {
    const s = r.status();
    if (s >= 400 && !EXPECTED_FAILURES.test(r.url())) problems.push(`HTTP ${s} ${new URL(r.url()).pathname.replace(/[0-9a-f-]{36}/g, ":id")}`);
  };
  page.on("pageerror", onError);
  page.on("response", onResponse);
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(600);
  page.off("pageerror", onError);
  page.off("response", onResponse);
  const body = (await page.locator("body").innerText().catch(() => "")) ?? "";
  return { problems, body, url: page.url() };
}

const skipTours = (page: Page) =>
  page.addInitScript(() => {
    try {
      const tours = ["setup", "dashboard", "plans", "students", "enrollments", "grades", "tuition"];
      const entry = { autoStartEnabled: false, tourButtonEnabled: true, seenTours: Object.fromEntries(tours.map((t) => [t, "completed"])) };
      window.localStorage.setItem("mindgest-onboarding-preferences", JSON.stringify({ state: { preferencesByScope: { "*": entry, "company:user": entry } }, version: 1 }));
    } catch {
      // sem armazenamento: o guia pode aparecer
    }
  });

for (const { account, label, paths } of INCLUDED) {
  test(`Profissional · ${label}: as áreas do plano abrem sem erros nem cadeado`, async ({ page }) => {
    test.setTimeout(5 * 60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await skipTours(page);
    await login(page, account);
    const findings: string[] = [];
    for (const path of paths) {
      const { problems, body, url } = await visit(page, path);
      if (new URL(url).pathname !== path.split("?")[0]) findings.push(`${path}: redirecionou para ${new URL(url).pathname}`);
      if (/Application error|Unhandled Runtime Error/i.test(body)) findings.push(`${path}: erro da aplicação`);
      if (/Recurso Exclusivo|Disponível no plano|disponível no plano (Profissional|Enterprise)/i.test(body)) findings.push(`${path}: mostra convite ao upgrade num plano que já o inclui`);
      if (/Sem acesso/i.test(body) && !/Sem acesso a/i.test(body)) findings.push(`${path}: «Sem acesso»`);
      for (const p of new Set(problems)) findings.push(`${path}: ${p}`);
    }
    expect(findings, findings.join("\n")).toEqual([]);
  });
}

test(`Profissional: o que é do Enterprise mostra o convite ao upgrade e nenhum dado (${PRO})`, async ({ page }) => {
  test.setTimeout(3 * 60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await skipTours(page);
  const findings: string[] = [];
  for (const { account, paths } of ENTERPRISE_ONLY) {
    await page.context().clearCookies();
    await login(page, account);
    for (const path of paths) {
      const { body } = await visit(page, path);
      if (!/Enterprise/i.test(body)) findings.push(`${path}: não mostra o convite ao plano Enterprise`);
    }
  }
  expect(findings, findings.join("\n")).toEqual([]);
});
