# Middleware Restructure Plan

## Current Situation

We have middleware in three places:
1. **Root `middleware/`** - Empty placeholder folders
2. **`frontend/src/middleware/`** - Frontend API middleware
3. **`backend/src/middleware/`** - Backend middleware (auth, database, logging, etc.)

## Problem

- Duplication of structure
- Hard to find middleware
- No shared utilities
- Inconsistent organization

## Solution: Use Root Middleware Folder

Restructure to use the root `middleware/` folder as the **single source of truth**:

```
middleware/
├── shared/                    # ✅ Shared utilities (both frontend & backend)
│   ├── config/
│   │   └── api.config.js     # URL normalization, API config
│   ├── utils/
│   │   ├── error.utils.js    # Error handling
│   │   └── validation.utils.js # Validation
│   └── index.js
├── frontend/                 # ✅ Frontend-specific (browser)
│   └── api/
│       ├── api.middleware.js
│       ├── auth.middleware.js
│       └── index.js
└── backend/                   # ✅ Backend-specific (Node.js)
    ├── auth/
    ├── database/
    ├── logging/
    ├── rate-limiting/
    └── monitoring/
```

## Migration Steps

### Step 1: ✅ Create Shared Utilities
- [x] `middleware/shared/config/api.config.js` - URL normalization
- [x] `middleware/shared/utils/error.utils.js` - Error handling
- [x] `middleware/shared/utils/validation.utils.js` - Validation

### Step 2: Move Frontend Middleware
- [ ] Copy `frontend/src/middleware/api/*` → `middleware/frontend/api/`
- [ ] Update `frontend/src/middleware/api/api.middleware.js` to import from root
- [ ] Update all frontend imports to use root middleware

### Step 3: Move Backend Middleware
- [ ] Copy `backend/src/middleware/*` → `middleware/backend/`
- [ ] Update `backend/src/server.js` to import from root
- [ ] Update all backend imports to use root middleware

### Step 4: Update Path Resolution
- [ ] Update `vite.config.js` to resolve `middleware/` paths
- [ ] Update backend imports to use relative paths from root

### Step 5: Clean Up
- [ ] Remove old `frontend/src/middleware/` (or keep as symlinks)
- [ ] Remove old `backend/src/middleware/` (or keep as symlinks)
- [ ] Update documentation

## Benefits

1. **Single Source of Truth**: All middleware in one place
2. **Shared Utilities**: Reusable code between frontend/backend
3. **Clear Organization**: Easy to find and understand
4. **Better Maintainability**: Changes in one place
5. **Scalability**: Easy to add new middleware

## Import Examples

### Frontend
```javascript
// frontend/src/services/api/auth.api.js
import { api } from '../../../middleware/frontend/api/index.js';
import { normalizeUrl } from '../../../middleware/shared/index.js';
```

### Backend
```javascript
// backend/src/server.js
import { requestLogger } from '../../middleware/backend/logging/index.js';
import { createErrorResponse } from '../../middleware/shared/index.js';
```

## Notes

- Frontend and backend **cannot share runtime code** (different environments)
- But they **can share utilities** (config, validation, error handling)
- Use proper path resolution for imports
- Keep frontend/backend separation for environment-specific code

