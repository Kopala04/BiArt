import { test, expect } from "@playwright/test";

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hamburger opens and closes the menu", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toBeVisible();

    // Desktop nav hidden on mobile (display:none — not in a11y tree)
    await expect(page.locator("header nav.hidden")).toBeHidden();

    await toggle.click();

    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Services" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Book Now" })).toBeVisible();

    // Navigate via menu
    await menu.getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("menu panel is not in DOM when closed", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
  });
});
