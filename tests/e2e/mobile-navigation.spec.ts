import { expect, test } from "@playwright/test";
import { ACCOUNTS, login } from "./helpers";

/**
 * Validação E2E de Navegação Responsiva (Mobile vs Desktop), Filtros Mobile (Bottom Sheet) e Settings Hub Mobile.
 *
 * Corre contra o frontend local (padrão porta 3001) e API local (padrão porta 3011):
 *   $env:PORT="3001"; pnpm exec playwright test tests/e2e/mobile-navigation.spec.ts --project=chromium
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      const allDone = {
        setup: "completed",
        dashboard: "completed",
        plans: "completed",
        students: "completed",
        enrollments: "completed",
        grades: "completed",
        tuition: "completed",
      };
      const entry = {
        autoStartEnabled: false,
        tourButtonEnabled: true,
        seenTours: allDone,
      };
      window.localStorage.setItem(
        "mindgest-onboarding-preferences",
        JSON.stringify({
          state: {
            preferencesByScope: {
              "*": entry,
              "company:user": entry,
            },
          },
          version: 1,
        }),
      );
    } catch {
      // ignore
    }

    const style = document.createElement("style");
    style.textContent = `nextjs-portal { display: none !important; pointer-events: none !important; }`;
    document.addEventListener("DOMContentLoaded", () => {
      document.head?.appendChild(style);
    });
  });
});

test.describe("Experiência Mobile (< 768px) — Navbar por Módulos, Filtros e Definições", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Navbar Mobile: estado compacto (4 módulos), dropdown de subpáginas, expansão vertical e navegação", async ({
    page,
  }) => {
    await login(page, ACCOUNTS.titular);

    // 0. A sidebar lateral normal não existe em mobile e o botão do topo abre o dropdown de escola e conta
    await expect(page.locator('[data-slot="sidebar"]')).toHaveCount(0);
    await expect(page.locator('[data-slot="sidebar-trigger"]')).toBeHidden();

    const mobileHeaderTrigger = page.getByRole("button", {
      name: "Menu da escola e conta",
    });
    await expect(mobileHeaderTrigger).toBeVisible();
    await mobileHeaderTrigger.click();

    const headerMenu = page.getByRole("menu");
    await expect(headerMenu).toBeVisible();
    await expect(headerMenu).toContainText(ACCOUNTS.titular);
    await expect(
      headerMenu.getByRole("menuitem", { name: "Perfil" }),
    ).toBeVisible();
    await expect(
      headerMenu.getByRole("menuitem", { name: "Aparência" }),
    ).toBeVisible();
    await expect(
      headerMenu.getByRole("menuitem", { name: "Sair" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(headerMenu).toBeHidden();

    const mobileNav = page.getByRole("navigation", {
      name: "Navegação por módulos",
    });
    await expect(mobileNav).toBeVisible();

    // 1. No estado compacto em /dashboard, Início está activo e os 4 primeiros módulos estão visíveis
    const inicioBtn = mobileNav.getByRole("button", { name: "Início" });
    await expect(inicioBtn).toHaveAttribute("aria-current", "page");
    await expect(inicioBtn).toContainText("Início");

    await expect(
      mobileNav.getByRole("button", { name: "Secretaria" }),
    ).toBeVisible();
    await expect(
      mobileNav.getByRole("button", { name: "Académico" }),
    ).toBeVisible();
    await expect(
      mobileNav.getByRole("button", { name: "Avaliação" }),
    ).toBeVisible();

    // 2. Clicar num módulo com várias páginas abre o dropdown de subpáginas
    await mobileNav.getByRole("button", { name: "Académico" }).click();
    const dropdown = page.getByRole("region", {
      name: "Páginas do módulo Académico",
    });
    await expect(dropdown).toBeVisible();

    const turmasLink = dropdown.getByRole("link", { name: "Turmas" });
    await expect(turmasLink).toBeVisible();

    // 3. Clicar numa subpágina navega para a rota e fecha o dropdown
    await turmasLink.click();
    await page.waitForURL("**/academic/classes");
    await expect(dropdown).toBeHidden();

    // Académico passa a ter aria-current="page"
    await expect(
      mobileNav.getByRole("button", { name: "Académico" }),
    ).toHaveAttribute("aria-current", "page");

    // 4. Clicar na seta para cima expande todos os módulos
    const expandBtn = mobileNav.getByRole("button", {
      name: "Mostrar todos os módulos",
    });
    await expandBtn.click();

    const allModulesPanel = mobileNav.getByRole("region", {
      name: "Todos os módulos",
    });
    await expect(allModulesPanel).toBeVisible();
    await expect(
      allModulesPanel.getByRole("button", { name: /Financeiro/i }),
    ).toBeVisible();
    await expect(
      allModulesPanel.getByRole("button", { name: /Configurações/i }),
    ).toBeVisible();

    // 5. Seleccionar Configurações (página única) navega directamente para /settings e inclui Configurações nos 4 compactos
    await allModulesPanel.getByRole("button", { name: /Configurações/i }).click();
    await page.waitForURL("**/settings");
    await expect(allModulesPanel).toBeHidden();

    const configCompactBtn = mobileNav.getByRole("button", {
      name: "Configurações",
    });
    await expect(configCompactBtn).toBeVisible();
    await expect(configCompactBtn).toHaveAttribute("aria-current", "page");
  });

  test("Settings Hub Mobile: apresenta categorias agrupadas, pesquisa e navegação interna com Quick Switcher", async ({
    page,
  }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/settings");

    // 1. Vista Hub Mobile sem ?tab= activa
    await expect(
      page.getByRole("heading", { name: "Definições da Conta" }),
    ).toBeVisible();

    const searchInput = page.getByPlaceholder(/Pesquisar definição/i);
    await expect(searchInput).toBeVisible();

    // Filtra por Segurança
    await searchInput.fill("Segurança");
    const securityCard = page
      .locator('[data-tour="setup-tab-security"]')
      .last();
    await expect(securityCard).toBeVisible();

    // 2. Abre a secção Segurança
    await securityCard.click();
    await page.waitForURL("**/settings?tab=security");

    // Verifica a barra de topo da secção activa em mobile
    const backToHubBtn = page.getByRole("button", {
      name: /Todas as definições/i,
    });
    await expect(backToHubBtn).toBeVisible();

    // 3. Abre o Quick Switcher Bottom Sheet e muda para Aparência
    await page.getByRole("button", { name: /Segurança/i }).first().click();
    const switcherDialog = page.getByRole("dialog", {
      name: "Mudar de secção",
    });
    await expect(switcherDialog).toBeVisible();
    await switcherDialog.getByRole("button", { name: "Aparência" }).click();

    await page.waitForURL("**/settings?tab=appearance");

    // 4. Voltar para o Hub
    await backToHubBtn.click();
    await page.waitForURL(
      (url) => url.pathname === "/settings" && !url.searchParams.has("tab"),
    );
    await expect(page.getByPlaceholder(/Pesquisar definição/i)).toBeVisible();
  });

  test("Mobile Filter Bottom Sheet: abre gaveta inferior de filtros nas listagens em ecrã móvel", async ({
    page,
  }) => {
    await login(page, ACCOUNTS.titular);
    await page.goto("/students/list");

    const filterTrigger = page
      .getByRole("button", { name: /Filtros/i })
      .first();
    await expect(filterTrigger).toBeVisible();
    await filterTrigger.click();

    const sheet = page.getByRole("dialog", { name: "Filtros" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { name: "Filtros" })).toBeVisible();
    await expect(
      sheet.getByRole("button", { name: /Limpar tudo/i }),
    ).toBeVisible();
    await expect(
      sheet.getByRole("button", { name: /Aplicar/i }),
    ).toBeVisible();
  });
});

test.describe("Experiência Desktop (>= 768px) — Preservação do Rail Modular e ocultação da Navbar Mobile", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("Oculta a MobileModuleNavbar e exibe o DesktopModuleRail em ecrãs desktop", async ({
    page,
  }) => {
    await login(page, ACCOUNTS.titular);

    const mobileNav = page.getByRole("navigation", {
      name: "Navegação por módulos",
    });
    await expect(mobileNav).toBeHidden();

    await expect(
      page.getByRole("button", { name: "Menu da escola e conta" }),
    ).toBeHidden();
    await expect(page.locator('[data-slot="sidebar-trigger"]')).toBeVisible();

    const desktopRail = page.getByRole("navigation", { name: "Módulos" });
    await expect(desktopRail).toBeVisible();
  });
});
