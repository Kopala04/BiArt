import { test, expect } from "@playwright/test";

test.describe("Consultation upgrade", () => {
  test("prospect with completed consultation can buy pack without new meeting", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-desktop",
      "Shared seed credit — one consumption per test run"
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill("prospect@example.com");
    await page.getByLabel("Password").fill("prospect123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto("/book?upgrade=true");
    await expect(
      page.getByText(/completed consultation/i)
    ).toBeVisible();

    await page.getByRole("button", { name: /Starter Pack/i }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: "How would you like to start?" })
    ).toBeVisible();

    await page.getByRole("button", { name: /Buy & start work/i }).click();

    await expect(page.getByRole("heading", { name: "Your Contact Details" })).toBeVisible();
    await page.getByRole("button", { name: "Review Booking" }).click();

    await expect(page.getByRole("heading", { name: "Confirm Your Booking" })).toBeVisible();
    await expect(page.getByText(/Consultation credit applied/i)).toBeVisible();

    await page.getByRole("button", { name: "Confirm Booking" }).click();
    await expect(page.getByRole("heading", { name: "Booking Confirmed!" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText(/consultation applies — no additional meeting/i)
    ).toBeVisible();
  });
});
