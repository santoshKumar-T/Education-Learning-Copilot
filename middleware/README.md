# Middleware Architecture

This is the **root middleware folder** - the central location for all middleware in the application.

## Structure

```
middleware/
├── shared/                    # Shared utilities (used by both frontend & backend)
│   ├── config/
│   │   └── api.config.js     # API configuration
│   ├── utils/
│   │   ├── error.utils.js    # Error handling utilities
│   │   └── validation.utils.js # Validation utilities
│   └── index.js              # Exports
├── frontend/                 # Frontend-specific middleware (browser environment)
│   └── api/                  # API middleware (imported by frontend/src/middleware/)
│       ├── api.middleware.js
│       ├── auth.middleware.js
│       └── index.js
└── backend/                   # Backend-specific middleware (Node.js environment)
    ├── auth/                  # Auth middleware
    ├── database/              # Database middleware
    ├── logging/               # Logging middleware
    ├── rate-limiting/         # Rate limiting middleware
    └── monitoring/            # Monitoring middleware
```

## Usage

### Frontend
Frontend middleware in `frontend/src/middleware/` imports from `middleware/frontend/`:
```javascript
// frontend/src/middleware/api/api.middleware.js
import { normalizeUrl, API_CONFIG } from '../../../../middleware/shared/index.js';
```

### Backend
Backend middleware in `backend/src/middleware/` imports from `middleware/backend/`:
```javascript
// backend/src/middleware/logging/request-logger.middleware.js
import { createErrorResponse } from '../../../../../middleware/shared/index.js';
```

## Shared Utilities

The `shared/` folder contains utilities that can be used by both frontend and backend:
- **API Configuration**: URL normalization, base URL handling
- **Error Utilities**: Standard error response formats
- **Validation Utilities**: Email, password, required field validation

## Frontend vs Backend

### Frontend Middleware
- Runs in the **browser**
- Uses `fetch`, `localStorage`, browser APIs
- Located in: `middleware/frontend/` (imported by `frontend/src/middleware/`)

### Backend Middleware
- Runs in **Node.js**
- Uses Express, Mongoose, Node.js APIs
- Located in: `middleware/backend/` (imported by `backend/src/middleware/`)

## Migration Plan

1. ✅ **Shared utilities** → `middleware/shared/`
2. 🔄 **Frontend middleware** → Move to `middleware/frontend/`, update imports
3. 🔄 **Backend middleware** → Move to `middleware/backend/`, update imports
4. ✅ **Documentation** → This README

## Benefits

- **Single source of truth**: All middleware in one place
- **Shared utilities**: Reusable code between frontend and backend
- **Clear organization**: Frontend/backend separation
- **Easy to find**: Everything related to middleware is here

