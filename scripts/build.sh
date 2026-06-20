#!/usr/bin/env bash
set -euo pipefail

if [ -n "${DATABASE_URL:-}" ]; then
  npx prisma migrate deploy
else
  echo "DATABASE_URL not set — skipping prisma migrate deploy"
fi

next build
