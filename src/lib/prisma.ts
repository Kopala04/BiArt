import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import {
  getDatabaseUrl,
  getTursoAuthToken,
  isLocalFileDatabase,
  isTursoDatabase,
} from "@/lib/database-url";

function resolveFileDatabaseUrl(url: string): string {
  if (!url.startsWith("file:")) return url;
  const filePath = url.replace(/^file:/, "");
  if (filePath.startsWith("/")) return url;
  return `file:${path.join(process.cwd(), filePath)}`;
}

export function createPrismaClient() {
  if (isTursoDatabase()) {
    const adapter = new PrismaLibSql({
      url: getDatabaseUrl(),
      authToken: getTursoAuthToken(),
    });
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaBetterSqlite3({
    url: resolveFileDatabaseUrl(getDatabaseUrl()),
  });
  return new PrismaClient({ adapter });
}

export function getDatabaseKind(): "turso" | "local" {
  return isTursoDatabase() ? "turso" : "local";
}

export { isLocalFileDatabase, isTursoDatabase };
