# JTGenWeb (web)

Web JTGen app for creating ProBuild Jira bug tickets. The browser talks to a local proxy on port 3004, which calls Jira. That proxy is separate from the JTGenApp proxy on port 3001.

**Local preview:** `http://localhost:3003`. Do not use port 3000.

## Start

```bash
npm install
npm start
```

`npm start` runs the React app on **http://localhost:3003** and the proxy on **http://localhost:3004**. Open the app, click **Auth**, and enter your Jira email and personal API token. The token stays in the browser and is not stored in Git.

## Deploy

The public site is [https://probuildgit.github.io/jtgen/](https://probuildgit.github.io/jtgen/).

```bash
npm run build
npx gh-pages -d build -r https://github.com/probuildGit/jtgen.git
```

## Layout

This repository contains the **web** files only (`.web.js`). The local proxy app lives in [JTGenApp](https://github.com/danahen1987/JTGenApp).
