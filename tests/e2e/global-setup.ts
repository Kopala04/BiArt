import { request } from "@playwright/test";

const PORT = process.env.PORT ?? "3099";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default async function globalSetup() {
  const api = await request.newContext();
  const deadline = Date.now() + 120_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const health = await api.get(`${BASE_URL}/`);
      if (health.ok()) {
        const register = await api.get(`${BASE_URL}/register`);
        const book = await api.get(`${BASE_URL}/book`);
        if (register.ok() && book.ok()) {
          await api.dispose();
          return;
        }
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  await api.dispose();
  throw new Error(
    `Server not ready at ${BASE_URL} within 120s${lastError ? `: ${lastError}` : ""}`
  );
}
