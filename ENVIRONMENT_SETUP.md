# 🚀 Environment Setup Guide

## 📋 Quick Start

### 🏠 Local App (Development)
```bash
./scripts/start-local-app.sh
```
- **URL**: http://localhost:3002
- **Branch**: Always uses `local-environment-working-backup`
- **Proxy**: http://localhost:3001
- **Features**: NO JIRA token button (uses direct token)

### 🌐 Web App (Production)
```bash
./scripts/start-web-app.sh
```
- **URL**: http://localhost:3000
- **Branch**: Always uses `web-development`
- **Features**: JIRA token button + manual token input

## 🔧 Key Features

### ✅ Environment Separation
- **localhost:3002**: Always serves local branch (no matter what branch you're working on)
- **localhost:3000**: Always serves web branch (no matter what branch you're working on)
- **Complete isolation**: Changes in one environment don't affect the other

### 🎯 Port Configuration
- **3000**: Web app (production features)
- **3001**: Proxy server (for local app JAM extraction)
- **3002**: Local app (development features)

### 🔄 Branch Management
- Scripts automatically switch to the correct branch
- You can work on any branch without affecting the running apps
- Each app maintains its own environment-specific code

## 🛠️ Troubleshooting

### If you see JIRA token button on localhost:3002:
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Open Developer Tools → Right-click refresh → "Empty Cache and Hard Reload"
3. **Incognito mode**: Open in private/incognito window

### If apps don't start:
1. **Stop all servers**: `pkill -f "npm start" && pkill -f "node server.js"`
2. **Restart**: Run the appropriate script again

### If you see compilation errors:
1. **Check branch**: Scripts automatically switch to correct branch
2. **Clear node_modules**: `rm -rf node_modules && npm install`
3. **Restart**: Run the script again

## 📁 File Structure
```
scripts/
├── start-local-app.sh    # Starts local app on port 3002
└── start-web-app.sh      # Starts web app on port 3000

src/
├── App.local.js          # Local app component
├── App.web.js            # Web app component
├── index.js              # Entry point (branch-specific)
└── components/
    ├── *.local.js        # Local environment components
    └── *.web.js          # Web environment components
```

## 🎉 Success Indicators
- **localhost:3002**: Shows local app with NO JIRA token button
- **localhost:3000**: Shows web app with JIRA token button
- **No cross-contamination**: Each app maintains its own features
