# JTGenWeb (web)

Web JTGen app for creating ProBuild Jira bug tickets (CORS proxy, no local Node proxy).

**Local preview port:** `http://localhost:3003`. Do not use port 3000.

## Start

```bash
npm install
npm start
```

Open **http://localhost:3003**. Use the in-app Settings button to store Jira email and API token in the browser. Do not commit real tokens.

## Deploy

```bash
npm run build
npm run deploy
```

(`deploy` uses `gh-pages` if GitHub Pages is enabled on this repo.)

## Layout

This repository contains the **web** files only (`.web.js`). The local proxy app lives in [JTGenApp](https://github.com/danahen1987/JTGenApp).
