# Environment Scripts Documentation

## Overview

JTGen **only** uses **port 3001** (proxy) and **port 3002** (local app) for the normal local stack. **Port 3000 is never used** for this project.

These scripts help run the correct branch; optional web-branch previews use **3003** so nothing binds to 3000.

## Available Scripts

### 1. `scripts/start-local-app-always.sh`
- **Purpose**: Always starts the local app on port **3002**
- **Branch**: Automatically switches to `local-environment-working-backup`
- **Ports**: **3002** (React) + **3001** (proxy)
- **Usage**: `./scripts/start-local-app-always.sh`

### 2. `scripts/start-web-app-always.sh`
- **Purpose**: Starts the web-branch React app on port **3003** (not 3000, not 3002)
- **Branch**: Automatically switches to `web-development`
- **Port**: **3003** (React only; no proxy)
- **Usage**: `./scripts/start-web-app-always.sh`

### 3. `scripts/start-both-apps.sh`
- **Purpose**: Starts local + web stacks together
- **Local app**: **3002** on `local-environment-working-backup` + proxy **3001**
- **Web app**: **3003** on `web-development` (never 3000)
- **Usage**: `./scripts/start-both-apps.sh`

## Key features

### Port consistency
- **Proxy:** always **3001**
- **Local JTGen app:** always **3002**
- **Never** **3000** for JTGen
- **Web-branch second instance:** **3003** (when using scripts 2 or 3)

### Branch independence
- You can be on any branch when you run these scripts; each script switches as needed.

## Usage examples

### Start only local app (recommended daily workflow)
```bash
./scripts/start-local-app.sh
# or
./scripts/start-local-app-always.sh
```
- App: **http://localhost:3002**
- Proxy: **http://localhost:3001**

### Start only web app (web branch preview)
```bash
./scripts/start-web-app-always.sh
```
- **http://localhost:3003**

### Start both
```bash
./scripts/start-both-apps.sh
```
- Local: **http://localhost:3002**
- Web: **http://localhost:3003**
- Proxy: **http://localhost:3001**

## Troubleshooting

- If ports are in use: `./scripts/stop-local-app.sh` then retry.
- Ensure scripts are executable: `chmod +x scripts/*.sh`
- Full rules: **`MILESTONES.md`**
