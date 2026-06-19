import { test, expect } from "@playwright/test";

const uniqueEmail = () => `e2e-${Date.now()}@example.com`;

test.describe("Authentication", () => {
  test("registers a new B2B client and reaches dashboard", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByLabel("Full Name *").fill("E2E Test User");
    await page.getByLabel("Business Email *").fill(email);
    await page.getByLabel("Password *").fill("testpass123");
    await page.getByLabel("Company Name").fill("E2E Corp");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByText("Welcome, E2E Test User")).toBeVisible();
  });

  test("registers without selecting a package", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByLabel("Full Name *").fill("No Package User");
    await page.getByLabel("Business Email *").fill(email);
    await page.getByLabel("Password *").fill("testpass123");
    // Leave package as default empty option
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("logs in with seeded demo client", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("client@example.com");
    await page.getByLabel("Password").fill("client123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByText(/Welcome,/)).toBeVisible();
  });

  test("shows error for invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpass");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });
});
