import { chromium } from '@playwright/test';

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Logging in with TestesEscola2026! ...');
  await page.goto('http://localhost:3001/auth/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'pedagogico.essencial@mindschool.ao');
  await page.fill('input[type="password"]', 'TestesEscola2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('Current URL after login:', page.url());

  // Check if school selection needed
  if (page.url().includes('schools/select')) {
    console.log('Selecting school...');
    const schoolCard = page.locator('text=Colégio Esperança').first();
    if (await schoolCard.count() > 0) {
      await schoolCard.click();
      await page.waitForTimeout(2000);
    }
  }

  console.log('2. Navigating to Timetables...');
  await page.goto('http://localhost:3001/academic/timetables', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log('Timetable URL:', page.url());

  // Check section
  const sectionSelect = await page.$('button[role="combobox"]:has-text("IGF-T1"), button[role="combobox"]:has-text("Turma")');
  if (sectionSelect) {
    const text = await sectionSelect.innerText();
    if (!text.includes('IGF-T1')) {
      await sectionSelect.click();
      await page.waitForTimeout(500);
      const igfOption = await page.$('[role="option"]:has-text("IGF-T1")');
      if (igfOption) {
        await igfOption.click();
        await page.waitForTimeout(1500);
      }
    }
  }

  await page.waitForTimeout(2000);

  // Click Export Horário
  console.log('3. Opening Export Modal...');
  const exportBtn = page.locator('button:has-text("Exportar Horário (PDF)")');
  await exportBtn.waitFor({ state: 'visible', timeout: 10000 });
  await exportBtn.click();
  await page.waitForTimeout(1500);

  // Screenshot export modal
  await page.screenshot({ path: 'C:/Users/Administrator/.gemini/antigravity-ide/brain/43581527-a870-47f2-a67f-3e6d72613af0/e2e_modal_baixar_pdf_only.png' });
  console.log('Screenshot saved to e2e_modal_baixar_pdf_only.png');

  // Verify button text
  const downloadBtn = page.locator('button:has-text("Baixar PDF")');
  const count = await downloadBtn.count();
  console.log(`Found ${count} "Baixar PDF" button(s).`);

  const printTextCount = await page.locator('button:has-text("Imprimir")').count();
  console.log(`Found ${printTextCount} "Imprimir" button(s). (Must be 0)`);

  // Trigger download
  console.log('4. Clicking "Baixar PDF"...');
  await downloadBtn.first().click();
  await page.waitForTimeout(2500);

  console.log('5. Completed successfully!');
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
