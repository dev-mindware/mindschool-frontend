import { expect, test } from "@playwright/test";
import { API, RUN, apiGet, apiList, login, schoolId } from "./helpers";

/**
 * Plano Profissional · planeamento pedagógico: o professor escreve uma dosificação e exporta-a (PDF, Word e
 * Excel) a partir da lista.
 * Escola «Instituto Politécnico Vanguard» (docs/testes-planos/2-escola-plano-profissional.md). Cria dados com o sufixo RUN.
 *
 *   PORT=3001 pnpm exec playwright test tests/e2e/profissional-planeamento.spec.ts --project=chromium --workers=1
 */
interface Section { id: string; name: string }
interface SectionSubject { id: string; subject: { name: string }; teacher: { full_name: string } }
interface Term { id: string; sequence: number }

test("professor cria a dosificação e exporta-a em PDF, Word e Excel", async ({ page }) => {
  test.setTimeout(3 * 60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    try {
      const tours = ["setup", "dashboard", "plans", "students", "enrollments", "grades", "tuition"];
      const entry = { autoStartEnabled: false, tourButtonEnabled: true, seenTours: Object.fromEntries(tours.map((t) => [t, "completed"])) };
      window.localStorage.setItem("mindgest-onboarding-preferences", JSON.stringify({ state: { preferencesByScope: { "*": entry, "company:user": entry } }, version: 1 }));
    } catch {
      // sem armazenamento: o guia pode aparecer
    }
  });
  await login(page, "professor.pro@mindschool.ao");
  const id = await schoolId(page);

  // disciplina do professor e período: pela API, com a sessão do browser
  const sections = await apiList<Section>(page, "/sections");
  let sectionSubjectId = "";
  for (const s of sections) {
    const subjects = (await apiGet<{ data: SectionSubject[] }>(page, `/sections/${s.id}/subjects`)).data;
    const mine = subjects.find((x) => x.teacher.full_name.includes("Beatriz"));
    if (mine) { sectionSubjectId = mine.id; break; }
  }
  expect(sectionSubjectId, "o professor não tem disciplinas atribuídas").not.toBe("");
  const years = await apiList<{ id: string; status: string }>(page, "/academic-years");
  const year = years.find((y) => y.status === "activo") ?? years[0]!;
  const terms = (await apiGet<{ data: Term[] }>(page, `/academic-years/${year.id}/terms`)).data;
  const termId = terms.find((t) => t.sequence === 1)?.id ?? terms[0]!.id;

  // Limpa dosificações prévias deste período para garantir idempotência do teste
  const existingPlans = await apiList<{ id: string; term?: { id: string } }>(page, "/teaching-plans").catch(() => []);
  for (const p of existingPlans) {
    await page.request.delete(`${API}/schools/${id}/teaching-plans/${p.id}`).catch(() => undefined);
  }

  const title = `Dosificação ${RUN}`;
  const created = await page.request.post(`${API}/schools/${id}/teaching-plans`, {
    data: {
      kind: "dosificacao", section_subject_ids: [sectionSubjectId], term_id: termId, title,
      content: { weeks: [{ week: 1, theme: "Números inteiros", objectives: "Operar com inteiros", contents: "Soma e subtração", lessons: 3 }, { week: 2, theme: "Frações", objectives: "Comparar frações", contents: "Equivalência", lessons: 3 }] },
    },
  });
  expect(created.status(), await created.text()).toBe(201);

  await page.goto("/academic/lessons");
  await page.getByRole("tab", { name: "Planeamento" }).click();
  const row = page.getByRole("row", { name: new RegExp(title) });
  await expect(row).toBeVisible({ timeout: 20_000 });

  for (const [format, ext] of [["PDF", "pdf"], ["Word", "docx"], ["Excel", "xlsx"]] as const) {
    await row.getByRole("button", { name: /Exportar/ }).click();
    const download = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: new RegExp(`em ${format}`) }).first().click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(new RegExp(`\\.${ext}$`));
    await expect(page.getByRole("button", { name: /Exportar/ }).first()).toBeEnabled({ timeout: 20_000 });
    await page.keyboard.press("Escape");
  }
});
