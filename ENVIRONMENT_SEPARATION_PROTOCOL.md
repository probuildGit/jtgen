# 🔒 ENVIRONMENT SEPARATION PROTOCOL

## **MANDATORY RULES FOR ALL DEVELOPMENT**

### **1. Branch Verification (CRITICAL)**
- **ALWAYS** check current branch before making ANY changes
- **NEVER** commit to wrong environment branch
- **CONFIRM** branch name matches intended environment
- **VERIFY** branch context before proceeding

### **2. Dual Environment Updates (MANDATORY)**
For EVERY feature/change, implement in BOTH environments:

#### **Local Environment (.local.js files)**
- ✅ Create/update `.local.js` versions
- ✅ Use local imports (`../data/formData.local.js`)
- ✅ Use local services (`jiraApiService.local.js`)
- ✅ Use local routes (`localhost:3001`)
- ✅ Test local functionality

#### **Web Environment (.web.js files)**
- ✅ Create/update `.web.js` versions
- ✅ Use web imports (`../data/formData.web.js`)
- ✅ Use web services (`jiraApiService.web.js`)
- ✅ Use web routes (`corsproxy.io`)
- ✅ Test web functionality

### **3. File Structure Rules**
- **NEVER** mix local and web code in same file
- **ALWAYS** create environment-specific versions
- **ALWAYS** use correct import paths with environment suffixes
- **ALWAYS** verify environment detection is working
- **ALWAYS** maintain separate configuration files

### **4. Change Workflow (MANDATORY)**
```
1. Check current branch
2. Implement change in current environment
3. Create/update corresponding file in other environment
4. Update all imports and routes
5. Test both environments independently
6. Commit to correct branch
7. Verify separation maintained
8. Document changes
```

### **5. Quality Gates (NON-NEGOTIABLE)**
- ✅ No web services called in local app
- ✅ No local services called in web app
- ✅ All imports use correct environment suffixes
- ✅ All routes point to correct endpoints
- ✅ Environment detection working properly
- ✅ No cross-environment dependencies

### **6. Import Path Standards**
```javascript
// ✅ CORRECT - Local Environment
import { FORM_LABELS } from '../data/formData.local.js';
import { createJiraTicket } from '../services/jiraApiService.local.js';

// ✅ CORRECT - Web Environment  
import { FORM_LABELS } from '../data/formData.web.js';
import { createJiraTicket } from '../services/jiraApiService.web.js';

// ❌ WRONG - Mixed Environment
import { FORM_LABELS } from '../data/formData.js';
import { createJiraTicket } from '../services/jiraApiService.js';
```

### **7. Service Separation**
```javascript
// ✅ CORRECT - Local Service
const LOCAL_CONFIG = {
  JIRA: {
    BASE_URL: 'http://localhost:3001',
    // ... local config
  }
};

// ✅ CORRECT - Web Service
const WEB_CONFIG = {
  JIRA: {
    BASE_URL: 'https://corsproxy.io/?https%3A%2F%2Fprobuild.atlassian.net',
    // ... web config
  }
};
```

### **8. Component Separation**
```javascript
// ✅ CORRECT - Local Component
export default function JiraTicketForm() {
  // Local-specific logic
  return <div>Local Form</div>;
}

// ✅ CORRECT - Web Component
export default function JiraTicketForm() {
  // Web-specific logic
  return <div>Web Form</div>;
}
```

### **9. Testing Protocol**
- **Local Testing**: Test at `http://localhost:3000`
- **Web Testing**: Test at deployed web URL
- **Environment Detection**: Verify correct service loading
- **Service Calls**: Confirm no cross-environment calls
- **Import Verification**: Check all imports use correct suffixes

### **10. Documentation Requirements**
For each change, document:
- Which environment was modified
- What files were created/updated
- How separation was maintained
- Which branch received the commit
- Testing results for both environments

### **11. Common Pitfalls to Avoid**
- ❌ Using generic imports without environment suffixes
- ❌ Mixing local and web services in same file
- ❌ Committing to wrong branch
- ❌ Forgetting to update both environments
- ❌ Using wrong base URLs for services
- ❌ Not testing both environments

### **12. Emergency Recovery**
If environment separation is broken:
1. **STOP** all development
2. **IDENTIFY** the source of mixing
3. **RESTORE** from clean backup
4. **RE-IMPLEMENT** changes with proper separation
5. **TEST** both environments thoroughly
6. **DOCUMENT** the issue and solution

### **13. Code Review Checklist**
Before any commit:
- [ ] Branch matches intended environment
- [ ] All imports use correct environment suffixes
- [ ] No cross-environment service calls
- [ ] Both environments updated
- [ ] Environment detection working
- [ ] Tests pass in both environments
- [ ] Documentation updated

### **14. Branch Management**
- **Local Development**: `local-environment-working-backup`
- **Web Development**: `web-development`
- **Main Branch**: `main` (production-ready only)
- **Feature Branches**: Environment-specific naming

### **15. File Naming Conventions**
```
src/
├── components/
│   ├── JiraTicketForm.local.js
│   ├── JiraTicketForm.web.js
│   ├── SuccessPopup.local.js
│   └── SuccessPopup.web.js
├── services/
│   ├── jiraApiService.local.js
│   └── jiraApiService.web.js
├── data/
│   ├── formData.local.js
│   └── formData.web.js
└── config/
    ├── config.local.js
    └── config.web.js
```

## **ENFORCEMENT**

This protocol is **MANDATORY** and **NON-NEGOTIABLE**. Any violation of these rules will result in:
1. Immediate rollback of changes
2. Re-implementation with proper separation
3. Additional testing requirements
4. Documentation of the violation

## **SUCCESS METRICS**

- ✅ Zero cross-environment service calls
- ✅ 100% environment-specific file usage
- ✅ All imports use correct suffixes
- ✅ Both environments fully functional
- ✅ Clean separation maintained
- ✅ No mixing of local/web code

---

**Last Updated**: 2025-01-30
**Status**: ACTIVE - MANDATORY PROTOCOL
**Review Frequency**: Every major change
