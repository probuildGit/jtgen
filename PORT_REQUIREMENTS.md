# Port requirements — JTGen

## Allowed ports (local stack)

| Role | Port | URL |
|------|------|-----|
| **Proxy** (JAM, Jira via server) | **3001** | `http://localhost:3001` |
| **Local React app** | **3002** | `http://localhost:3002` |

## Port 3000 — do not use

**Never use port 3000** for JTGen (not for the app, not for the proxy). This project standardizes on **3001** and **3002** only.

## Rules

1. Run the proxy: `node server.js` → listens on **3001**.
2. Run the app: `npm start` → **3002** (see `package.json` and `MILESTONES.md`).
3. Do **not** set `PORT=3000` in `.env`, `.env.local`, or `.env.development.local`.

## Optional web-branch scripts

Legacy scripts that start a **second** React app for the web branch use **port 3003** (never 3000). See `ENVIRONMENT_SCRIPTS.md`.

## Verification

```bash
curl http://localhost:3001/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002
./scripts/check-local-app.sh
```
