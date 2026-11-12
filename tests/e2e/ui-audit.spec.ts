import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";

/**
 * Auditoria de coerência da interface: percorre todas as páginas da escola (titular) e da família (encarregado), em
 * computador e em telemóvel, e confirma regras do produto que se quebram sem ninguém reparar:
 *  - a página abre sem erro e tem título;
 *  - não há scroll horizontal da página;
 *  - não há datas em formato técnico (AAAA-MM-DD, ISO com «T»), «undefined», «NaN» ou «[object»;
 *  - não há texto português sem acentos nas palavras mais comuns;
 *  - botões só com ícone têm nome acessível; imagens têm `alt`;
 *  - nenhum erro de JavaScript na consola.
 * Só lê: não grava nada.
 *
 *   PORT=3001 pnpm exec playwright test tests/e2e/ui-audit.spec.ts --project=chromium --workers=1
 */
const SCHOOL = [
  "/dashboard", "/students/admissions", "/admissions/sessions", "/students/list", "/students/enrollments", "/students/guardians",
  "/certificates/documents", "/certificates/report-cards", "/certificates/archive",
  "/academic/classes", "/academic/subjects", "/academic/assignments", "/academic/timetables", "/academic/calendar", "/academic/lessons",
  "/academic/attendance", "/teachers-attendance",
  "/grades/entry", "/grades/grade-sheets", "/grades/reviews", "/grades/councils", "/grades/final-exams", "/grades/transitions",
  "/online-exams", "/dropout-risk", "/academic/library", "/academic/health-psychology", "/academic/transport", "/academic/extracurricular",
  "/communication/circulars", "/tuition", "/tuition/submissions", "/tuition/payments", "/tuition/invoices", "/tuition/collections", "/tuition/plans", "/plans",
  "/reports/med", "/reports/academic", "/reports/finance", "/reports/bi", "/reports/multi-school", "/settings",
];
const FAMILY = [
  "/dashboard", "/family/performance", "/family/timetable", "/family/calendar", "/family/subjects", "/family/exams",
  "/family/finance", "/family/library", "/family/documents", "/family/announcements", "/settings",
];

/** Palavras que em português levam acento e que, sem ele, denunciam texto escrito à pressa. */
const UNACCENTED = /\b(Nao|Sao|Ate|Ja|Matricula|Matriculas|Configuracoes|Informacoes|Descricao|Observacoes|Relatorio|Relatorios|Pagina|Numero|Disciplina?s?Ç|Nivel|Periodo|Calendario|Horario|Hist[oó]rico?Ç|Ultimo|Ultima|Titulo|Funcao|Educacao|Gestao|Avaliacao|Situacao|Obrigatorio)\b/;
const RAW_ISO = /\b20\d{2}-\d{2}-\d{2}(T\d{2}:\d{2}[^\s]*)?\b/;
const LEAKS = /\b(undefined|NaN|null)\b|\[object /;

interface Finding { page: string; viewport: string; rule: string; detail: string }

async function audit(page: Page, path: string, viewport: string, out: Finding[]): Promise<void> {
  const add = (rule: string, detail: string) => out.push({ page: path, viewport, rule, detail });
  const errors: string[] = [];
  const onError = (e: Error) => errors.push(e.message.slice(0, 160));
  page.on("pageerror", onError);

  await page.goto(path, { waitUntil: "domcontentloaded" }).catch(() => add("abre", "a navegação falhou"));
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(800);

  const body = (await page.locator("body").innerText().catch(() => "")) ?? "";
  if (/Application error|Unhandled Runtime Error|This page couldn.t load/i.test(body)) add("abre", "erro da aplicação");
  if (!page.url().includes(path.split("?")[0]) && !page.url().includes("/dashboard") && !page.url().includes("/auth/")) add("abre", `redirecionou para ${new URL(page.url()).pathname}`);

  const main = page.locator("main").first();
  const text = ((await main.innerText().catch(() => "")) ?? "").replace(/\s+/g, " ");
  if ((await main.locator("h1, h2").count()) === 0 && text.length > 0) add("título", "a página não tem título (h1/h2)");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) add("scroll horizontal", `${overflow}px a mais que o ecrã`);

  const visible = await main.evaluate((el) => {
    // texto visível fora de campos de formulário (nos campos de data, o formato técnico é normal)
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const parts: string[] = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || ["SCRIPT", "STYLE", "OPTION", "TEXTAREA", "INPUT"].includes(p.tagName)) continue;
      const s = getComputedStyle(p);
      if (s.display === "none" || s.visibility === "hidden") continue;
      const t = (n.textContent ?? "").trim();
      if (t) parts.push(t);
    }
    return parts.join(" | ");
  }).catch(() => "");
  const iso = visible.match(RAW_ISO);
  if (iso) add("data técnica", iso[0]);
  const leak = visible.match(LEAKS);
  if (leak) add("valor por formatar", leak[0]);
  const accent = visible.match(UNACCENTED);
  if (accent) add("sem acento", accent[0]);

  const unnamed = await main.evaluate((el) =>
    [...el.querySelectorAll("button, [role=button], a")].filter((b) => {
      const name = (b.getAttribute("aria-label") ?? b.getAttribute("title") ?? b.textContent ?? "").trim();
      return !name && !(b.querySelector("img[alt]:not([alt=''])"));
    }).length,
  ).catch(() => 0);
  if (unnamed > 0) add("botão sem nome", `${unnamed} botão(ões) só com ícone e sem aria-label/title`);
  const noAlt = await main.locator("img:not([alt])").count().catch(() => 0);
  if (noAlt > 0) add("imagem sem alt", `${noAlt} imagem(ns)`);

  for (const e of errors) add("erro JS", e);
  page.off("pageerror", onError);
}

for (const [name, email, routes] of [
  ["escola (titular)", "titular.enterprise@mindschool.ao", SCHOOL],
  ["família (encarregado)", "encarregado.enterprise@mindschool.ao", FAMILY],
] as const) {
  for (const [vpName, viewport] of [["computador", { width: 1440, height: 900 }], ["telemóvel", { width: 390, height: 844 }]] as const) {
    test(`${name} · ${vpName}: coerência da interface`, async ({ page }) => {
      test.setTimeout(20 * 60_000);
      await page.setViewportSize(viewport);
      await page.addInitScript(() => {
        try {
          const tours = ["setup", "dashboard", "plans", "students", "enrollments", "grades", "tuition"];
          const entry = { autoStartEnabled: false, tourButtonEnabled: true, seenTours: Object.fromEntries(tours.map((t) => [t, "completed"])) };
          window.localStorage.setItem("mindgest-onboarding-preferences", JSON.stringify({ state: { preferencesByScope: { "*": entry, "company:user": entry } }, version: 1 }));
        } catch {
          // sem armazenamento: o guia pode aparecer
        }
      });
      await login(page, email);
      const findings: Finding[] = [];
      for (const path of routes) await audit(page, path, vpName, findings);
      const report = findings.map((f) => `${f.page} [${f.viewport}] ${f.rule}: ${f.detail}`).join("\n");
      test.info().annotations.push({ type: "achados", description: report || "nenhum" });
      if (report) console.log(`\n=== ${name} · ${vpName} ===\n${report}`);
      expect(findings, report).toEqual([]);
    });
  }
}
