const { chromium } = require('playwright');

const products = [
  "לחם פרוס אחיד",
  "חלב בקרטון 3% שומן",
  "ביצים"
];

const config = {
  city: "רעננה",
  street: "עקיבא",
  number: "9"
};

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  console.log(`🔗 Opening Shufersal...`);
  await page.goto('https://www.shufersal.co.il/', { waitUntil: 'load' });

  // Accept cookies
  try {
    await page.getByRole('button', { name: 'קבלתי' }).click({ timeout: 3000 });
  } catch {}

  for (let i = 0; i < products.length; i++) {
    const productName = products[i];
    console.log(`🔍 Searching for: ${productName}`);

    const searchInput = page.getByRole('textbox', { name: 'כפתור/מכווץ מורחב' });
    await searchInput.click();
    await searchInput.fill(''); // clear previous input

    if (i === 0) {
      await searchInput.type(productName, { delay: 120 });
    } else {
      await searchInput.type(productName, { delay: 120 });
    }

    await page.locator('button').filter({ hasText: productName }).first().click();

    // Wait for popup and spinner
    await page.waitForSelector('button.miglog-btn-add', { timeout: 10000 });
    await page.waitForSelector('.spinner-container.active', { state: 'detached', timeout: 10000 });
    // Click "הוספה"
    await page.locator('button.miglog-btn-add').first().click({ force: true });
    console.log(`🧺 Added ${productName} to cart`);

    

    // Optional: increase quantity
    try {
      await page.getByRole('button', { name: new RegExp(`הוספה כמות.*${productName}`) }).click();
    } catch {}

    // Only on first product: set address and delivery
    if (i === 0) {
      
      console.log(`📍 Setting delivery address: ${config.city}, ${config.street} ${config.number}`);
      await page.getByRole('searchbox', { name: 'כפתור מכווץ/מורחב' }).click();
      await page.getByRole('searchbox', { name: 'כפתור מכווץ/מורחב' }).fill(config.city);
      await page.getByText(config.city).click();

      await page.getByRole('searchbox', { name: 'שם רחוב' }).click();
      await page.getByRole('searchbox', { name: 'שם רחוב' }).fill(config.street.slice(0, 3));
      await page.getByText(config.street).click();

      await page.getByRole('textbox', { name: 'מספר' }).click();
      await page.getByRole('textbox', { name: 'מספר' }).fill(config.number);
      await page.getByRole('button', { name: 'להמשך' }).click();

      console.log(`⏰ Selecting 12:00 delivery time`);
      await page.locator('label:has(span.hour:has-text("12:00"))').first().click();
      await page.getByRole('button', { name: 'שמירה' }).click();
    }

    // Close product popup
    try {
      await page.getByRole('button', { name: new RegExp(`לחץ לסגירת הפופאפ.*${productName}`) }).click();
    } catch {}
  }

  console.log('✅ All products added and delivery set!');
  await page.waitForTimeout(2000);
})();
