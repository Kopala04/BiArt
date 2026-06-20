import fs from "node:fs";
import path from "node:path";
import { createPrismaClient } from "@/lib/prisma";
import { getDatabaseUrl, isLocalFileDatabase } from "@/lib/database-url";

function resolveDatabasePath(): string {
  const url = getDatabaseUrl();
  const filePath = url.replace(/^file:/, "");
  return filePath.startsWith("/")
    ? filePath
    : path.join(process.cwd(), filePath);
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  prismaDbPath: string | undefined;
  prismaDbMtimeMs: number | undefined;
};

function shouldReconnect(): boolean {
  if (!isLocalFileDatabase()) return false;

  const dbPath = resolveDatabasePath();
  try {
    const { mtimeMs } = fs.statSync(dbPath);
    return (
      globalForPrisma.prismaDbPath !== dbPath ||
      globalForPrisma.prismaDbMtimeMs !== mtimeMs
    );
  } catch {
    return true;
  }
}

export function getDb() {
  if (!globalForPrisma.prisma || shouldReconnect()) {
    globalForPrisma.prisma = createPrismaClient();
    if (isLocalFileDatabase()) {
      const dbPath = resolveDatabasePath();
      globalForPrisma.prismaDbPath = dbPath;
      try {
        globalForPrisma.prismaDbMtimeMs = fs.statSync(dbPath).mtimeMs;
      } catch {
        globalForPrisma.prismaDbMtimeMs = undefined;
      }
    } else {
      globalForPrisma.prismaDbPath = undefined;
      globalForPrisma.prismaDbMtimeMs = undefined;
    }
  }
  return globalForPrisma.prisma;
}

/** @deprecated Prefer getDb() — kept for existing imports. */
export const db = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get(_target, prop, receiver) {
    const client = getDb();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function isSqliteStaleError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "SQLITE_READONLY_DBMOVED" ||
    e.message?.includes("readonly database") === true
  );
}

export async function withDbRetry<T>(
  operation: (client: ReturnType<typeof createPrismaClient>) => Promise<T>
): Promise<T> {
  try {
    return await operation(getDb());
  } catch (error) {
    if (isSqliteStaleError(error)) {
      globalForPrisma.prisma = undefined;
      globalForPrisma.prismaDbPath = undefined;
      globalForPrisma.prismaDbMtimeMs = undefined;
      return await operation(getDb());
    }
    throw error;
  }
}

if (process.env.NODE_ENV !== "production") {
  getDb();
}
