import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("home page loads with branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Creative Advertising/i })).toBeVisible();
    await expect(page.getByText("Bi Art").first()).toBeVisible();
  });

  test("core public routes respond", async ({ page }) => {
    for (const path of ["/services", "/packages", "/portfolio", "/contact", "/book"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await expect(page).not.toHaveTitle(/404/);
    }
  });
});
