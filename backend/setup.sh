#!/bin/sh
set -e

if [ -f .env ]; then
  echo ".env already exists, skipping."
  exit 0
fi

cp .env.example .env

# Read DATA_DIR from .env, fall back to ./data (matches docker-compose default)
DATA_DIR=$(grep -E '^DATA_DIR=' .env | cut -d '=' -f2)
DATA_DIR=${DATA_DIR:-./data}

mkdir -p "${DATA_DIR}/db" "${DATA_DIR}/caddy_data" "${DATA_DIR}/caddy_config"

if [ ! -f "${DATA_DIR}/Caddyfile" ]; then
  cp production_example.caddyfile "${DATA_DIR}/Caddyfile"
  echo "Copied Caddyfile to ${DATA_DIR}/Caddyfile."
fi

echo "Generated .env."
echo "Fill in EXTENSION_ID and DOMAIN before running docker compose up."