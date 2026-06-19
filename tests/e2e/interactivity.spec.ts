import { test, expect, waitForClientHydration } from "./fixtures/base";

test.describe("Client interactivity (production build)", () => {
  test.describe("Mobile viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("hamburger menu is clickable after hydration", async ({
      page,
      assertNoCriticalConsoleErrors,
    }) => {
      await page.goto("/");
      await waitForClientHydration(page);

      const toggle = page.getByRole("button", { name: "Open menu" });
      await expect(toggle).toBeEnabled();

      await toggle.click();
      const menu = page.locator("#mobile-menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("link", { name: "Services" })).toBeVisible();

      await page.getByRole("button", { name: "Close menu" }).click();
      await expect(page.locator("#mobile-menu")).toHaveCount(0);

      assertNoCriticalConsoleErrors();
    });
  });

  test("register form submits without console errors", async ({
    page,
    assertNoCriticalConsoleErrors,
  }) => {
    const email = `interactivity-${Date.now()}@example.com`;

    await page.goto("/register");
    await waitForClientHydration(page);

    await page.getByLabel("Full Name *").fill("Interactivity Test");
    await page.getByLabel("Business Email *").fill(email);
    await page.getByLabel("Password *").fill("testpass123");

    const submit = page.getByRole("button", { name: "Create Account" });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
    assertNoCriticalConsoleErrors();
  });
});
