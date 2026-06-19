import { test as base, expect, type Page } from "@playwright/test";

/** Console patterns that indicate broken client-side behavior in production builds. */
const FAILING_CONSOLE_PATTERNS = [
  /hydration failed/i,
  /Minified React error/i,
  /Uncaught/i,
  /TypeError:/i,
  /ReferenceError:/i,
];

/** HMR WebSocket noise only appears in dev — ignored in prod E2E runs. */
const IGNORED_CONSOLE_PATTERNS = [
  /webpack-hmr/i,
  /WebSocket connection to 'ws:\/\//i,
  /Download the React DevTools/i,
];

type ConsoleEntry = { type: string; text: string };

export type ConsoleFixture = {
  consoleErrors: ConsoleEntry[];
  assertNoCriticalConsoleErrors: () => void;
};

export const test = base.extend<ConsoleFixture>({
  consoleErrors: async ({ page }, use) => {
    const entries: ConsoleEntry[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        entries.push({ type: msg.type(), text: msg.text() });
      }
    });

    page.on("pageerror", (error) => {
      entries.push({ type: "pageerror", text: error.message });
    });

    await use(entries);
  },

  assertNoCriticalConsoleErrors: async ({ consoleErrors }, use) => {
    await use(() => {
      const critical = consoleErrors.filter(
        (entry) =>
          !IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(entry.text)) &&
          (entry.type === "pageerror" ||
            FAILING_CONSOLE_PATTERNS.some((pattern) => pattern.test(entry.text)))
      );

      expect(
        critical,
        `Unexpected console errors:\n${critical.map((e) => `[${e.type}] ${e.text}`).join("\n")}`
      ).toEqual([]);
    });
  },
});

export { expect };

/** Wait until React client components are interactive (menu toggle exists). */
export async function waitForClientHydration(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("body")).not.toHaveAttribute("data-hydration-error");
}
