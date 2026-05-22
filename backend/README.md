# Backend

Express + Prisma (SQLite) API that fetches and stores YouTube transcripts.

---

## Dev server

```bash
pnpm install       # first time only
pnpm dev           # starts on http://localhost:8080, auto-restarts on save
```

---

## Migrations

Migrations track changes to your database schema. Any time you edit `prisma/schema.prisma`, you need to create and apply a new migration.

**Apply existing migrations** (e.g. after cloning the repo on a new machine):
```bash
pnpm prisma migrate deploy
```

**Create a new migration after changing the schema:**
```bash
pnpm prisma migrate dev --name describe_your_change
```
This generates a new SQL file in `prisma/migrations/`, applies it to the local DB, and regenerates the Prisma client.

**Regenerate the Prisma client without migrating** (rarely needed):
```bash
pnpm prisma generate
```

---

## Production deployment

### 1. Build

```bash
pnpm build
```
Compiles TypeScript to `dist/`. The output is plain JavaScript that Node can run directly — no TypeScript tooling needed on the server.

### 2. Environment file

Create `/etc/ytbackend.env` on the server (readable only by the service user):

```
DATABASE_URL="file:/home/<user>/backend/prod.db"
PORT=8080
API_KEY=<long random string — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

### 3. systemd service

Create `/etc/systemd/system/ytbackend.service`:

```ini
[Unit]
Description=ytbackend Express API
After=network.target

[Service]
User=<your-user>
WorkingDirectory=/path/to/backend
EnvironmentFile=/etc/ytbackend.env
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable --now ytbackend
sudo systemctl status ytbackend
```

### 4. Run migrations on the server

Before starting the service for the first time (and after any schema change):
```bash
pnpm prisma migrate deploy
```
`migrate deploy` (not `migrate dev`) is the production command — it applies pending migrations without creating new ones.

### 5. Caddy reverse proxy

In `/etc/caddy/Caddyfile`:
```
yourdomain.com {
    reverse_proxy 127.0.0.1:8080
}
```

Caddy handles HTTPS automatically. Reload it:
```bash
sudo systemctl reload caddy
```

### 6. Verify

```bash
# Should return 403 (API key missing)
curl https://yourdomain.com/api/videos

# Should return []
curl -H "X-API-Key: <your-key>" https://yourdomain.com/api/videos
```

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/transcripts` | Fetch + store a video. Body: `{ "video_id": "..." }` |
| `GET` | `/api/videos` | List all saved videos (newest first) |
| `GET` | `/api/videos/:video_id` | Get a single video by YouTube ID |
