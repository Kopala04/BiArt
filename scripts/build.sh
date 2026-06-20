#!/usr/bin/env bash
set -euo pipefail

bash scripts/db-migrate.sh
next build
