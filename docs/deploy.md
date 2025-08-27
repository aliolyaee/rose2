# 🍱 Youtaab + Rose — Production Deployment Guide (Docker + Caddy)

This guide walks you through deploying **two separate apps** (Youtaab and Rose) on the **same server**, behind a single **Caddy** reverse proxy. We’ll start **HTTP-only** (no TLS), then show how to flip on **automatic HTTPS** later.

---

## 0) What you’ll end up with

- **Youtaab** stack on network `youtaab-network`
    - `menu.baniantourism.com` → frontend
    - `api.menu.baniantourism.com` → backend
    - `admin.menu.baniantourism.com` → admin panel

- **Rose** stack on network `rose-network`
    - `rose.baniantourism.com` → frontend
    - `api.rose.baniantourism.com` → backend
    - `admin.rose.baniantourism.com` → admin panel

- **One shared Caddy** container proxying both stacks.

---

## 1) Prerequisites

- Ubuntu/Debian server with:
    - Docker + Docker Compose v2
    - Ports **80** (and later **443**) open to the internet.
- DNS A records for all the domains above pointing to your server’s public IP.
- Project folder layout on the server, for example:
  ```
  /srv/app/
    youtaab/
      docker-compose.yml
      caddy.yaml (optional local copy)
      caddy/ (Dockerfile for YAML adapter)   <-- for HTTPS later
      youtaab-backend-main/
      admin-panel-main/
      youtaab-hotel-front-master/
    rose/
      docker-compose.yml
      rose-backend-main/
      admin-panel-main/
      rose-hotel-front-master/
  ```

---

## 2) Create the shared Docker networks (once)

```bash
docker network create youtaab-network || true
docker network create rose-network || true
```

> Your Youtaab compose will attach services to `youtaab-network`, Rose to `rose-network`, and **Caddy** to both.

---

## 3) Fix/confirm each app’s Dockerfiles

### 3.1 Backend (NestJS) — Dockerfile

- Build in one stage, install prod deps in runtime image.
- **Run DB migrations on container start** via an entrypoint script.

**`rose-backend-main/Dockerfile`** (same pattern for youtaab backend path):
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /usr/src/app

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy build output
COPY --from=builder /usr/src/app/dist ./dist

# Add entrypoint to run migrations then start
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Non-root user (optional)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
```

**`rose-backend-main/docker-entrypoint.sh`** (same for youtaab backend):
```sh
#!/bin/sh
set -e

# Wait for Postgres (simple wait; replace with proper wait-for-it if needed)
echo "Waiting for database..."
sleep 5

echo "Running migrations..."
npm run migration:run || true

echo "Starting app..."
exec "$@"
```

> Make sure your `package.json` has a working script:
> ```json
> { "scripts": { "migration:run": "typeorm-ts-node-commonjs migration:run -d dist/typeorm.config.js" } }
> ```
> Adapt the command to your project’s migration CLI & config.

### 3.2 Admin Panel (Next.js) — Dockerfile

Ensure it listens on **3002** and **0.0.0.0**:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3002
CMD ["npm", "run", "start", "--", "-p", "3002", "-H", "0.0.0.0"]
```

### 3.3 Frontend (Vite build + static serve) — Dockerfile

Use `serve` correctly (the error you had was from a malformed listen flag). Either **Nginx** or Node `serve` is fine. Here’s a simple `serve` version:

```dockerfile
# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Static serve
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve pm2
COPY --from=builder /app/dist ./dist
EXPOSE 5000
# Correct listen syntax:
CMD ["pm2-runtime", "serve", "-s", "dist", "-l", "5000"]
```

> If you prefer Nginx, swap to an nginx image that serves `/usr/share/nginx/html` and copy `dist` there.

---

## 4) Compose files

### 4.1 Youtaab `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: youtaab
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    networks: [youtaab-network]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build: ./youtaab-backend-main
    environment:
      NODE_ENV: production
      PORT: 3000
      DBHOST: postgres
      DBPORT: 5432
      DB: youtaab
      DBUSERNAME: postgres
      DBPASSWORD: postgres
      # replace these secrets in prod!
      ACCESSTOKENJWT: "replace-me"
      REFRESHTOKENJWT: "replace-me"
      COOKIE_SECRET: "replace-me"
      OTP_TOKEN_SECRET: "replace-me"
      PHONE_SECRET_TOKEN: "replace-me"
    ports: ["3000:3000"]
    depends_on:
      postgres:
        condition: service_healthy
    networks: [youtaab-network]

  admin-panel:
    build: ./admin-panel-main
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://api.menu.baniantourism.com
    ports: ["3002:3002"]
    depends_on: [backend]
    networks: [youtaab-network]

  hotel-frontend:
    build: ./youtaab-hotel-front-master
    environment:
      NODE_ENV: production
      VITE_API_URL: http://api.menu.baniantourism.com
    ports: ["5000:5000"]
    depends_on: [backend]
    networks: [youtaab-network]

volumes:
  postgres_data:

networks:
  youtaab-network:
    external: true
```

### 4.2 Rose `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: rose
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5433:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    networks: [rose-network]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build: ./rose-backend-main
    environment:
      NODE_ENV: production
      PORT: 3000
      DBHOST: postgres
      DBPORT: 5432
      DB: rose
      DBUSERNAME: postgres
      DBPASSWORD: postgres
      ACCESSTOKENJWT: "replace-me"
      REFRESHTOKENJWT: "replace-me"
      COOKIE_SECRET: "replace-me"
      OTP_TOKEN_SECRET: "replace-me"
      PHONE_SECRET_TOKEN: "replace-me"
      EMAIL_SECRET_TOKEN: "replace-me"
      SEND_SMS_URL: "https://api.kavenegar.com/v1/{API_KEY}/verify/lookup.json"
    ports: ["3005:3000"]
    depends_on:
      postgres:
        condition: service_healthy
    networks: [rose-network]

  admin-panel:
    build: ./admin-panel-main
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://api.rose.baniantourism.com
    ports: ["3006:3002"]
    depends_on: [backend]
    networks: [rose-network]

  hotel-frontend:
    build: ./rose-hotel-front-master
    environment:
      NODE_ENV: production
      VITE_API_URL: http://api.rose.baniantourism.com
    ports: ["3007:5000"]
    depends_on: [backend]
    networks: [rose-network]

volumes:
  postgres_data:

networks:
  rose-network:
    external: true
```

> Note: the **external** networks must exist (we created them in step 2).

---

## 5) Caddy (HTTP-only first)

### 5.1 Caddy service (shared) — Compose

```yaml
services:
  caddy:
    image: caddy:2.7-alpine
    container_name: caddy
    restart: unless-stopped
    command: ["run", "--config", "/etc/caddy/Caddyfile"]
    ports:
      - "80:80"
      # keep 443 mapped for later HTTPS, or remove now and add later
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - youtaab-network
      - rose-network

volumes:
  caddy_data:
  caddy_config:

networks:
  youtaab-network:
    external: true
  rose-network:
    external: true
```

### 5.2 Caddyfile (HTTP-only; no TLS)

> Save as `Caddyfile` next to the caddy compose.

```caddy
# Youtaab
:80 {
  @youtaabHost host menu.baniantourism.com
  @youtaabApiHost host api.menu.baniantourism.com
  @youtaabAdminHost host admin.menu.baniantourism.com

  handle @youtaabApiHost {
    reverse_proxy backend:3000
  }

  handle @youtaabAdminHost {
    reverse_proxy admin-panel:3002
  }

  handle @youtaabHost {
    # path-based routing on main site
    handle_path /api/* {
      reverse_proxy backend:3000
    }
    handle_path /admin/* {
      reverse_proxy admin-panel:3002
    }
    reverse_proxy hotel-frontend:5000
  }
}

# Rose
:80 {
  @roseHost host rose.baniantourism.com
  @roseApiHost host api.rose.baniantourism.com
  @roseAdminHost host admin.rose.baniantourism.com

  handle @roseApiHost {
    reverse_proxy backend:3000
  }

  handle @roseAdminHost {
    reverse_proxy admin-panel:3002
  }

  handle @roseHost {
    handle_path /api/* {
      reverse_proxy backend:3000
    }
    handle_path /admin/* {
      reverse_proxy admin-panel:3002
    }
    reverse_proxy hotel-frontend:5000
  }
}
```

> Because the caddy container is attached to both networks, service names `backend`, `admin-panel`, and `hotel-frontend` resolve within their respective networks.

---

## 6) Bring everything up

### 6.1 Youtaab
```bash
cd /srv/app/youtaab
docker compose up -d --build
```

### 6.2 Rose
```bash
cd /srv/app/rose
docker compose up -d --build
```

### 6.3 Caddy
```bash
cd /srv/app/youtaab   # or wherever you put the caddy compose
docker compose up -d --build caddy
```

> Visit:
> - http://menu.baniantourism.com
> - http://api.menu.baniantourism.com
> - http://admin.menu.baniantourism.com
> - http://rose.baniantourism.com
> - http://api.rose.baniantourism.com
> - http://admin.rose.baniantourism.com

---

## 7) Run migrations manually (if needed)

If you didn’t wire the entrypoint yet, or want to re-run:

```bash
# Youtaab
cd /srv/app/youtaab
docker compose exec backend npm run migration:run

# Rose
cd /srv/app/rose
docker compose exec backend npm run migration:run
```

---

## 8) Enable HTTPS later (optional)

If you want YAML config and auto-TLS:

1) **Build Caddy with YAML adapter**  
   Create `/srv/app/youtaab/caddy/Dockerfile`:
   ```dockerfile
   FROM caddy:2.7-builder AS builder
   RUN xcaddy build --with github.com/abiosoft/caddy-yaml
   FROM caddy:2.7-alpine
   COPY --from=builder /usr/bin/caddy /usr/bin/caddy
   ```

2) **Switch compose to use the custom image & yaml config:**
   ```yaml
   services:
     caddy:
       build: ./caddy
       command: ["run", "--config", "/etc/caddy/caddy.yaml", "--adapter", "yaml"]
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./caddy.yaml:/etc/caddy/caddy.yaml:ro
         - caddy_data:/data
         - caddy_config:/config
       networks:
         - youtaab-network
         - rose-network
   ```

3) **Create `caddy.yaml`** (auto-TLS on all hosts):
   ```yaml
   apps:
     http:
       servers:
         http:
           listen: [":80"]
           routes:
             - match: { host: ["menu.baniantourism.com"] }
               handle:
                 - handler: subroute
                   routes:
                     - match: { path: ["/api/*"] }
                       handle:
                         - handler: rewrite
                           strip_path_prefix: "/api"
                         - handler: reverse_proxy
                           upstreams: [{ dial: "backend:3000" }]
                       terminal: true
                     - match: { path: ["/admin/*"] }
                       handle:
                         - handler: rewrite
                           strip_path_prefix: "/admin"
                         - handler: reverse_proxy
                           upstreams: [{ dial: "admin-panel:3002" }]
                       terminal: true
                     - handle:
                         - handler: reverse_proxy
                           upstreams: [{ dial: "hotel-frontend:5000" }]
                       terminal: true
             - match: { host: ["api.menu.baniantourism.com"] }
               handle:
                 - handler: reverse_proxy
                   upstreams: [{ dial: "backend:3000" }]
               terminal: true
             - match: { host: ["admin.menu.baniantourism.com"] }
               handle:
                 - handler: reverse_proxy
                   upstreams: [{ dial: "admin-panel:3002" }]
               terminal: true

             - match: { host: ["rose.baniantourism.com"] }
               handle:
                 - handler: subroute
                   routes:
                     - match: { path: ["/api/*"] }
                       handle:
                         - handler: rewrite
                           strip_path_prefix: "/api"
                         - handler: reverse_proxy
                           upstreams: [{ dial: "backend:3000" }]
                       terminal: true
                     - match: { path: ["/admin/*"] }
                       handle:
                         - handler: rewrite
                           strip_path_prefix: "/admin"
                         - handler: reverse_proxy
                           upstreams: [{ dial: "admin-panel:3002" }]
                       terminal: true
                     - handle:
                         - handler: reverse_proxy
                           upstreams: [{ dial: "hotel-frontend:5000" }]
                       terminal: true
             - match: { host: ["api.rose.baniantourism.com"] }
               handle:
                 - handler: reverse_proxy
                   upstreams: [{ dial: "backend:3000" }]
               terminal: true
             - match: { host: ["admin.rose.baniantourism.com"] }
               handle:
                 - handler: reverse_proxy
                   upstreams: [{ dial: "admin-panel:3002" }]
               terminal: true

         https:
           listen: [":443"]
           routes: []  # TLS policies added automatically

     tls:
       automation:
         policies:
           - issuers:
               - module: acme
                 email: "your-email@example.com"
   ```

4) **Reload Caddy**:
   ```bash
   docker compose up -d --build caddy
   ```

---

## 9) Health checks

- **Backend**: expose `/health` and keep your compose healthcheck:
  ```yaml
  healthcheck:
    test: ["CMD-SHELL", "curl -fsS http://localhost:3000/health || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 5
  ```
- **Admin / Frontend**: optional (`curl -fsS http://localhost:3002` / `:5000`)

---

## 10) Troubleshooting (common)

- **502 from Caddy**
    - Container not listening on expected **port**.
    - Wrong hostnames in Caddyfile.
    - Service names must be exactly `backend`, `admin-panel`, `hotel-frontend` as referenced by Caddy.
    - App not bound to `0.0.0.0` (listening only on localhost inside container).

- **Next.js admin not reachable**
    - Ensure `npm run start -- -p 3002 -H 0.0.0.0` is used (see Dockerfile).

- **Frontend “serve” crash**
    - Use: `serve -s dist -l 5000` (or with PM2: `pm2-runtime serve -s dist -l 5000`).

- **Nest EACCES error**
    - Don’t pass `=3000` anywhere; `PORT=3000` only via env, and `app.listen(port)`.

- **Caddy YAML adapter missing**
    - Either use a **Caddyfile**, or build a custom Caddy with the YAML adapter (step 8).

- **Migrations fail: table exists**
    - Align migration history (drop DB in dev, or write `IF NOT EXISTS`/guard logic).
    - Ensure only **one** migration runner—don’t run on both boot and manually at the same time.

---

## 11) Useful commands

```bash
# See logs
docker compose logs -f backend
docker compose logs -f admin-panel
docker compose logs -f hotel-frontend
docker compose logs -f caddy

# Rebuild a single service
docker compose build backend && docker compose up -d backend

# Exec into a container
docker compose exec backend sh

# Prune dangling images/containers
docker system prune -af
```

---

## 12) Security checklist before going live

- Replace all hard-coded secrets with strong values (or use Docker secrets).
- Enable HTTPS (step 8) and confirm ports 80/443 open.
- Ensure your backend **CORS**/cookies are configured for your domains.
- Lock down Postgres exposure (avoid public mapping if not needed).
- Set `NODE_ENV=production` everywhere.

---

That’s it — follow the steps top to bottom and you’ll have **both projects** running behind **one proxy** on the same server. If you want me to adapt the files to your exact repo paths, paste your current tree and I’ll produce copy-paste ready files.