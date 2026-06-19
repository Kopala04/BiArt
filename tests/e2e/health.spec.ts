import { test, expect } from "./fixtures/base";

const PUBLIC_ROUTES = [
  "/",
  "/services",
  "/packages",
  "/portfolio",
  "/contact",
  "/book",
  "/register",
  "/login",
] as const;

test.describe("Health & readiness", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} returns HTTP 200`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.status(), `${route} should be reachable`).toBe(200);
    });
  }

  test("home page has no critical console errors", async ({
    page,
    assertNoCriticalConsoleErrors,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    assertNoCriticalConsoleErrors();
  });

  test("register page has no critical console errors", async ({
    page,
    assertNoCriticalConsoleErrors,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    assertNoCriticalConsoleErrors();
  });
});
