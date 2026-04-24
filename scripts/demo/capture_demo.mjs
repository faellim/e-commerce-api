import fs from "node:fs/promises";
import path from "node:path";
import playwright from "../../.demo-tools/node_modules/playwright/index.js";

const { chromium } = playwright;

const appUrl = process.env.APP_URL || "http://127.0.0.1:4173";
const apiUrl = process.env.API_URL || "http://127.0.0.1:8001";

const timestamp = Date.now();
const outputDir = path.resolve("assets/demo/frames");

const admin = {
  full_name: "Admin Demo",
  email: process.env.ADMIN_EMAIL || "admin.demo@example.com",
  password: process.env.ADMIN_PASSWORD || "demo1234",
};

const customer = {
  full_name: "Customer Demo",
  email: process.env.CUSTOMER_EMAIL || `customer.demo.${timestamp}@example.com`,
  password: process.env.CUSTOMER_PASSWORD || "demo1234",
};

const product = {
  name: "Monitor Gamer UltraWide",
  description:
    "Monitor gamer full HD com alta taxa de atualizacao, painel amplo e excelente desempenho para jogos e produtividade.",
  price: 1299.9,
  stock: 8,
  sku: `MONITOR-${timestamp}`,
  category: "Electronics",
};

async function ensureCleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function registerUser(user) {
  const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (response.ok || response.status === 400) {
    return;
  }

  throw new Error(`Failed to register user ${user.email}: ${await response.text()}`);
}

async function login(page, email, password) {
  const emailInputs = page.locator('input[type="email"]');
  const passwordInputs = page.locator('input[type="password"]');
  await emailInputs.last().fill(email);
  await passwordInputs.last().fill(password);
}

async function shoot(page, fileName) {
  await page.screenshot({
    path: path.join(outputDir, fileName),
    fullPage: true,
  });
}

async function captureAdminFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1250 } });
  const page = await context.newPage();

  await page.goto(appUrl, { waitUntil: "networkidle" });
  await shoot(page, "01-home.png");

  await login(page, admin.email, admin.password);
  await shoot(page, "02-admin-login-filled.png");

  await page.getByRole("button", { name: "Enter dashboard" }).click();
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1600);
  await shoot(page, "03-admin-dashboard.png");

  const adminForm = page.locator("form").last();
  await adminForm.getByPlaceholder("Name", { exact: true }).fill(product.name);
  await adminForm.getByPlaceholder("Description").fill(product.description);
  await shoot(page, "04-admin-form-partial.png");

  await adminForm.getByPlaceholder("Price").fill(String(product.price));
  await adminForm.getByPlaceholder("Stock").fill(String(product.stock));
  await adminForm.getByPlaceholder("SKU").fill(product.sku);
  await adminForm.getByPlaceholder("Category").fill(product.category);
  await shoot(page, "05-admin-form-complete.png");

  await adminForm.getByRole("button", { name: "Save product" }).click();
  await page.waitForTimeout(1800);
  await shoot(page, "06-product-created.png");

  await context.close();
}

async function captureCustomerFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1250 } });
  const page = await context.newPage();

  await page.goto(appUrl, { waitUntil: "networkidle" });
  await shoot(page, "07-customer-login-screen.png");

  await login(page, customer.email, customer.password);
  await shoot(page, "08-customer-login-filled.png");

  await page.getByRole("button", { name: "Enter dashboard" }).click();
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1600);
  await shoot(page, "09-customer-dashboard.png");

  const productCard = page.locator(".product-card").last();
  await productCard.getByRole("button", { name: "Add" }).click();
  await page.waitForTimeout(1500);
  await shoot(page, "10-cart-updated.png");

  await page.getByRole("button", { name: "Finish checkout" }).click();
  await page.waitForTimeout(1800);
  await shoot(page, "11-checkout-complete.png");

  await context.close();
}

async function main() {
  await ensureCleanDir(outputDir);
  await registerUser(admin);
  await registerUser(customer);

  const browser = await chromium.launch({ headless: true });
  try {
    await captureAdminFlow(browser);
    await captureCustomerFlow(browser);
  } finally {
    await browser.close();
  }
}

main();
