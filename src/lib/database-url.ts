/** Resolved database URL — Turso takes precedence over DATABASE_URL. */
export function getDatabaseUrl(): string {
  return (
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:./dev.db"
  );
}

export function getTursoAuthToken(): string | undefined {
  return process.env.TURSO_AUTH_TOKEN;
}

export function isTursoDatabase(): boolean {
  const url = getDatabaseUrl();
  return url.startsWith("libsql://");
}

export function isLocalFileDatabase(): boolean {
  return getDatabaseUrl().startsWith("file:");
}
