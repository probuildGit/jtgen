# JTGenWeb – Requirements

This is the **web** JTGen project. It does not run `server.js`.

## Ports

- Local preview of this web app: **http://localhost:3003** (`npm start`).
- Never use port **3000**.
- The separate local app (JTGenApp) uses proxy **3001** and app **3002**.

## Files

- Edit `.web.js` / web config only.
- Do not add `server.js` or `.local.js` files here.
- Do not commit Jira API tokens. Use the Settings UI or a local untracked config file.
