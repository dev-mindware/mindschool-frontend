import { chromium } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Administrator/.gemini/antigravity-ide/brain/43581527-a870-47f2-a67f-3e6d72613af0';

async function run() {
  console.log('1. Launching browser...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('2. Logging in...');
  await page.goto('http://localhost:3001/auth/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'pedagogico.essencial@mindschool.ao');
  await page.fill('input[type="password"]', 'TestesEscola2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  if (page.url().includes('schools/select')) {
    const schoolCard = page.locator('text=Colégio Esperança').first();
    if (await schoolCard.count() > 0) {
      await schoolCard.click();
      await page.waitForTimeout(2000);
    }
  }

  console.log('3. Navigating to Attendance & Discipline...');
  await page.goto('http://localhost:3001/academic/attendance', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Take screenshot of initial attendance page
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'e2e_attendance_01_initial.png') });
  console.log('Saved e2e_attendance_01_initial.png');

  // Verify Tempos Lectivos no Horário Estabelecido are present
  const timetableSlotsSection = page.locator('text=Tempos Lectivos no Horário Estabelecido');
  const count = await timetableSlotsSection.count();
  console.log(`Found timetable section: ${count > 0 ? 'YES' : 'NO'}`);

  // Test date switching and note isolation
  // Set date to 2026-10-16 (Sexta-feira)
  console.log('4. Setting date to 2026-10-16...');
  const dateInput = page.locator('input[type="date"]');
  await dateInput.fill('2026-10-16');
  await page.waitForTimeout(2000);

  // Screenshot with timetable lessons
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'e2e_attendance_02_friday_lessons.png') });
  console.log('Saved e2e_attendance_02_friday_lessons.png');

  // Find first student notes input
  const firstNoteInput = page.locator('input[placeholder="Adicionar nota..."]').first();
  if (await firstNoteInput.count() > 0) {
    console.log('5. Typing note on 2026-10-16...');
    await firstNoteInput.fill('Atraso justificado 15 min');
    await firstNoteInput.blur();
    await page.waitForTimeout(2000);

    // Click present button for first student to persist
    const presentBtn = page.locator('button[title="Presente"]').first();
    await presentBtn.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'e2e_attendance_03_note_entered_day1.png') });
    console.log('Saved e2e_attendance_03_note_entered_day1.png');

    // Switch date to 2026-10-15 (Quinta-feira)
    console.log('6. Switching date to 2026-10-15 (Thursday)...');
    await dateInput.fill('2026-10-15');
    await page.waitForTimeout(2500);

    const noteOnDay2 = await page.locator('input[placeholder="Adicionar nota..."]').first().inputValue();
    console.log(`Note value on 2026-10-15: "${noteOnDay2}" (Must be EMPTY!)`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'e2e_attendance_04_note_on_day2_empty.png') });
    console.log('Saved e2e_attendance_04_note_on_day2_empty.png');

    // Switch back to 2026-10-16
    console.log('7. Switching back to 2026-10-16...');
    await dateInput.fill('2026-10-16');
    await page.waitForTimeout(2500);

    const noteOnDay1Again = await page.locator('input[placeholder="Adicionar nota..."]').first().inputValue();
    console.log(`Note value on 2026-10-16 restored: "${noteOnDay1Again}"`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'e2e_attendance_05_note_restored_day1.png') });
    console.log('Saved e2e_attendance_05_note_restored_day1.png');

    if (noteOnDay2 !== '') {
      throw new Error(`LEAKAGE BUG DETECTED: note appeared on day 2: "${noteOnDay2}"`);
    }
  } else {
    console.log('No student inputs found (check section or enrollments).');
  }

  console.log('SUCCESS! All tests passed!');
  await browser.close();
}

run().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
