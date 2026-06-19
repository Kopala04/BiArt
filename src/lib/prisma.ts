import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  if (url.startsWith("file:") && !url.includes(process.cwd())) {
    const filePath = url.replace("file:", "");
    if (!filePath.startsWith("/")) {
      return `file:${path.join(process.cwd(), filePath)}`;
    }
  }
  return url;
}

export function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: getDatabaseUrl() });
  return new PrismaClient({ adapter });
}
