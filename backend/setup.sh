#!/bin/sh
set -e

if [ -f .env ]; then
  echo ".env already exists, skipping."
  exit 0
fi

cp .env.example .env

API_KEY=$(openssl rand -base64 32)
sed -i "s|^API_KEY=.*|API_KEY=${API_KEY}|" .env

echo "Generated .env with API_KEY."
echo "Fill in EXTENSION_ID and DATA_DIR before running docker compose up."