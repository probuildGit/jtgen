# JTGenWeb (web)

Web JTGen app for creating ProBuild Jira bug tickets. The browser talks to a local proxy on port 3004, which calls Jira. That proxy is separate from the JTGenApp proxy on port 3001.

**Local preview:** `http://localhost:3003`. Do not use port 3000.

## Start

```bash
npm install
cp .env.example .env   # then set JIRA_EMAIL and JIRA_API_TOKEN
npm start
```

`npm start` runs the React app on **http://localhost:3003** and the proxy on **http://localhost:3004**. Put Jira credentials in `.env` only. Do not commit real tokens.

## Deploy

```bash
npm run build
npm run deploy
```

(`deploy` uses `gh-pages` if GitHub Pages is enabled on this repo.)

## Layout

This repository contains the **web** files only (`.web.js`). The local proxy app lives in [JTGenApp](https://github.com/danahen1987/JTGenApp).
