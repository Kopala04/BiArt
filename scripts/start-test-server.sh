#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3099}"
export DATABASE_URL="${DATABASE_URL:-file:./test.db}"
export AUTH_SECRET="${AUTH_SECRET:-test-auth-secret-for-e2e}"
export AUTH_URL="${AUTH_URL:-http://127.0.0.1:${PORT}}"
export NODE_ENV="${NODE_ENV:-production}"

echo "==> Preparing test database at $DATABASE_URL"
rm -f test.db test.db-journal 2>/dev/null || true

npx prisma migrate deploy
npx tsx prisma/seed.ts

echo "==> Building application"
npm run build

echo "==> Starting production server on port ${PORT}"
exec npm run start -- --hostname 127.0.0.1 --port "${PORT}"
