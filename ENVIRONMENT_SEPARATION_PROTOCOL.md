# Environment Separation Protocol

## 🚨 CRITICAL RULES FOR MAINTAINING ENVIRONMENT SEPARATION

### **1. File Naming Convention**
- **Local App**: All files must end with `.local.js`
- **Web App**: All files must end with `.web.js`
- **Shared Files**: No environment suffix (used by both)

### **2. Branch Management**
- **Local App**: `local-environment-working-backup` branch
- **Web App**: `web-development` branch
- **NEVER** make changes to local app files when on web branch
- **NEVER** make changes to web app files when on local branch

### **3. Component Separation**
```
src/components/
├── ComponentName.local.js    # Local app only
├── ComponentName.web.js      # Web app only
└── ComponentName.js          # Shared (if needed)
```

### **4. Hook Separation**
```
src/hooks/
├── useHookName.local.js      # Local app only
├── useHookName.web.js        # Web app only
└── useHookName.js            # Shared (if needed)
```

### **5. Service Separation**
```
src/services/
├── serviceName.local.js      # Local app only
├── serviceName.web.js        # Web app only
└── serviceName.js            # Shared (if needed)
```

### **6. Style Separation**
```
src/styles/
├── componentNameStyles.css   # Component-specific styles
├── formStyles.css           # Form components
├── infoButtonStyles.css     # Info button only
├── jiraTokenStyles.css      # JIRA token components (web only)
├── historyStyles.css        # History components
├── previewStyles.css        # Preview components
└── successStyles.css        # Success components
```

### **7. Data Separation**
```
src/data/
├── formData.local.js         # Local app data
├── formData.web.js           # Web app data
└── formData.js               # Shared data (if needed)
```

### **8. Configuration Separation**
```
src/config/
├── config.local.js           # Local app config
├── config.web.js             # Web app config
└── config.js                 # Shared config (if needed)
```

## 🔒 **ENVIRONMENT ISOLATION RULES**

### **Rule 1: Never Cross-Contaminate**
- ❌ **NEVER** modify `.local.js` files when on `web-development` branch
- ❌ **NEVER** modify `.web.js` files when on `local-environment-working-backup` branch
- ❌ **NEVER** add web-specific features to local app
- ❌ **NEVER** add local-specific features to web app

### **Rule 2: Always Check Branch**
```bash
# Before making ANY changes, check current branch:
git branch --show-current

# If on web-development: Only modify .web.js files
# If on local-environment-working-backup: Only modify .local.js files
```

### **Rule 3: Test Both Environments**
```bash
# After changes, test both:
git checkout local-environment-working-backup
# Test local app functionality

git checkout web-development  
# Test web app functionality
```

### **Rule 4: Style File Separation**
- ✅ **Each component type gets its own CSS file**
- ✅ **No mixing of component styles in same file**
- ✅ **Web-specific styles only in web branch**
- ✅ **Local-specific styles only in local branch**

## 🛡️ **PROTECTION MECHANISMS**

### **1. Pre-commit Hooks**
- Check if modifying wrong environment files
- Prevent cross-contamination
- Ensure proper file naming

### **2. Environment Detection**
- Components detect their environment
- Services use environment-specific endpoints
- Hooks use environment-specific logic

### **3. Import Validation**
- Local components only import `.local.js` files
- Web components only import `.web.js` files
- Shared components import non-suffixed files

## 📋 **CHECKLIST BEFORE MAKING CHANGES**

### **Before Starting Work:**
- [ ] Check current branch: `git branch --show-current`
- [ ] Verify you're on the correct branch for your changes
- [ ] Identify which files need modification
- [ ] Ensure files have correct environment suffix

### **During Development:**
- [ ] Only modify files with correct environment suffix
- [ ] Test changes in current environment
- [ ] Don't modify files from other environment
- [ ] Keep styles separated by component type

### **After Changes:**
- [ ] Test current environment thoroughly
- [ ] Switch to other environment and test
- [ ] Ensure no cross-contamination
- [ ] Commit changes with clear environment message

## 🚨 **EMERGENCY RECOVERY**

### **If Local App Breaks:**
```bash
git checkout local-environment-working-backup
# Check for missing .local.js files
# Restore missing hooks/components
# Test local app functionality
```

### **If Web App Breaks:**
```bash
git checkout web-development
# Check for missing .web.js files
# Restore missing hooks/components
# Test web app functionality
```

### **If Both Apps Break:**
```bash
# Check for cross-contamination
# Restore from last working commit
# Rebuild missing components
# Test both environments
```

## 📝 **COMMIT MESSAGE FORMAT**

### **Local App Changes:**
```
Fix local app [component/feature]

✅ LOCAL APP FIXES:
- Description of changes
- Files modified
- Functionality restored

🔧 COMPONENTS:
- ComponentName.local.js: Description
- HookName.local.js: Description

🎯 STATUS: Local app working
```

### **Web App Changes:**
```
Add web app [component/feature]

✅ WEB APP FEATURES:
- Description of changes
- Files modified
- New functionality added

🔧 COMPONENTS:
- ComponentName.web.js: Description
- HookName.web.js: Description

🎯 STATUS: Web app enhanced
```

## 🎯 **SUCCESS CRITERIA**

### **Local App Success:**
- [ ] All `.local.js` files present
- [ ] No `.web.js` files in local app
- [ ] Local app loads without errors
- [ ] All local functionality working
- [ ] Local styling intact

### **Web App Success:**
- [ ] All `.web.js` files present
- [ ] No `.local.js` files in web app
- [ ] Web app loads without errors
- [ ] All web functionality working
- [ ] Web styling intact

### **Environment Separation Success:**
- [ ] No cross-contamination
- [ ] Both apps independent
- [ ] Changes don't affect other environment
- [ ] Proper file naming maintained
- [ ] Styles properly separated

---

## 🚨 **REMEMBER: ENVIRONMENT SEPARATION IS CRITICAL!**

**NEVER** make changes that affect both environments simultaneously. Always work on one environment at a time and test both after changes.