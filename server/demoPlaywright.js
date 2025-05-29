const { chromium } = require('playwright');

(async () => {
  const productName = 'לחם פרוס אחיד';
  const city = 'רעננה';
  const street = 'עקיבא';
  const number = '9';

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  console.log(`🔗 Opening Shufersal to search for: ${productName}`);
  await page.goto('https://www.shufersal.co.il/', { waitUntil: 'load' });

  // Accept cookies
  try {
    await page.getByRole('button', { name: 'קבלתי' }).click({ timeout: 3000 });
  } catch {}

  // Search input
  await page.getByRole('textbox', { name: 'כפתור/מכווץ מורחב' }).click();
  await page.getByRole('textbox', { name: 'כפתור/מכווץ מורחב' }).fill(productName);

  // Select autocomplete suggestion
  await page.locator('button').filter({ hasText: productName }).first().click();

  // Wait for popup and spinner to clear
  await page.waitForSelector('button.miglog-btn-add', { timeout: 10000 });
  await page.waitForSelector('.spinner-container.active', { state: 'detached', timeout: 10000 });

  // Click add button (force if necessary)
  await page.locator('button.miglog-btn-add').first().click({ force: true });
  console.log(`🧺 Added ${productName} to cart (from popup)`);

  // Try to increase quantity
  try {
    await page.getByRole('button', { name: new RegExp(`הוספה כמות.*${productName}`) }).click();
  } catch {}

  // Select delivery address
  console.log(`📍 Selecting address: ${city}, ${street} ${number}`);
  await page.getByRole('searchbox', { name: 'כפתור מכווץ/מורחב' }).click();
  await page.getByRole('searchbox', { name: 'כפתור מכווץ/מורחב' }).fill(city);
  await page.getByText(city).click();

  await page.getByRole('searchbox', { name: 'שם רחוב' }).click();
  await page.getByRole('searchbox', { name: 'שם רחוב' }).fill(street.slice(0, 3));
  await page.getByText(street).click();

  await page.getByRole('textbox', { name: 'מספר' }).click();
  await page.getByRole('textbox', { name: 'מספר' }).fill(number);
  await page.getByRole('button', { name: 'להמשך' }).click();

  // Select delivery time (first available 12:00)
  console.log('⏰ Selecting first delivery slot with time 12:00...');
  await page.locator('label:has(span.hour:has-text("12:00"))').first().click();
  await page.getByRole('button', { name: 'שמירה' }).click();

  // Close popup
  try {
    await page.getByRole('button', { name: new RegExp(`לחץ לסגירת הפופאפ.*${productName}`) }).click();
  } catch {}

  console.log('✅ Product ordered and delivery set!');
  await page.waitForTimeout(2000);
})();
