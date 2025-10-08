# 📦 Package.json Separation Guide

## 🎯 Overview
Each environment now has its own `package.json` configuration to ensure complete separation and avoid configuration conflicts.

## 📁 File Structure
```
├── package.json          # Main package.json (backup)
├── package.local.json    # Local environment configuration
├── package.web.json      # Web environment configuration
└── scripts/
    ├── start-local-app.sh    # Uses package.local.json
    └── start-web-app.sh      # Uses package.web.json
```

## 🔧 How It Works

### 🏠 Local Environment
- **File**: `package.local.json`
- **Script**: `./scripts/start-local-app.sh`
- **Configuration**: Uses `react-scripts` (no craco)
- **Port**: 3002
- **Features**: NO JIRA token button

### 🌐 Web Environment  
- **File**: `package.web.json`
- **Script**: `./scripts/start-web-app.sh`
- **Configuration**: Uses `react-scripts` (no craco)
- **Port**: 3000
- **Features**: JIRA token button + manual token input

## 🚀 Usage

### Start Local App
```bash
./scripts/start-local-app.sh
```
- Automatically copies `package.local.json` → `package.json`
- Switches to `local-environment-working-backup` branch
- Starts proxy server on port 3001
- Starts React app on port 3002

### Start Web App
```bash
./scripts/start-web-app.sh
```
- Automatically copies `package.web.json` → `package.json`
- Switches to `web-development` branch
- Starts React app on port 3000

## ✅ Benefits

1. **Complete Separation**: Each environment has its own configuration
2. **No Conflicts**: No more webpack/craco configuration issues
3. **Independent Dependencies**: Each environment can have different dependencies
4. **Easy Maintenance**: Clear separation of concerns
5. **Automatic Switching**: Scripts handle package.json switching automatically

## 🔧 Configuration Details

### Local Environment (package.local.json)
- **Name**: `jtgen-app-local`
- **Scripts**: Standard `react-scripts` commands
- **Dependencies**: Core React dependencies only
- **No**: craco, gh-pages, or web-specific tools

### Web Environment (package.web.json)
- **Name**: `jtgen-app-web`
- **Scripts**: Standard `react-scripts` + deployment commands
- **Dependencies**: Core React dependencies + gh-pages
- **Features**: Deployment-ready configuration

## 🛠️ Troubleshooting

### If you see configuration errors:
1. **Check current package.json**: `cat package.json | grep name`
2. **Restart with correct script**: Use the appropriate startup script
3. **Clear cache**: `rm -rf node_modules/.cache/`

### If apps don't start:
1. **Stop all servers**: `pkill -f "npm start"`
2. **Use dedicated scripts**: `./scripts/start-local-app.sh` or `./scripts/start-web-app.sh`
3. **Check ports**: Ensure ports 3000, 3001, 3002 are available

## 🎉 Success Indicators
- **localhost:3002**: Local app (NO JIRA token button)
- **localhost:3000**: Web app (WITH JIRA token button)
- **No compilation errors**: Each environment uses its own configuration
- **Independent operation**: Changes in one environment don't affect the other
