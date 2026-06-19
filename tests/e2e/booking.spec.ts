import { test, expect } from "@playwright/test";

test.describe("Booking flow", () => {
  test("books an individual service end-to-end", async ({ page }) => {
    await page.goto("/book");

    await page.getByRole("button", { name: /Individual Services/i }).click();
    await page.getByRole("button", { name: /Free B2B Consultations/i }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    await page.locator('input[type="date"]').fill(dateStr);
    await page.getByRole("button", { name: "09:00 AM" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Full Name *").fill("Booking Tester");
    await page.getByLabel("Email *").fill(`book-${Date.now()}@example.com`);
    await page.getByLabel("Phone *").fill("+15551234567");
    await page.getByRole("button", { name: "Review Booking" }).click();

    await expect(page.getByRole("heading", { name: "Confirm Your Booking" })).toBeVisible();
    await page.getByRole("button", { name: "Confirm Booking" }).click();

    await expect(page.getByRole("heading", { name: "Booking Confirmed!" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("books a service package end-to-end", async ({ page }) => {
    await page.goto("/book?type=packs");

    await page.getByRole("button", { name: /Starter Pack/i }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    await page.locator('input[type="date"]').fill(tomorrow.toISOString().split("T")[0]);
    await page.getByRole("button", { name: "10:00 AM" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Full Name *").fill("Package Booker");
    await page.getByLabel("Email *").fill(`pkg-${Date.now()}@example.com`);
    await page.getByLabel("Phone *").fill("+15559876543");
    await page.getByRole("button", { name: "Review Booking" }).click();
    await page.getByRole("button", { name: "Confirm Booking" }).click();

    await expect(page.getByRole("heading", { name: "Booking Confirmed!" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
