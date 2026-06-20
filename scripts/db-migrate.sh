#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

url="${TURSO_DATABASE_URL:-${DATABASE_URL:-}}"

if [[ "$url" == libsql://* ]]; then
  echo "Applying migrations to Turso/libSQL..."
  npx tsx scripts/apply-libsql-migrations.ts
elif [[ "$url" == file:* ]]; then
  echo "Applying migrations to local SQLite..."
  npx prisma migrate deploy
else
  echo "No database URL configured — skipping migrations"
fi
