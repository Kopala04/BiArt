import { test, expect } from "@playwright/test";
import { format } from "date-fns";

function tomorrowLabel() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return format(tomorrow, "MMMM d, yyyy");
}

async function pickTomorrow(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /Select a date|აირჩიეთ თარიღი/i }).click();
  await page.getByRole("button", { name: tomorrowLabel() }).click();
}

test.describe("Booking flow", () => {
  test("books an individual service end-to-end", async ({ page }) => {
    await page.goto("/book");

    await page.getByRole("button", { name: /Individual Services/i }).click();
    await page.getByRole("button", { name: /Free B2B Consultations/i }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await pickTomorrow(page);
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

    await pickTomorrow(page);
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

  test("deep-linked service skips selection and opens scheduling", async ({ page }) => {
    await page.goto("/book?service=business-cards");

    await expect(page.getByText("Business Cards")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Select a Service/i })
    ).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Select a date/i })).toBeVisible();
  });

  test("deep-linked package skips selection and opens scheduling", async ({ page }) => {
    await page.goto("/book?package=starter-pack");

    await expect(page.getByText(/Starter Pack/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Select a Package/i })
    ).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Select a date/i })).toBeVisible();
  });
});
