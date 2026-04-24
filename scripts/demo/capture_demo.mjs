import fs from "node:fs/promises";
import path from "node:path";
import playwright from "../../.demo-tools/node_modules/playwright/index.js";

const { chromium } = playwright;

const appUrl = process.env.APP_URL || "https://e-commerce-api-beta-eight.vercel.app";
const apiUrl = process.env.API_URL || "https://ecommerce-api-z4q0.onrender.com";
const adminToken = process.env.ADMIN_TOKEN;

if (!adminToken) {
  throw new Error("ADMIN_TOKEN is required");
}

const outputDir = path.resolve("assets/demo/frames");
const timestamp = Date.now();
const customerEmail = `demo.user.${timestamp}@example.com`;
const customerPassword = "demo1234";
const product = {
  name: `Monitor Demo ${timestamp.toString().slice(-4)}`,
  description: "Monitor gamer full HD com alta taxa de atualizacao para jogos e produtividade.",
  price: 1299.9,
  stock: 8,
  sku: `MONITOR-${timestamp}`,
  category: "Electronics",
};

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function registerCustomer() {
  const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: "Demo Customer",
      email: customerEmail,
      password: customerPassword,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to register demo customer: ${await response.text()}`);
  }
}

async function captureAdminFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  await context.addInitScript((token) => {
    window.localStorage.setItem("token", token);
  }, adminToken);

  const page = await context.newPage();
  await page.goto(appUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDir, "01-admin-dashboard.png"), fullPage: true });

  const adminForm = page.locator("form").last();
  await adminForm.getByPlaceholder("Name", { exact: true }).fill(product.name);
  await adminForm.getByPlaceholder("Description").fill(product.description);
  await adminForm.getByPlaceholder("Price").fill(String(product.price));
  await adminForm.getByPlaceholder("Stock").fill(String(product.stock));
  await adminForm.getByPlaceholder("SKU").fill(product.sku);
  await adminForm.getByPlaceholder("Category").fill(product.category);
  await page.screenshot({ path: path.join(outputDir, "02-product-form-filled.png"), fullPage: true });

  await adminForm.getByRole("button", { name: "Save product" }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDir, "03-product-created.png"), fullPage: true });
  await context.close();
}

async function captureCustomerFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  await page.goto(appUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDir, "04-login-screen.png"), fullPage: true });

  await page.locator('input[type="email"]').last().fill(customerEmail);
  await page.locator('input[type="password"]').last().fill(customerPassword);
  await page.screenshot({ path: path.join(outputDir, "05-login-filled.png"), fullPage: true });

  await page.getByRole("button", { name: "Enter dashboard" }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outputDir, "06-customer-logged.png"), fullPage: true });

  const addButtons = page.getByRole("button", { name: "Add" });
  const addCount = await addButtons.count();
  if (addCount === 0) {
    throw new Error("No products available to add to cart");
  }
  await addButtons.last().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, "07-cart-updated.png"), fullPage: true });

  await page.getByRole("button", { name: "Finish checkout" }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDir, "08-checkout-complete.png"), fullPage: true });
  await context.close();
}

async function main() {
  await ensureDir(outputDir);
  await registerCustomer();
  const browser = await chromium.launch({ headless: true });
  try {
    await captureAdminFlow(browser);
    await captureCustomerFlow(browser);
  } finally {
    await browser.close();
  }
}

main();
