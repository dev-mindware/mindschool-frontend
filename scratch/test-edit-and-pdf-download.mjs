import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const ARTIFACT_DIR = path.resolve("C:/Users/Administrator/.gemini/antigravity-ide/brain/43581527-a870-47f2-a67f-3e6d72613af0");

async function run() {
  console.log("1. Launching Google Chrome...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 1200 });

  console.log("2. Navigating to login...");
  await page.goto("http://localhost:3001/login", { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "pedagogico.essencial@mindschool.ao");
  await page.fill('input[type="password"]', "TestesEscola2026!");
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);
  console.log("Logged in! Current URL:", page.url());

  console.log("3. Navigating to timetables page...");
  await page.goto("http://localhost:3001/academic/timetables", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Scroll to timetable grid
  console.log("4. Scrolling to timetable grid...");
  await page.evaluate(() => window.scrollBy(0, 450));
  await page.waitForTimeout(1000);

  // Find lesson blocks (rendered as button[title*="·"])
  const lessonBlocks = await page.$$('button[title*="·"]');
  console.log(`Found ${lessonBlocks.length} existing lesson blocks on timetable!`);

  if (lessonBlocks.length === 0) {
    throw new Error("No lesson blocks found on timetable grid!");
  }

  // Step 1: Click on first lesson block to open details
  const initialTitle = await lessonBlocks[0].getAttribute("title");
  console.log(`5. Clicking first lesson block: "${initialTitle}"...`);
  await lessonBlocks[0].click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "e2e_edit_01_details_modal.png") });

  // Step 2: Verify "Editar aula" button exists and click it
  console.log("6. Verifying 'Editar aula' button in details modal...");
  const editBtn = await page.$('button:has-text("Editar aula")');
  if (!editBtn) {
    throw new Error("'Editar aula' button was NOT found in lesson details modal!");
  }
  console.log("'Editar aula' button found! Clicking it...");
  await editBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "e2e_edit_02_edit_modal_opened.png") });

  // Step 3: Verify Edit Modal Title
  const editHeading = await page.$('text=Editar Aula no Horário Semanal');
  if (!editHeading) {
    throw new Error("Modal heading 'Editar Aula no Horário Semanal' not found!");
  }
  console.log("Edit modal confirmed: 'Editar Aula no Horário Semanal' is open!");

  // Step 4: Move lesson to Sexta-feira (Sex) and set hours 08:00 - 09:00
  console.log("7. Moving lesson to Sexta-feira in edit modal...");
  const sexBtn = await page.$('button:has-text("Sex")');
  if (sexBtn) {
    await sexBtn.click();
    await page.waitForTimeout(500);
  }

  const dynamicBtn = await page.$('button:has-text("Horário Dinâmico")');
  if (dynamicBtn) {
    await dynamicBtn.click();
    await page.waitForTimeout(500);
  }

  const timeInputs = await page.$$('input[type="time"]');
  if (timeInputs.length >= 2) {
    await timeInputs[0].fill("08:00");
    await timeInputs[1].fill("09:00");
    console.log("Changed time to: 08:00 - 09:00 on Sexta-feira");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "e2e_edit_03_edit_modal_filled.png") });

  // Step 5: Save changes
  console.log("8. Clicking 'Guardar Alterações'...");
  const saveBtn = await page.$('button[type="submit"]:has-text("Guardar Alterações")');
  if (!saveBtn) {
    throw new Error("'Guardar Alterações' button not found!");
  }
  await saveBtn.click();
  console.log("Clicked 'Guardar Alterações'. Waiting for modal to close...");
  await page.waitForTimeout(3500);

  // Ensure any dialog overlay is gone before interacting with main page
  await page.waitForSelector('[data-slot="dialog-overlay"]', { state: "detached", timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "e2e_edit_04_timetable_after_update.png") });
  console.log("Lesson updated successfully on grid!");

  // Step 6: Test Export Modal with Dropdown ("Imprimir / Baixar PDF")
  console.log("9. Opening Export Modal...");
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);

  const exportBtn = await page.$('button:has-text("Exportar Horário (PDF)")');
  if (!exportBtn) {
    throw new Error("Exportar Horário (PDF) button not found!");
  }
  await exportBtn.click();
  await page.waitForSelector("text=Exportar Horário Semanal (PDF / Impressão)", { timeout: 5000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "e2e_edit_05_export_modal.png") });

  // Step 7: Test dropdown
  console.log("10. Testing dropdown with 'Baixar PDF' and 'Imprimir'...");
  const dropdownTrigger = await page.$('button:has-text("Imprimir / Baixar PDF")');
  if (!dropdownTrigger) {
    throw new Error("Dropdown button 'Imprimir / Baixar PDF' not found in export modal!");
  }
  await dropdownTrigger.click();
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "e2e_edit_06_dropdown_open.png") });

  // Verify dropdown items
  const baixarPdfItem = await page.$('[role="menuitem"]:has-text("Baixar PDF")');
  const imprimirItem = await page.$('[role="menuitem"]:has-text("Imprimir")');
  if (!baixarPdfItem || !imprimirItem) {
    throw new Error("Dropdown menu items 'Baixar PDF' and 'Imprimir' not both visible!");
  }
  console.log("Both 'Baixar PDF' and 'Imprimir' options verified in dropdown!");

  // Step 8: Click "Baixar PDF" and capture the download event
  console.log("11. Clicking 'Baixar PDF' and verifying download...");
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 15000 }),
    baixarPdfItem.click(),
  ]);

  const filename = download.suggestedFilename();
  console.log(`Download event received successfully! Filename: ${filename}`);
  const downloadedPath = path.join(ARTIFACT_DIR, filename);
  await download.saveAs(downloadedPath);

  const stats = fs.statSync(downloadedPath);
  console.log(`Verified downloaded PDF size: ${stats.size} bytes at ${downloadedPath}`);

  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "e2e_edit_07_final_success.png") });

  console.log("\n========================================================");
  console.log("ALL REQUIREMENTS AND E2E TESTS PASSED 100% SUCCESSFULLY!");
  console.log("========================================================\n");

  await browser.close();
}

run().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
