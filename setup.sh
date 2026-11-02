#!/usr/bin/env sh
set -eu

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 24 LTS o superior es necesario para generar los secretos."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose no está instalado o no está disponible."
  exit 1
fi

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
node "$SCRIPT_DIR/scripts/setup.js"
