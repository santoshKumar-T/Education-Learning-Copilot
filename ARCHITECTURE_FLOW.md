# Complete Architecture Flow

## Overview

This document describes the complete architecture flow where **ALL** requests go through middleware layers, both on the frontend and backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Components → API Services → API Middleware → Backend API   │
│     (UI)      (auth.api.js)   (api.middleware.js)   (HTTP)  │
│               (chatbot.api.js)                               │
│               (session.api.js)                               │
│               (quiz.api.js)                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Routes → Controllers → Services → Database Middleware → DB  │
│  (/api/*)  (auth.controller)  (auth.service)  (db.middleware)│
│            (chatbot.controller) (session.service)            │
│            (quiz.controller)   (quiz.service)               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### 1. Components Layer
- React components (LandingPage, Dashboard, Chatbot, etc.)
- User interactions and UI rendering

### 2. API Services Layer
- `services/api/auth.api.js` - Authentication API calls
- `services/api/chatbot.api.js` - Chatbot API calls
- `services/api/session.api.js` - Session API calls
- `services/api/quiz.api.js` - Quiz API calls

**All services use the middleware:**
```javascript
import { api } from '../../middleware/api/index.js';

// All requests go through middleware
const response = await api.post('/api/endpoint', data);
```

### 3. API Middleware Layer
- `middleware/api/api.middleware.js` - Core API middleware
- `middleware/api/auth.middleware.js` - Auth utilities

**Middleware handles:**
- URL normalization
- Authentication token injection
- Request/response transformation
- Error handling
- Logging
- Performance tracking

## Backend Architecture

### 1. Routes Layer
- `routes/auth/auth.routes.js` - Auth endpoints
- `routes/chatbot/chatbot.routes.js` - Chatbot endpoints
- `routes/session/session.routes.js` - Session endpoints
- `routes/quiz/quiz.routes.js` - Quiz endpoints

### 2. Controllers Layer
- `controllers/auth.controller.js` - Auth request handling
- `controllers/chatbot.controller.js` - Chatbot request handling
- `controllers/session.controller.js` - Session request handling
- `controllers/quiz.controller.js` - Quiz request handling

**Controllers call services:**
```javascript
import * as authService from '../services/auth/auth.service.mongodb.js';

const result = await authService.registerUser(email, password, name);
```

### 3. Services Layer
- `services/auth/auth.service.mongodb.js` - Auth business logic
- `services/session/session.service.mongodb.js` - Session business logic
- `services/quiz/quiz.service.js` - Quiz generation logic
- `services/openai/chatbot.service.js` - OpenAI integration

**All services use database middleware:**
```javascript
import { dbWrite, dbQuery, safeDbOperation } from '../../middleware/database/index.js';

// All database operations go through middleware
const result = await dbWrite(async () => {
  const user = new User({ ... });
  await user.save();
  return user;
}, { operationName: 'Create User' });
```

### 4. Database Middleware Layer
- `middleware/database/database.middleware.js` - Database operation wrapper

**Database middleware handles:**
- Connection checks
- Error handling and transformation
- Operation logging
- Performance tracking
- Transaction management
- Safe operations (graceful failures)

### 5. Database Layer
- MongoDB via Mongoose
- Models: `User`, `Session`

## Complete Request Flow

### Example: User Registration

```
1. Frontend Component (Register.jsx)
   ↓
2. API Service (auth.api.js)
   ↓ api.post('/api/auth/register', { email, password, name })
3. API Middleware (api.middleware.js)
   - Normalize URL
   - Add headers
   - Skip auth (registration is public)
   ↓ HTTP POST to backend
4. Backend Route (auth.routes.js)
   ↓
5. Backend Controller (auth.controller.js)
   ↓ registerUser(email, password, name)
6. Backend Service (auth.service.mongodb.js)
   ↓ dbWrite(async () => { ... })
7. Database Middleware (database.middleware.js)
   - Check connection
   - Log operation
   - Handle errors
   ↓
8. MongoDB Database
   ↓
9. Response flows back through all layers
```

## Key Principles

### 1. All Frontend API Calls → Middleware
- ✅ No direct `fetch()` calls in components
- ✅ All API services use `api.get()`, `api.post()`, etc.
- ✅ Consistent error handling
- ✅ Automatic authentication

### 2. All Backend Database Operations → Middleware
- ✅ No direct Mongoose calls in services
- ✅ All DB operations use `dbWrite()`, `dbQuery()`, `safeDbOperation()`
- ✅ Consistent error handling
- ✅ Connection checks
- ✅ Operation logging

### 3. Separation of Concerns
- **Components**: UI and user interaction
- **API Services**: API endpoint definitions
- **API Middleware**: Request/response processing
- **Controllers**: Request routing and validation
- **Services**: Business logic
- **Database Middleware**: Database operation processing
- **Database**: Data persistence

## File Structure

```
frontend/src/
├── middleware/
│   └── api/
│       ├── api.middleware.js      ← Frontend API middleware
│       ├── auth.middleware.js     ← Auth utilities
│       └── index.js               ← Exports
├── services/
│   └── api/
│       ├── auth.api.js            ← Uses middleware
│       ├── chatbot.api.js         ← Uses middleware
│       ├── session.api.js         ← Uses middleware
│       └── quiz.api.js            ← Uses middleware

backend/src/
├── middleware/
│   ├── api/                       ← (Future: API-level middleware)
│   └── database/
│       ├── database.middleware.js ← Backend DB middleware
│       └── index.js               ← Exports
├── services/
│   ├── auth/
│   │   └── auth.service.mongodb.js ← Uses DB middleware
│   ├── session/
│   │   └── session.service.mongodb.js ← Uses DB middleware
│   └── quiz/
│       └── quiz.service.js
└── controllers/
    ├── auth.controller.js
    ├── session.controller.js
    └── quiz.controller.js
```

## Benefits

1. **Consistency**: All requests follow the same pattern
2. **Maintainability**: Changes in one place affect all operations
3. **Error Handling**: Centralized and consistent
4. **Logging**: Comprehensive logging at every layer
5. **Performance**: Built-in tracking and optimization
6. **Security**: Centralized authentication and validation
7. **Debugging**: Easy to trace requests through layers

## Usage Examples

### Frontend: Making an API Call

```javascript
// In any component or service
import { api } from '../../middleware/api/index.js';

// GET request
const response = await api.get('/api/session/my-sessions');
const sessions = response.data.sessions;

// POST request
const response = await api.post('/api/auth/register', {
  email: 'user@example.com',
  password: 'password123',
  name: 'User Name'
});
```

### Backend: Database Operation

```javascript
// In any service
import { dbWrite, dbQuery, safeDbOperation } from '../../middleware/database/index.js';

// Write operation
const user = await dbWrite(async () => {
  const newUser = new User({ email, password, name });
  await newUser.save();
  return newUser;
}, { operationName: 'Create User' });

// Query operation
const users = await dbQuery(async () => {
  return await User.find({ isActive: true });
}, { operationName: 'Get Active Users' });

// Safe operation (returns null if DB not connected)
const user = await safeDbOperation(async () => {
  return await User.findById(userId);
}, { operationName: 'Get User By ID' });
```

## Testing

All middleware layers can be tested independently:
- Frontend API middleware: Mock fetch calls
- Backend database middleware: Mock Mongoose operations
- Services: Test with mocked middleware

## Future Enhancements

1. **Request Caching**: Cache layer in API middleware
2. **Rate Limiting**: Rate limiting in API middleware
3. **Request Queuing**: Queue system for database operations
4. **Retry Logic**: Automatic retry for failed requests
5. **Metrics Collection**: Performance metrics at each layer

