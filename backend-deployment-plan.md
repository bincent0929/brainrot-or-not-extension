# Plan: Deploy ytbackend Django API to Production (Debian 12 + Caddy)

## Context

`ytbackend/` is a Django 5.2 REST API that fetches YouTube transcripts. It currently runs via `python manage.py runserver` — Django's single-threaded dev server, which is not safe or performant for real traffic. Goal: production deployment on a Debian 12 VPS behind Caddy with HTTPS and API key auth.

---

## Why Each Layer Exists (learning context)

| Layer | Tool | Why |
|-------|------|-----|
| WSGI server | **Gunicorn** | Django's `runserver` is single-threaded and crashes on concurrent requests. Gunicorn forks worker processes. |
| Reverse proxy | **Caddy** | Terminates TLS (HTTPS), routes traffic to Gunicorn, handles HTTP→HTTPS redirects automatically. |
| Process manager | **systemd** | Keeps Gunicorn alive across reboots and crashes. |
| Auth | DRF permission class | Checks `X-API-Key` header; rejects unauthorized requests before any DB work happens. |

---

## Step-by-Step Plan

### Phase 1 — VPS Setup

1. SSH into VPS as a non-root user (or create one)
2. `sudo apt update && sudo apt upgrade -y`
3. Install Python + build tools:
   ```
   sudo apt install python3 python3-pip python3-venv git -y
   ```

### Phase 2 — Deploy Code

4. Copy `ytbackend/` to VPS (git clone the repo, or rsync just the folder)
5. Create a virtualenv and install deps:
   ```
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt gunicorn
   ```
   **Why a venv?** Isolates your project's Python packages from the system Python — avoids version conflicts.

6. Run migrations:
   ```
   python manage.py migrate
   ```

### Phase 3 — Environment Variables

7. Create `/etc/ytbackend.env` (readable only by the service user):
   ```
   DJANGO_DEBUG=False
   DJANGO_SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
   DJANGO_ALLOWED_HOSTS=yourdomain.com
   API_KEY=<choose a long random string>
   ```
   **Why DEBUG=False?** In debug mode Django leaks tracebacks, settings, and SQL queries to the browser. Never expose this publicly.

### Phase 4 — API Key Auth (code change)

8. Add a DRF permission class to `transcripts/permissions.py`:
   - Reads `API_KEY` from settings (sourced from env)
   - Checks `request.headers.get("X-API-Key")` against it
   - Returns 403 if missing/wrong

9. Add `API_KEY = os.environ.get("API_KEY")` to `settings.py`

10. Apply the permission to views in `transcripts/views.py` — set `permission_classes = [ApiKeyPermission]` on each view

**Concept:** DRF's permission system runs before any view logic. The request is rejected at the gate, nothing hits the DB.

### Phase 5 — Systemd Service

11. Create `/etc/systemd/system/ytbackend.service`:
    ```ini
    [Unit]
    Description=ytbackend Gunicorn
    After=network.target

    [Service]
    User=<your-user>
    WorkingDirectory=/path/to/ytbackend
    EnvironmentFile=/etc/ytbackend.env
    ExecStart=/path/to/venv/bin/gunicorn ytbackend.wsgi:application --bind 127.0.0.1:8000 --workers 3
    Restart=on-failure

    [Install]
    WantedBy=multi-user.target
    ```
    **Why `127.0.0.1`?** Binds to loopback only — Gunicorn is NOT internet-accessible directly. Caddy is the only public entry point.
    **Why 3 workers?** Common formula: `2 * CPU cores + 1`.

12. Enable and start: `sudo systemctl enable --now ytbackend`

### Phase 6 — Caddy

13. Install Caddy on Debian:
    ```
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update && sudo apt install caddy
    ```

14. Edit `/etc/caddy/Caddyfile`:
    ```
    yourdomain.com {
        reverse_proxy 127.0.0.1:8000
    }
    ```
    **That's it.** Caddy auto-provisions a Let's Encrypt cert for your domain, handles HTTPS, and proxies all traffic to Gunicorn. HTTP requests get redirected to HTTPS automatically.

15. `sudo systemctl reload caddy`

### Phase 7 — CORS Update

16. The extension's content script runs on `https://www.youtube.com` (already in CORS_ALLOWED_ORIGINS). But the popup/background service worker sends requests from `chrome-extension://...` — CORS doesn't apply to extension requests (they don't go through a browser CORS check). No change needed for now.

17. Add the production domain to `DJANGO_ALLOWED_HOSTS` env var.

---

## Files to Modify

| File | Change |
|------|--------|
| [ytbackend/transcripts/views.py](ytbackend/transcripts/views.py) | Add `permission_classes = [ApiKeyPermission]` to all views |
| [ytbackend/ytbackend/settings.py](ytbackend/ytbackend/settings.py) | Add `API_KEY = os.environ.get("API_KEY")` |
| **New:** `ytbackend/transcripts/permissions.py` | DRF ApiKeyPermission class (~10 lines) |

---

## Verification

1. `sudo systemctl status ytbackend` — should show "active (running)"
2. `curl http://127.0.0.1:8000/api/videos/` from VPS — should return 403 (no API key)
3. `curl -H "X-API-Key: <your-key>" http://127.0.0.1:8000/api/videos/` — should return `[]`
4. From local machine: `curl https://yourdomain.com/api/videos/` — HTTPS working, 403 without key
5. With key: should return valid JSON
6. Load the extension, open YouTube — make sure it still works end-to-end
