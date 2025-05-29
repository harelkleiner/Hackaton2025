const { chromium } = require('playwright');
const fs = require('fs');

// Load data from JSON
const data = JSON.parse(fs.readFileSync('shoppingList.json', 'utf-8'));
const products = data.products;
const delivery = data.delivery;

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  console.log('🔗 Opening Shufersal...');
  await page.goto('https://www.shufersal.co.il/', { waitUntil: 'load' });

  // Accept cookies
  try {
    await page.getByRole('button', { name: 'קבלתי' }).click({ timeout: 3000 });
  } catch {}

  for (let i = 0; i < products.length; i++) {
    const { name: productName } = products[i];
    console.log(`🔍 Searching for: ${productName}`);

    const searchInput = page.getByRole('textbox', { name: 'כפתור/מכווץ מורחב' });
    await searchInput.click();
    await searchInput.fill(''); // clear previous input

    await searchInput.type(productName, { delay: 120 });

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
      console.log(`📍 Setting delivery address: ${delivery.city}, ${delivery.street} ${delivery.number}`);
      await page.getByRole('searchbox', { name: 'כפתור מכווץ/מורחב' }).click();
      await page.getByRole('searchbox', { name: 'כפתור מכווץ/מורחב' }).fill(delivery.city);
      await page.getByText(delivery.city).click();

      await page.getByRole('searchbox', { name: 'שם רחוב' }).click();
      await page.getByRole('searchbox', { name: 'שם רחוב' }).fill(delivery.street.slice(0, 3));
      await page.getByText(delivery.street).click();

      await page.getByRole('textbox', { name: 'מספר' }).click();
      await page.getByRole('textbox', { name: 'מספר' }).fill(delivery.number);
      await page.getByRole('button', { name: 'להמשך' }).click();

      console.log(`⏰ Selecting ${delivery.preferredTime} delivery time`);
      await page.locator(`label:has(span.hour:has-text("${delivery.preferredTime}"))`).first().click();
      await page.getByRole('button', { name: 'שמירה' }).click();
    }

    // Close product popup
    try {
      await page.getByRole('button', { name: new RegExp(`לחץ לסגירת הפופאפ.*${productName}`) }).click();
    } catch {}
  }

  console.log('✅ All products added and delivery set!');
  await page.waitForTimeout(2000);

  const credentials = {
    email: 'harel.kleiner@mail.huji.ac.il',
    password: 'HarelKleiner123!'
  };

  try {
    console.log('💳 Navigating to checkout...');
    await page.getByRole('link', { name: 'לתשלום' }).click();
    console.log('🛒 Redirected to cart summary page.');
  } catch (e) {
    console.error('❌ Could not click the "לתשלום" button');
    await page.screenshot({ path: 'error-checkout.png' });
    throw e;
  }

  try {
    console.log('🔐 Waiting for login page...');
    await page.waitForSelector('#j_username', { timeout: 10000 });
    await page.waitForSelector('#j_password', { timeout: 10000 });

    console.log('✏ Filling credentials...');
    await page.locator('#j_username').fill(credentials.email);
    await page.locator('#j_password').first().fill(credentials.password);

    console.log('✅ Logged in successfully');
  } catch (e) {
    console.error('❌ Login failed');
    await page.screenshot({ path: 'error-login.png' });
    throw e;
  }
})();
